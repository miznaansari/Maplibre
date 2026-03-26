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
        { message: "PayPal orderId required" },
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

    // 🔴 SANDBOX NEGATIVE TESTING (REMOVE IN PROD)
    if (process.env.NODE_ENV === "development") {
      headers["PayPal-Mock-Response"] = JSON.stringify({
        mock_application_codes: "INSTRUMENT_DECLINED",
      });
    }

    const paypalRes = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers,
      }
    );

    const paypalData = await paypalRes.json();

    /* =========================
       HANDLE PAYMENT FAILURE
    ========================= */
    if (!paypalRes.ok) {
      const issue = paypalData?.details?.[0]?.issue || "UNKNOWN_ERROR";

      // Save FAILED payment
      await prisma.payments.create({
        data: {
          order_id: localOrder.id,
          provider: "PAYPAL",
          provider_order_id: orderId,
          provider_txn_id: null,
          amount: localOrder.total_amount ?? 0,
          currency: localOrder.currency,
          status: "FAILED",
          raw_response: paypalData,
        },
      });

      // Update order
      await prisma.order_list.update({
        where: { id: localOrder.id },
        data: {
          status: "PAYMENT_FAILED",
        },
      });

      // Retry allowed
      if (issue === "INSTRUMENT_DECLINED") {
        return NextResponse.json(
          {
            success: false,
            retry: true,
            reason: issue,
            message:
              "Payment method was declined. Please try another payment method.",
          },
          { status: 422 }
        );
      }

      // Hard failure
      return NextResponse.json(
        {
          success: false,
          retry: false,
          reason: issue,
          message: "Payment failed. Please contact support.",
        },
        { status: 400 }
      );
    }

    /* =========================
       SUCCESS CAPTURE
    ========================= */
    const capture =
      paypalData.purchase_units?.[0]?.payments?.captures?.[0];
    console.log('capture.amount',capture)

    if (!capture) {
      throw new Error("PayPal capture missing");
    }
    console.log('capture.amount.value',capture.amount)

    // Save successful payment
    await prisma.payments.create({
      data: {
        order_id: localOrder.id,
        provider: "PAYPAL",
        provider_order_id: orderId,
        provider_txn_id: capture.id,
        amount: capture.amount.value ?? 0,
        currency: capture.amount.currency_code,
        status: "COMPLETED",
        raw_response: paypalData,
      },
    });

    // Update order
    await prisma.order_list.update({
      where: { id: localOrder.id },
      data: {
        status: "PAID",
        is_paypal: true,
      },
    });

    // Clear cart
    await prisma.customer_cart.updateMany({
      where: {
        customer_list_id: customerId,
        is_deleted: false,
      },
      data: {
        is_deleted: true,
      },
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
