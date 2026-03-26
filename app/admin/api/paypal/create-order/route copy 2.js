import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

const PAYPAL_BASE = process.env.PAYPAL_BASE_URL;

/* =========================
   PAYPAL TOKEN
========================= */
async function getPayPalAccessToken() {
  console.time("paypal_token");

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

  console.timeEnd("paypal_token");

  if (!data.access_token) {
    throw new Error("Failed to get PayPal access token");
  }

  return data.access_token;
}

/* =========================
   CREATE ORDER
========================= */
export async function POST() {
  console.time("TOTAL_API_TIME");

  try {
    /* =========================
       AUTH
    ========================= */
    console.time("auth");

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

    console.timeEnd("auth");

    /* =========================
       CART
    ========================= */
    console.time("cart_fetch");

    const cartItems = await prisma.customer_cart.findMany({
      where: { customer_list_id: customerId, is_deleted: false },
      include: { product: true },
    });

    console.timeEnd("cart_fetch");

    if (!cartItems.length) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    /* =========================
       ADDRESS
    ========================= */
    console.time("address_fetch");

    const address = await prisma.customer_address.findFirst({
      where: {
        customer_list_id: customerId,
        is_default: true,
        is_deleted: false,
      },
    });

    console.timeEnd("address_fetch");

    if (!address) {
      return NextResponse.json(
        { message: "No default address found" },
        { status: 400 }
      );
    }

    const addres = `
${address.first_name} ${address.last_name ?? ""}
${address.company ?? ""}
${address.address_1}
${address.address_2 ?? ""}
${address.city}, ${address.state}
${address.country} - ${address.postal_code}
Phone: ${address.phone}
Email: ${address.email}
`.trim();

    /* =========================
       TOTAL CALC
    ========================= */
    console.time("total_calc");

    let subTotal = 0;

    const orderItems = cartItems.map((item) => {
      const price = item.product.sale_price ?? item.product.regular_price;
      const lineTotal = price * item.quantity;
      subTotal += lineTotal;

      return {
        product_list_id: item.product_list_id,
        sku: item.product.sku,
        product_title: item.product.name,
        unit_price: price,
        quantity: item.quantity,
        line_total: lineTotal,
      };
    });

    const TAX_RATE = 0.1;
    const SHIPPING_FEE = subTotal >= 250 ? 0 : 15;
    const taxAmount = Number((subTotal * TAX_RATE).toFixed(2));
    const total = Number((subTotal + taxAmount + SHIPPING_FEE).toFixed(2));

    console.timeEnd("total_calc");

    /* =========================
       LOCAL ORDER
    ========================= */
    console.time("order_create");

    const order = await prisma.order_list.create({
      data: {
        order_number: `ORD-${Date.now()}`,
        customer_list_id: customerId,
        status: "PENDING",
        sub_total: subTotal,
        shipping_address: addres,
        billing_address: addres,
        shipping_amount: SHIPPING_FEE,
        tax_amount: taxAmount,
        total,
        currency: "USD",
        is_paypal: true,
        items: { create: orderItems },
      },
    });

    console.timeEnd("order_create");

    /* =========================
       PAYPAL ORDER
    ========================= */
    console.time("paypal_order_create");

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
                item_total: {
                  currency_code: "USD",
                  value: subTotal.toFixed(2),
                },
                shipping: {
                  currency_code: "USD",
                  value: SHIPPING_FEE.toFixed(2),
                },
                tax_total: {
                  currency_code: "USD",
                  value: taxAmount.toFixed(2),
                },
              },
            },
          },
        ],
        payment_source: {
          paypal: {
            experience_context: {
              brand_name: "samad-agency",
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

    console.timeEnd("paypal_order_create");

    if (!paypalRes.ok) {
      console.error("PAYPAL ERROR:", paypalOrder);
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
      { message: "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}
