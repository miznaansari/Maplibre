import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

/* =========================
   CREATE PURCHASE ORDER
========================= */
export async function POST(req) {
  const body = await req.json();

  const shippingAddressId = Number(body.shipping_address_id);
  const billingAddressId = Number(body.billing_address_id);
  const deliveryMethod = Number(body.delivery_method); // 0 pickup, 1 delivery
  const purchaseOrderNumber = body.order_number; // USER PROVIDED

  if (
    !purchaseOrderNumber ||
    !Number.isInteger(shippingAddressId) ||
    !Number.isInteger(billingAddressId) ||
    ![0, 1].includes(deliveryMethod)
  ) {
    return NextResponse.json(
      { message: "Invalid purchase order data" },
      { status: 400 }
    );
  }

  try {
    /* =========================
       AUTH
    ========================= */
    const token = await requireUser();
    if (!token?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const existing = await prisma.order_list.findUnique({
  where: { order_number: purchaseOrderNumber }
});

if (existing) {
  return NextResponse.json(
    { message: "Purchase order number already exists" },
    { status: 409 }
  );
}


    const customerId = token.id;

    /* =========================
       CUSTOMER
    ========================= */
    const customer = await prisma.customer_list.findUnique({
      where: { id: customerId },
      select: {
        customer_group_id: true,
        price_tier: true,
      },
    });

    const customerGroupId = customer?.customer_group_id ?? null;
    const priceTier = customer?.price_tier ?? null;

    /* =========================
       CART
    ========================= */
    const cartItems = await prisma.customer_cart.findMany({
      where: {
        customer_list_id: customerId,
        is_deleted: false,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            regular_price: true,
            sale_price: true,
            stepper_value: true,
            stock_qty: true,     // ✅
            is_active: true,     // ✅
            pricing: customerGroupId
              ? { where: { customer_group_id: customerGroupId }, take: 1 }
              : false,
            tier_product_pricing: true,
          },
        },
      },
    });

    if (!cartItems.length) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    /* =========================
       PRODUCT VALIDATION
    ========================= */
    for (const item of cartItems) {
      const p = item.product;

      if (!p.is_active) {
        return NextResponse.json(
          { message: `Product "${p.name}" is not available` },
          { status: 400 }
        );
      }

      if (p.stock_qty <= 0) {
        return NextResponse.json(
          { message: `Product "${p.name}" is out of stock` },
          { status: 400 }
        );
      }

      if (item.quantity > p.stock_qty) {
        return NextResponse.json(
          {
            message: `Only ${p.stock_qty} units available for "${p.name}"`,
          },
          { status: 400 }
        );
      }

      if (p.stepper_value && item.quantity % p.stepper_value !== 0) {
        return NextResponse.json(
          {
            message: `Quantity for "${p.name}" must be multiple of ${p.stepper_value}`,
          },
          { status: 400 }
        );
      }
    }

    /* =========================
       ADDRESS
    ========================= */
    const [shippingAddr, billingAddr] = await Promise.all([
      prisma.customer_address.findFirst({
        where: {
          id: shippingAddressId,
          customer_list_id: customerId,
          is_deleted: false,
        },
      }),
      prisma.customer_address.findFirst({
        where: {
          id: billingAddressId,
          customer_list_id: customerId,
          is_deleted: false,
        },
      }),
    ]);

    if (!shippingAddr || !billingAddr) {
      return NextResponse.json(
        { message: "Invalid address" },
        { status: 400 }
      );
    }

    const formatAddress = (a) => `
${a.first_name} ${a.last_name ?? ""}
${a.company ?? ""}
${a.address_1}
${a.address_2 ?? ""}
${a.city}, ${a.state}
${a.country} - ${a.postal_code}
Phone: ${a.phone}
Email: ${a.email}
`.trim();

    /* =========================
       TIER PRICE HELPER
    ========================= */
    const getTierPrice = (tierPricing, tier) => {
      if (!tierPricing || !tier) return null;
      return tierPricing[`tier_${tier.split("_")[1]}_price`] ?? null;
    };

    /* =========================
       TOTAL CALC
    ========================= */
    let subTotal = 0;

    const orderItems = cartItems.map((item) => {
      const p = item.product;
      let unitPrice = p.sale_price ?? p.regular_price;

      if (p.pricing?.length) {
        unitPrice = p.pricing[0].price;
      } else if (p.tier_product_pricing && priceTier) {
        const tierPrice = getTierPrice(p.tier_product_pricing, priceTier);
        if (tierPrice !== null) unitPrice = tierPrice;
      }

      unitPrice = Number(unitPrice);
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

    const TAX_RATE = 0.1;
    const SHIPPING_FEE = subTotal >= 250 ? 0 : 25;
    const taxAmount = Number((subTotal * TAX_RATE).toFixed(2));
    const total = Number((subTotal + taxAmount + SHIPPING_FEE).toFixed(2));

    /* =========================
       CREATE ORDER + STOCK (SAFE)
    ========================= */
    const deliveryMethodMap = { 0: "PICKUP", 1: "DELIVERY" };

    const order = await prisma.$transaction(async (tx) => {
      // 🔒 atomic stock update
      for (const item of cartItems) {
        const result = await tx.product_list.updateMany({
          where: {
            id: item.product.id,
            is_active: true,
            stock_qty: { gte: item.quantity },
          },
          data: {
            stock_qty: { decrement: item.quantity },
          },
        });

        if (result.count === 0) {
          throw new Error(
            `Product "${item.product.name}" went out of stock`
          );
        }
      }

      return tx.order_list.create({
        data: {
          order_number: purchaseOrderNumber,
          customer_list_id: customerId,
          status: "CREATED",
          sub_total: subTotal,
          shipping_address: formatAddress(shippingAddr),
          billing_address: formatAddress(billingAddr),
          delivery_method: deliveryMethodMap[deliveryMethod],
          shipping_amount: SHIPPING_FEE,
          tax_amount: taxAmount,
          is_purchase_order: true,
          total,
          currency: "USD",
          is_paypal: false,
          items: { create: orderItems },
        },
      });
    });

    return NextResponse.json({
      success: true,
      localOrderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (error) {
    console.error("PURCHASE ORDER ERROR:", error);

    return NextResponse.json(
      { message: error.message || "Failed to create purchase order" },
      { status: 500 }
    );
  }
}
