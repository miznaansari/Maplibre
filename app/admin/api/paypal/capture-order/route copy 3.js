import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

const PAYPAL_BASE = process.env.PAYPAL_BASE_URL;

/* =========================
   GET PAYPAL ACCESS TOKEN
========================= */
async function getPayPalAccessToken() {
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

  if (!data.access_token) {
    throw new Error("Failed to get PayPal access token");
  }

  return data.access_token;
}

/* =========================
   CAPTURE PAYPAL ORDER
========================= */
export async function POST(req) {
  try {
    /* =========================
       AUTH
    ========================= */
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    const customerId = payload?.id;

    if (!customerId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    /* =========================
       BODY
    ========================= */
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { message: "PayPal orderId is required" },
        { status: 400 }
      );
    }

    /* =========================
       FIND LOCAL ORDER
    ========================= */
    const localOrder = await prisma.order_list.findFirst({
      where: {
        customer_list_id: customerId,
        status: "PENDING",
      },
      orderBy: { created_at: "desc" },
    });

    if (!localOrder) {
      return NextResponse.json(
        { message: "Local order not found" },
        { status: 404 }
      );
    }

    /* =========================
       PREVENT DOUBLE CAPTURE
    ========================= */
    const existingPayment = await prisma.payments.findFirst({
      where: {
        provider: "PAYPAL",
        provider_order_id: orderId,
        status: "COMPLETED",
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        { message: "Payment already captured" },
        { status: 409 }
      );
    }

    /* =========================
       PAYPAL CAPTURE
    ========================= */
    const accessToken = await getPayPalAccessToken();

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    // 🟡 SANDBOX PENDING NEGATIVE TEST (REMOVE IN PROD)
  // 🟡 SANDBOX NEGATIVE TESTING – CAPTURE ONLY (REMOVE IN PROD)
    
    const paypalRes = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers,
      }
    );
    console.log('paypalRes',paypalRes)
    console.log('paypalRes',paypalRes)

   let paypalData = {};
const text = await paypalRes.text();

if (text) {
  try {
    paypalData = JSON.parse(text);
  } catch (e) {
    console.error("PayPal JSON parse failed:", text);
    paypalData = {};
  }
}

    const statusCode = paypalRes.status;
    const paypalStatus = paypalData?.status;

    const issue =
      paypalData?.details?.[0]?.issue ||
      paypalData?.name ||
      "UNKNOWN_ERROR";

    /* =========================
       HANDLE PENDING PAYMENT
    ========================= */
    if (paypalStatus === "PENDING") {
      console.log('localOrder===================',localOrder)
      await prisma.payments.create({
        data: {
          order_id: localOrder.id,
          provider: "PAYPAL",
          provider_order_id: orderId,
          provider_txn_id: null,
          amount: localOrder.total_amount ?? 0,
          currency: localOrder.currency,
          status: "PENDING",
          raw_response: JSON.stringify(paypalData),
        },
      });

      await prisma.order_list.update({
        where: { id: localOrder.id },
        data: {
          status: "PAYMENT_PENDING",
          is_paypal: true,
        },
      });

      return NextResponse.json({
        success: true,
        pending: true,
        message: "Payment is pending approval",
        paypalStatus: "PENDING",
      });
    }

    /* =========================
       SAVE FAILED PAYMENT
    ========================= */
    async function failPayment(response) {
      await prisma.payments.create({
        data: {
          order_id: localOrder.id,
          provider: "PAYPAL",
          provider_order_id: orderId,
          provider_txn_id: null,
          amount: localOrder.total_amount ?? 0,
          currency: localOrder.currency,
          status: "FAILED",
          raw_response: JSON.stringify(paypalData),
        },
      });

      await prisma.order_list.update({
        where: { id: localOrder.id },
        data: { status: "PAYMENT_FAILED" },
      });

      return NextResponse.json(response.body, {
        status: response.status,
      });
    }

    /* =========================
       HANDLE PAYPAL ERRORS
    ========================= */
    if (statusCode !== 200 && statusCode !== 201) {
      if (statusCode === 422 && issue === "INSTRUMENT_DECLINED") {
        return failPayment({
          status: 422,
          body: {
            success: false,
            retry: true,
            message:
              "Payment was declined. Please try another payment method.",
          },
        });
      }

      return failPayment({
        status: statusCode,
        body: {
          success: false,
          retry: false,
          message: "Payment failed",
        },
      });
    }

    /* =========================
       SUCCESS CAPTURE
    ========================= */
    const capture =
      paypalData.purchase_units?.[0]?.payments?.captures?.[0];

    if (!capture) {
      throw new Error("PayPal capture missing");
    }

    await prisma.payments.create({
      data: {
        order_id: localOrder.id,
        provider: "PAYPAL",
        provider_order_id: orderId,
        provider_txn_id: capture.id,
        amount: capture.amount.value,
        currency: capture.amount.currency_code,
        status: "COMPLETED",
        raw_response: JSON.stringify(paypalData),
      },
    });

    await prisma.order_list.update({
      where: { id: localOrder.id },
      data: {
        status: "PAID",
        is_paypal: true,
      },
    });

    await prisma.customer_cart.updateMany({
      where: {
        customer_list_id: customerId,
        is_deleted: false,
      },
      data: { is_deleted: true },
    });

    /* =========================
       RESPONSE
    ========================= */
    return NextResponse.json({
      success: true,
      message: "Payment captured successfully",
      orderId: localOrder.id,
      paypalOrderId: orderId,
      paypalCaptureId: capture.id,
      amount: capture.amount.value,
      currency: capture.amount.currency_code,
      status: capture.status,
    });
  } catch (error) {
    console.error("PAYPAL CAPTURE ERROR:", error);
    return NextResponse.json(
      { message: "Failed to capture PayPal order" },
      { status: 500 }
    );
  }
}
