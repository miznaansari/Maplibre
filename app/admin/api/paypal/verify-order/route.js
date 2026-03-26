import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/requireUser";
import { requireAdmin } from "@/lib/requireAdmin";

export async function POST(req) {
  console.time("paypal:verify:total");

  try {
    const c = await cookies();
    // const authToken = c.get("adminToken")?.value;
    const user = await requireAdmin();

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "orderId required" },
        { status: 400 }
      );
    }

    /* =========================
       FETCH ORDER
    ========================= */
    const order = await prisma.order_list.findUnique({
  where: { id: Number(orderId) },
  include: {
    items: {
      include: {
        product: {
          include: {
            images: {
              where: { is_primary: true },
              take: 1,
              select: {
                id: true,
                image_url: true,
                is_primary: true,
              },
            },
          },
        },
      },
    },

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


    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    /* =========================
       FETCH LATEST PAYPAL PAYMENT
    ========================= */
    const payments = await prisma.payments.findMany({
      where: {
        order_id: order.id,
        provider: "PAYPAL",
      },
      orderBy: { created_at: "desc" },
    });
const transactions = payments.map(p => ({
  id: p.id,
  provider: p.provider,
  providerOrderId: p.provider_order_id,
  providerTxnId: p.provider_txn_id,
  status: p.status,
  amount: p.amount,
  currency: p.currency,
  createdAt: p.created_at,
}));
    console.timeEnd("paypal:verify:total");

    return NextResponse.json({
      success: true,

      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        total: order.total,
        currency: order.currency,
        created_at: order.created_at,
        shipping_address: order.shipping_address,
        shipping_amount: order.shipping_amount,
        tax_amount: order.tax_amount,
        is_paypal: order.is_paypal,
        sub_total: order.sub_total,
        billing_address: order.billing_address,
        customer: order.customer,
      },

      items: order.items,

      paypal: payments.length > 0
        ? transactions
        : {
          status: "Not Found",
        },
    });
  } catch (err) {
    console.error("❌ VERIFY ORDER ERROR:", err);
    console.timeEnd("paypal:verify:total");

    return NextResponse.json(
      { success: false, message: "Verification failed" },
      { status: 500 }
    );
  }
}
