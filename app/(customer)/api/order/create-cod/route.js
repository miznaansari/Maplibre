import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/requireUser";

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

    /* CART ITEMS */
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

    /* ADDRESSES */
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

    /* TOTAL CALCULATION */
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

    /* CREATE ORDER */
    const order = await prisma.order_list.create({
      data: {
        order_number: `ORD-${Date.now()}`,
        customer_list_id: customerId,
        status: "PENDING",
        sub_total: subTotal,
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        delivery_method: deliveryMethod ? "DELIVERY" : "PICKUP",
        shipping_amount: shippingFee,
        tax_amount: taxAmount,
        total,
        currency: "INR",
        items: {
          create: orderItems,
        },
      },
    });

    /* PAYMENT RECORD (COD) */
    await prisma.payments.create({
      data: {
        order_id: order.id,
        provider: "COD",
        provider_order_id: `COD-${order.id}`,
        amount: total,
        currency: "INR",
        status: "PENDING",
      },
    });


    /* SEND WHATSAPP MESSAGE */
    //     try {
    //       console.log('try to send sms ')
    //       console.log('shippingAddr',shippingAddr)
    //       const phone = shippingAddr.phone.replace(/\D/g, ""); // remove spaces
    // console.log('phone',phone)
    //       const message = `🛒 Order Confirmed!

    // Order Number: ${order.order_number}

    // Total Amount: ₹${total}

    // Delivery Method: ${deliveryMethod ? "Home Delivery" : "Store Pickup"
    //         }

    // Thank you for shopping with us ❤️`;
    // console.log('senidng')
    //       await sendWhatsAppMessage(`91${phone}`, message);
    //     } catch (err) {
    //       console.error("WhatsApp send failed:", err);
    //     }

    /* CLEAR CART */
    await prisma.customer_cart.updateMany({
      where: {
        customer_list_id: customerId,
        is_deleted: false,
      },
      data: {
        is_deleted: true,
      },
    });



    const response = NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      message: "Order placed successfully with Cash on Delivery",
    });

    /* BACKGROUND WHATSAPP SEND */
//     (async () => {
//       try {
//         const phone = shippingAddr.phone.replace(/\D/g, "");
//         const itemsText = orderItems
//           .map((item) => `• ${item.product_title} x${item.quantity}`)
//           .join("\n");
//         const message = `🛒 *ORDER CONFIRMED*

// *Order Number:* ${order.order_number}

// *Items Ordered:*
// ${itemsText}

// *Total Amount:* ₹${total}

// *Delivery Method:* ${deliveryMethod ? "Home Delivery" : "Store Pickup"}

// 🔎 *Track Order*
// https://samad.agencytheclevar.com/order/${order.id}

// _Thank you for shopping with us!_
// *Samad Agency* ❤️`;

//         const notification = await prisma.whatsapp_notifications.create({
//           data: {
//             phone: `91${phone}`,
//             message,
//             order_id: order.id,
//             status: "PENDING",
//           },
//         });

//         fetch("https://vps.theclevar.com/send", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             phone: notification.phone,
//             message: notification.message,
//           }),
//           signal: AbortSignal.timeout(10000), // stop after 10s
//         })
//           .then(async (res) => {
//             const data = await res.text();

//             await prisma.whatsapp_notifications.update({
//               where: { id: notification.id },
//               data: {
//                 status: "SENT",
//                 response: data,
//               },
//             });
//           })
//           .catch(async (err) => {
//             await prisma.whatsapp_notifications.update({
//               where: { id: notification.id },
//               data: {
//                 status: "FAILED",
//                 response: err.message,
//               },
//             });
//           });

//       } catch (err) {
//         console.error("WhatsApp background error:", err);
//       }
//     })();
(async () => {
  try {
    const phone = shippingAddr.phone.replace(/\D/g, "");

    const itemsText = orderItems
      .map((item) => `${item.product_title} x${item.quantity}`)
      .join(", ");

    const message = `Order Confirmed!
Order No: ${order.order_number}

Items: ${itemsText}

Total: Rs ${total}

Track Order:
https://samad.agencytheclevar.com/order/${order.id}

Samad Agency`;

    const notification = await prisma.whatsapp_notifications.create({
      data: {
        phone: `91${phone}`,
        message,
        order_id: order.id,
        status: "PENDING",
      },
    });

    fetch("https://control.msg91.com/api/v5/flow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: process.env.MSG91_AUTH_KEY,
      },
      body: JSON.stringify({
        sender: process.env.MSG91_SENDER_ID,
        route: process.env.MSG91_ROUTE,
        country: "91",
        sms: [
          {
            message: notification.message,
            to: [notification.phone],
          },
        ],
      }),
      signal: AbortSignal.timeout(10000),
    })
      .then(async (res) => {
        const data = await res.text();

        await prisma.whatsapp_notifications.update({
          where: { id: notification.id },
          data: {
            status: "SENT",
            response: data,
          },
        });
      })
      .catch(async (err) => {
        await prisma.whatsapp_notifications.update({
          where: { id: notification.id },
          data: {
            status: "FAILED",
            response: err.message,
          },
        });
      });

  } catch (err) {
    console.error("SMS background error:", err);
  }
})();
    return response;

  } catch (error) {
    console.error("COD ORDER ERROR:", error);

    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}