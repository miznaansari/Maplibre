import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = Number(searchParams.get("orderId"));

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }

    /* 🔐 AUTH */
    const token = await requireUser();
    if (!token?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const customerId = token.id;

    /* 📦 FETCH ORDER */
    const order = await prisma.order_list.findFirst({
      where: {
        id: orderId,
        customer_list_id: customerId, // 🔥 security (user can only access own order)
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { is_deleted: false },
                  orderBy: { is_primary: "desc" },
                },
              },
            },
          },
        },
        payments: {
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    /* 🧠 FORMAT RESPONSE */
    return NextResponse.json({
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        sub_total: order.sub_total,
        shipping_amount: order.shipping_amount,
        tax_amount: order.tax_amount,
        total: order.total,
        currency: order.currency,
        delivery_method: order.delivery_method,
        created_at: order.created_at,
        billing_address: order.billing_address,
        shipping_address: order.shipping_address,
      },

      items: order.items.map((item) => ({
        id: item.id,
        product_title: item.product_title,
        sku: item.sku,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,

        product: {
          id: item.product.id,
          images: item.product.images,
        },
      })),

      payments: order.payments.map((p) => ({
        id: p.id,
        provider: p.provider,
        provider_order_id: p.provider_order_id,
        provider_txn_id: p.provider_txn_id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        created_at: p.created_at,
      })),
    });
  } catch (error) {
    console.error("GET ORDER ERROR:", error);

    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}