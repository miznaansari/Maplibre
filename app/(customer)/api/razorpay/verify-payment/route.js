import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      localOrderId,
    } = body;

    const token = await requireUser();
    if (!token?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    /* 🔐 SIGNATURE VERIFY */
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    /* ✅ UPDATE ORDER STATUS */
    const order = await prisma.order_list.update({
      where: { id: localOrderId },
      data: {
        status: "PAID",
      },
    });

    /* 💳 SAVE PAYMENT */
    await prisma.payments.create({
      data: {
        order_id: localOrderId,
        provider: "razorpay",
        provider_order_id: razorpay_order_id,
        provider_txn_id: razorpay_payment_id,
        amount: order.total,
        currency: order.currency,
        status: "SUCCESS",
        raw_response: JSON.stringify(body),
      },
    });

    /* 🛒 CLEAR CART */
    await prisma.customer_cart.updateMany({
      where: {
        customer_list_id: token.id,
        is_deleted: false,
      },
      data: {
        is_deleted: true,
      },
    });

    return NextResponse.json({
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("VERIFY ERROR:", error);

    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}