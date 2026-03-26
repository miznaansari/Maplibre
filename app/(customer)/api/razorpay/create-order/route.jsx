import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const body = await req.json();

    const shippingAddressId = Number(body.shipping_address_id);
    const billingAddressId = Number(body.billing_address_id);
    const deliveryMethod = Number(body.delivery_method);

    const token = await requireUser();
    if (!token?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const customerId = token.id;

    /* CUSTOMER */
    const customer = await prisma.customer_list.findUnique({
      where: { id: customerId },
      select: {
        customer_group_id: true,
        price_tier: true,
      },
    });

    const customerGroupId = customer?.customer_group_id ?? null;
    const priceTier = customer?.price_tier ?? null;

    /* CART */
    const cartItems = await prisma.customer_cart.findMany({
      where: {
        customer_list_id: customerId,
        is_deleted: false,
      },
      include: {
        product: {
          include: {
            pricing: customerGroupId
              ? {
                  where: { customer_group_id: customerGroupId },
                  take: 1,
                }
              : false,
            tier_product_pricing: true,
          },
        },
      },
    });

    if (!cartItems.length) {
      return NextResponse.json({ message: "Cart empty" }, { status: 400 });
    }

    /* ADDRESS */
    const [shippingAddr, billingAddr] = await Promise.all([
      prisma.customer_address.findFirst({
        where: { id: shippingAddressId, customer_list_id: customerId },
      }),
      prisma.customer_address.findFirst({
        where: { id: billingAddressId, customer_list_id: customerId },
      }),
    ]);

    if (!shippingAddr || !billingAddr) {
      return NextResponse.json({ message: "Invalid address" }, { status: 400 });
    }

    const formatAddress = (a) => `
${a.first_name} ${a.last_name ?? ""}
${a.address_1}
${a.city}, ${a.state}
${a.country} - ${a.postal_code}
Phone: ${a.phone}
`.trim();

    const shippingAddress = formatAddress(shippingAddr);
    const billingAddress = formatAddress(billingAddr);

    /* TIER PRICE HELPER */
    const getTierPrice = (tierPricing, tier) => {
      if (!tierPricing || !tier) return null;

      const map = {
        TIER_1: tierPricing.tier_1_price,
        TIER_2: tierPricing.tier_2_price,
        TIER_3: tierPricing.tier_3_price,
        TIER_4: tierPricing.tier_4_price,
        TIER_5: tierPricing.tier_5_price,
        TIER_6: tierPricing.tier_6_price,
        TIER_7: tierPricing.tier_7_price,
        TIER_8: tierPricing.tier_8_price,
        TIER_9: tierPricing.tier_9_price,
        TIER_10: tierPricing.tier_10_price,
      };

      return map[tier] ?? null;
    };

    /* TOTAL CALC */
    let subTotal = 0;

    const orderItems = cartItems.map((item) => {
      const p = item.product;

      let unitPrice = p.sale_price ?? p.regular_price;

      if (p.pricing?.length) {
        unitPrice = p.pricing[0].price;
      } else if (p.tier_product_pricing && priceTier) {
        const tierPrice = getTierPrice(p.tier_product_pricing, priceTier);
        if (tierPrice !== null) unitPrice = Number(tierPrice);
      }

      const lineTotal = unitPrice * item.quantity;
      subTotal += lineTotal;

      return {
        product_list_id: p.id,
        sku: p.sku,
        product_title: p.name,
        unit_price: unitPrice,
        quantity: item.quantity,
        line_total: lineTotal,
      };
    });

    const taxAmount = Number((subTotal * 0.1).toFixed(2));
    const shippingFee = subTotal >= 250 ? 0 : 25;
    const total = Number((subTotal + taxAmount + shippingFee).toFixed(2));

    /* SAVE ORDER */
    const order = await prisma.order_list.create({
      data: {
        order_number: `ORD-${Date.now()}`,
        customer_list_id: customerId,
        status: "CREATED",
        sub_total: subTotal,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        delivery_method: deliveryMethod ? "DELIVERY" : "PICKUP",
        shipping_amount: shippingFee,
        tax_amount: taxAmount,
        total,
        currency: "INR",
        items: { create: orderItems },
      },
    });

    /* RAZORPAY ORDER */
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: "INR",
      receipt: `order_${order.id}`,
      notes: { localOrderId: order.id },
    });

    return NextResponse.json({
      razorpayOrderId: razorpayOrder.id,
      localOrderId: order.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("RAZORPAY ERROR:", error);

    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
