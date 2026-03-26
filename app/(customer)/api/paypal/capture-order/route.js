// /api/paypal/capture-order/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PAYPAL_BASE = process.env.PAYPAL_BASE_URL;

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
  return data.access_token;
}

export async function POST(req) {
  try {
    const { orderID, localOrderId } = await req.json();

    if (!orderID || !localOrderId) {
      return NextResponse.json(
        { error: "Missing orderID or localOrderId" },
        { status: 400 }
      );
    }

    const accessToken = await getPayPalAccessToken();

    /* =========================
       CAPTURE PAYPAL ORDER
    ========================= */
    const res = await fetch(
      `${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Capture failed", details: data },
        { status: 500 }
      );
    }

    /* =========================
       EXTRACT CAPTURE DATA
    ========================= */
    const capture =
      data?.purchase_units?.[0]?.payments?.captures?.[0];

    if (!capture) {
      return NextResponse.json(
        { error: "Capture data missing" },
        { status: 500 }
      );
    }

    const providerOrderId = data.id;
    const providerTxnId = capture.id;
    const amount = capture.amount.value;
    const currency = capture.amount.currency_code;

    /* =========================
       MAP STATUSES
    ========================= */
    let paymentStatus = capture.status;
    let orderStatus = "PENDING";

    if (capture.status === "COMPLETED") {
      paymentStatus = "COMPLETED";
      orderStatus = "PAID";
    } else if (capture.status === "PENDING") {
      paymentStatus = "PENDING";
      orderStatus = "PENDING";
    } else {
      paymentStatus = capture.status;
      orderStatus = "PAYMENT_FAILED";
    }

    /* =========================
       UPSERT PAYMENT
    ========================= */
    await prisma.payments.upsert({
      where: {
        order_id_provider_order_id: {
          order_id: Number(localOrderId),
          provider_order_id: providerOrderId,
        },
      },
      update: {
        provider_txn_id: providerTxnId,
        status: paymentStatus,
        raw_response: JSON.stringify(data),
      },
      create: {
        order_id: Number(localOrderId),
        provider: "PAYPAL",
        provider_order_id: providerOrderId,
        provider_txn_id: providerTxnId,
        amount,
        currency,
        status: paymentStatus,
        raw_response: JSON.stringify(data),
      },
    });

    /* =========================
       UPDATE ORDER STATUS
    ========================= */
    await prisma.order_list.update({
      where: { id: Number(localOrderId) },
      data: {
        status: orderStatus,
        is_paypal: true,
      },
    });

    return NextResponse.json({
      success: true,
      providerOrderId,
      providerTxnId,
      paymentStatus,
      orderStatus,
    });
  } catch (error) {
    console.error("CAPTURE ERROR:", error);
    return NextResponse.json(
      { error: "Capture processing failed" },
      { status: 500 }
    );
  }
}
