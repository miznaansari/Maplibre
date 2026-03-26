import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/requireUser";

const PAYPAL_BASE = process.env.PAYPAL_BASE_URL;

/* =========================
   GET PAYPAL ACCESS TOKEN
========================= */
async function getPayPalToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();

  if (!res.ok || !data.access_token) {
    throw new Error("Failed to get PayPal token");
  }

  return data.access_token;
}

/* =========================
   VERIFY + CAPTURE ORDER
========================= */
export async function POST(req) {
  const c = await cookies();
  const authToken = c.get("authToken")?.value;
  const userVerify = await requireUser(authToken);
  console.log('userVerify',userVerify)

  if (!userVerify) {  
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  } 


  console.time("paypal:verify:total");

  try {
    const { orderId, paypalOrderId } = await req.json();

    if (!orderId || !paypalOrderId) {
      return NextResponse.json(
        { success: false, message: "orderId and paypalOrderId required" },
        { status: 400 }
      );
    }

    /* =========================
       STEP 1: CHECK EXISTING PAYMENT
       (DO NOT DOWNGRADE COMPLETED)
    ========================= */
    const existingPayment = await prisma.payments.findFirst({
      where: {
        order_id: Number(orderId),
        provider: "PAYPAL",
        provider_order_id: paypalOrderId,
      },
    });

    if (existingPayment?.status === "COMPLETED") {
      const existingOrder = await prisma.order_list.findUnique({
        where: { id: Number(orderId) },
        include: {
          items: true,
          customer: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      console.timeEnd("paypal:verify:total");

      return NextResponse.json({
        success: true,
        alreadyProcessed: true,

        paypal: {
          orderId: paypalOrderId,
          captureId: existingPayment.provider_txn_id,
          status: existingPayment.status,
          amount: existingPayment.amount,
          currency: existingPayment.currency,
        },

        order: {
          id: existingOrder.id,
          order_number: existingOrder.order_number,
          billing_address: existingOrder.billing_address,
          shipping_address: existingOrder.shipping_address,
          status: existingOrder.status,
          total: existingOrder.total,
          currency: existingOrder.currency,
          created_at: existingOrder.created_at,
          customer: existingOrder.customer,
        },

        items: existingOrder.items,

        payment: {
          id: existingPayment.id,
          provider: existingPayment.provider,
          status: existingPayment.status,
          created_at: existingPayment.created_at,
        },
      });
    }

    /* =========================
       STEP 2: FETCH PAYPAL ORDER
    ========================= */
    const token = await getPayPalToken();

    const orderRes = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const paypalOrder = await orderRes.json();

    if (!orderRes.ok) {
      throw new Error("Failed to fetch PayPal order");
    }

    if (
      paypalOrder.status !== "APPROVED" &&
      paypalOrder.status !== "COMPLETED"
    ) {
      console.timeEnd("paypal:verify:total");
      return NextResponse.json({
        success: false,
        paypalStatus: paypalOrder.status,
      });
    }

    /* =========================
       STEP 3: CAPTURE (ONLY IF NEEDED)
    ========================= */
    let captureResponse = paypalOrder;

    if (paypalOrder.status !== "COMPLETED") {
      const captureRes = await fetch(
        `${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      captureResponse = await captureRes.json();

      if (!captureRes.ok) {
        throw new Error("PayPal capture failed");
      }
    }

    const capture =
      captureResponse.purchase_units?.[0]?.payments?.captures?.[0];

    if (!capture) {
      throw new Error("PayPal capture missing");
    }

    /* =========================
       STEP 4: MAP STATUS
    ========================= */
    let orderStatus = "PENDING";

    if (capture.status === "COMPLETED") {
      orderStatus = "PAID";
    } else if (capture.status !== "PENDING") {
      orderStatus = "PAYMENT_FAILED";
    }

    /* =========================
       STEP 5: UPDATE ORDER
    ========================= */
    const updatedOrder = await prisma.order_list.update({
      where: { id: Number(orderId) },
      data: {
        status: orderStatus,
        is_paypal: true,
      },
      include: {
        items: true,
        customer: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    /* =========================
       STEP 6: UPSERT PAYMENT (SAFE)
    ========================= */
    const paymentRecord = await prisma.payments.upsert({
      where: {
        order_id_provider_order_id: {
          order_id: updatedOrder.id,
          provider_order_id: paypalOrderId,
        },
      },
      update: {
        provider_txn_id: capture.id,
        status: capture.status,
        raw_response: JSON.stringify(captureResponse),
      },
      create: {
        order_id: updatedOrder.id,
        provider: "PAYPAL",
        provider_order_id: paypalOrderId,
        provider_txn_id: capture.id,
        amount: capture.amount.value,
        currency: capture.amount.currency_code,
        status: capture.status,
        raw_response: JSON.stringify(captureResponse),
      },
    });

    /* =========================
       STEP 7: CLEAR CART (ONLY PAID)
    ========================= */
    if (capture.status === "COMPLETED") {
      await prisma.customer_cart.updateMany({
        where: {
          customer_list_id: updatedOrder.customer_list_id,
          is_deleted: false,
        },
        data: { is_deleted: true },
      });
    }

    console.timeEnd("paypal:verify:total");

    /* =========================
       FINAL RESPONSE (UNCHANGED)
    ========================= */
    return NextResponse.json({
      success: true,

      paypal: {
        orderId: paypalOrderId,
        captureId: capture.id,
        status: capture.status,
        amount: capture.amount.value,
        currency: capture.amount.currency_code,
      },

      order: {
        id: updatedOrder.id,
        order_number: updatedOrder.order_number,
        status: updatedOrder.status,
        shipping_address: updatedOrder.shipping_address,
        billing_address: updatedOrder.billing_address,
        total: updatedOrder.total,
        currency: updatedOrder.currency,
        created_at: updatedOrder.created_at,
        customer: updatedOrder.customer,
      },

      items: updatedOrder.items,

      payment: {
        id: paymentRecord.id,
        provider: paymentRecord.provider,
        status: paymentRecord.status,
        created_at: paymentRecord.created_at,
      },
    });
  } catch (err) {
    console.error("❌ PAYPAL VERIFY ERROR:", err);
    console.timeEnd("paypal:verify:total");

    return NextResponse.json(
      { success: false, message: "Payment verification failed" },
      { status: 500 }
    );
  }
}
