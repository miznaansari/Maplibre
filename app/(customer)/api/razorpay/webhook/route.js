import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    console.log("🔔 Razorpay webhook received");

    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    console.log("🖊 Signature:", signature);

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.error("❌ RAZORPAY_WEBHOOK_SECRET missing");
      return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
    }

    if (!signature) {
      console.error("❌ No signature header received");
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== signature) {
      console.error("❌ Signature mismatch");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    console.log("✅ Signature verified");

    const event = JSON.parse(body);

    console.log("📢 Event:", event.event);

    if (event.event === "order.paid") {
      const payment = event.payload.payment.entity;

      const localOrderId = payment.notes?.localOrderId;

      console.log("🧾 Local Order:", localOrderId);

      if (!localOrderId) {
        console.error("❌ localOrderId missing");
        return NextResponse.json({ error: "Missing order id" }, { status: 400 });
      }

      await prisma.order_list.update({
        where: { id: Number(localOrderId) },
        data: { status: "PAID" },
      });

      console.log("✅ Order updated");

      await prisma.payments.create({
        data: {
          order_id: Number(localOrderId),
          provider: "razorpay",
          provider_order_id: payment.order_id,
          provider_txn_id: payment.id,
          amount: payment.amount / 100,
          currency: payment.currency,
          status: "SUCCESS",
          raw_response: JSON.stringify(event),
        },
      });

      console.log("✅ Payment stored");
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("🔥 Webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}