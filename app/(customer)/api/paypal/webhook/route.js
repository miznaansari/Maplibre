import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Get PayPal Access Token
 */
async function getPayPalAccessToken() {
  try {
    console.log("🔑 [PayPal] Fetching access token...");

    const res = await fetch(`${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ [PayPal] Token error:", data);
      throw new Error("PayPal token fetch failed");
    }

    console.log("✅ [PayPal] Access token received");
    return data.access_token;
  } catch (err) {
    console.error("🔥 [PayPal] getPayPalAccessToken error:", err);
    throw err;
  }
}

/**
 * Verify PayPal Webhook Signature
 */
async function verifyWebhook(headers, webhookEvent) {
  try {
    console.log("🔐 [Webhook] Verifying PayPal signature...");

    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
      `${process.env.PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth_algo: headers.get("paypal-auth-algo"),
          cert_url: headers.get("paypal-cert-url"),
          transmission_id: headers.get("paypal-transmission-id"),
          transmission_sig: headers.get("paypal-transmission-sig"),
          transmission_time: headers.get("paypal-transmission-time"),
          webhook_id: process.env.PAYPAL_WEBHOOK_ID,
          webhook_event: webhookEvent,
        }),
      }
    );

    const data = await response.json();

    console.log("📜 [Webhook] Verification response:", data);

    // Return TRUE only if PayPal confirmed it’s VALID
    return data.verification_status === "SUCCESS";
  } catch (error) {
    console.error("🔥 [Webhook] Signature verification failed:", error);
    return false;
  }
}



export async function POST(req) {
  console.log("📩 [Webhook] PayPal webhook received");

  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);

    console.log("📦 [Webhook] Event Type:", body.event_type);
    console.log("🆔 [Webhook] Event ID:", body.id);

    // 1️⃣ Verify webhook
    const isValid = await verifyWebhook(req.headers, body);
    console.log('isValid', isValid)
    if (!isValid) {
      console.error("❌ [Webhook] Invalid PayPal signature");
      return NextResponse.json(
        { error: "Invalid PayPal signature" },
        { status: 400 }
      );
    }

    console.log("✅ [Webhook] Signature verified");

    const eventType = body.event_type;
    const resource = body.resource;

    // PayPal IDs
    // const providerOrderId =
    //   resource?.supplementary_data?.related_ids?.order_id;
    const providerOrderId =
      resource?.supplementary_data?.related_ids?.order_id || resource?.id;
    const providerTxnId = resource?.id;

    // 🔥 Extract capture_id from refund link
    // const captureLink = resource?.links?.find(l => l.rel === "up")?.href;
    // const providerTxnId = captureLink ? captureLink.split("/").pop() : resource?.id;


    const amount = resource?.amount?.value;
    const currency = resource?.amount?.currency_code;
    console.log('===========================resource=========================')
    console.log('resource', resource)

    console.log("🧾 [Payment] Order ID:", providerOrderId);
    console.log("💳 [Payment] Transaction ID:", providerTxnId);
    console.log("💰 [Payment] Amount:", amount, currency);

    let payment;

    if (eventType === "PAYMENT.CAPTURE.REFUNDED") {
      // 🔥 Refund mapping via capture_id
      payment = await prisma.payments.findFirst({
        where: {
          provider: "PAYPAL",
          provider_txn_id: providerTxnId, // capture_id
        },
        include: { order: true },
      });
    } else {
      // Normal flow via paypal_order_id
      payment = await prisma.payments.findFirst({
        where: {
          provider: "PAYPAL",
          provider_order_id: providerOrderId,
        },
        include: { order: true },
      });
    }


    if (!payment || !payment.order) {
      console.error("❌ [DB] Payment or Order not found:", providerOrderId);
      return NextResponse.json({ message: "Order not found" });
    }


    console.log("✅ [DB] Order found:", payment.order_id);

    // 3️⃣ Determine statuses
    let paymentStatus = "PENDING";
    let orderStatus = payment.order.status;


    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED":
        paymentStatus = "COMPLETED";
        orderStatus = "PAID";
        break;

      case "PAYMENT.CAPTURE.DENIED":
        paymentStatus = "FAILED";
        orderStatus = "PAYMENT_FAILED";
        break;

      case "PAYMENT.CAPTURE.REFUNDED":
        paymentStatus = "REFUNDED";
        orderStatus = "REFUNDED";
        break;

      default:
        console.warn("⚠️ [Webhook] Unhandled event:", eventType);
        return NextResponse.json({ message: "Unhandled event" });
    }

    console.log(
      "🔄 [Status] Payment:",
      paymentStatus,
      "| Order:",
      orderStatus
    );

    // 4️⃣ Upsert payment
    await prisma.payments.upsert({
      where: {
        order_id_provider_order_id: {
          order_id: payment.order_id,
          provider_order_id: providerOrderId,
        },
      },
      update: {
        provider_txn_id: providerTxnId,
        status: paymentStatus,
        raw_response: JSON.stringify(body),
      },
      create: {
        order_id: payment.order_id,
        provider: "PAYPAL",
        provider_order_id: providerOrderId,
        provider_txn_id: providerTxnId,
        amount,
        currency,
        status: paymentStatus,
        raw_response: JSON.stringify(body),
      },
    });

    console.log("💾 [DB] Payment record saved/updated");

    // 5️⃣ Update order status
    await prisma.order_list.update({
      where: { id: payment.order_id },
      data: {
        status: orderStatus,
        is_paypal: true,
      },
    });

    console.log("📦 [DB] Order status updated");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("🔥 [Webhook] Fatal error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
