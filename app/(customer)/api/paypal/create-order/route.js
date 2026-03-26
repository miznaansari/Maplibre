import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

const PAYPAL_BASE = process.env.PAYPAL_BASE_URL;

/* =========================
   PAYPAL TOKEN
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
   CREATE ORDER
========================= */
export async function POST(req) {
  const body = await req.json();

  const shippingAddressId = Number(body.shipping_address_id);
  const billingAddressId = Number(body.billing_address_id);
  const deliveryMethod = Number(body.delivery_method); // 0 pickup | 1 delivery

  if (
    !Number.isInteger(shippingAddressId) ||
    !Number.isInteger(billingAddressId)
  ) {
    return NextResponse.json(
      { message: "Shipping or billing address missing" },
      { status: 400 }
    );
  }

  if (![0, 1].includes(deliveryMethod)) {
    return NextResponse.json(
      { message: "Invalid delivery method" },
      { status: 400 }
    );
  }

  console.time("TOTAL_API_TIME");

  try {
    /* =========================
       AUTH
    ========================= */
    const token = await requireUser();
    if (!token?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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
              ? {
                  where: { customer_group_id: customerGroupId },
                  take: 1,
                }
              : false,
            tier_product_pricing: {
              select: {
                tier_1_price: true,
                tier_2_price: true,
                tier_3_price: true,
                tier_4_price: true,
                tier_5_price: true,
                tier_6_price: true,
                tier_7_price: true,
                tier_8_price: true,
                tier_9_price: true,
                tier_10_price: true,
              },
            },
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
            message: `Quantity for "${p.name}" must be a multiple of ${p.stepper_value}`,
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
        { message: "Invalid shipping or billing address" },
        { status: 400 }
      );
    }

    const formatAddress = (addr) => `
${addr.first_name} ${addr.last_name ?? ""}
${addr.company ?? ""}
${addr.address_1}
${addr.address_2 ?? ""}
${addr.city}, ${addr.state}
${addr.country} - ${addr.postal_code}
Phone: ${addr.phone}
Email: ${addr.email}
`.trim();

    const shippingAddress = formatAddress(shippingAddr);
    const billingAddress = formatAddress(billingAddr);

    /* =========================
       TIER PRICE
    ========================= */
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

    const TAX_RATE = 0.1;
    const SHIPPING_FEE = subTotal >= 250 ? 0 : 25;

    const taxAmount = Number((subTotal * TAX_RATE).toFixed(2));
    const total = Number((subTotal + taxAmount + SHIPPING_FEE).toFixed(2));

    /* =========================
       ORDER + STOCK (SAFE)
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
          order_number: `ORD-${Date.now()}`,
          customer_list_id: customerId,
          status: "CREATED",
          sub_total: subTotal,
          shipping_address: shippingAddress,
          billing_address: billingAddress,
          delivery_method: deliveryMethodMap[deliveryMethod],
          shipping_amount: SHIPPING_FEE,
          tax_amount: taxAmount,
          total,
          currency: "USD",
          is_paypal: true,
          items: { create: orderItems },
        },
      });
    });

    /* =========================
       PAYPAL ORDER (UNCHANGED)
    ========================= */
    const accessToken = await getPayPalAccessToken();

    const paypalRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: String(order.id),
            amount: {
              currency_code: "USD",
              value: total.toFixed(2),
              breakdown: {
                item_total: { currency_code: "USD", value: subTotal.toFixed(2) },
                shipping: { currency_code: "USD", value: SHIPPING_FEE.toFixed(2) },
                tax_total: { currency_code: "USD", value: taxAmount.toFixed(2) },
              },
            },
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: "ShieldKing",
              landing_page: "LOGIN",
              user_action: "PAY_NOW",
              return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
              cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
            },
          },
        },
      }),
    });

    const paypalOrder = await paypalRes.json();

    if (!paypalRes.ok) {
      throw new Error("PayPal order creation failed");
    }

    console.timeEnd("TOTAL_API_TIME");

    return NextResponse.json({
      orderId: paypalOrder.id,
      localOrderId: order.id,
      approveUrl: paypalOrder.links.find((l) => l.rel === "approve")?.href,
    });
  } catch (error) {
    console.timeEnd("TOTAL_API_TIME");
    console.error("PAYPAL CREATE ORDER ERROR:", error);

    return NextResponse.json(
      { message: error.message || "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}
