"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

const LOG_PREFIX = "[ORDER_STATUS]";
const PAYPAL_BASE =
  process.env.PAYPAL_BASE_URL || "https://api-m.sandbox.paypal.com";

/* ======================================================
   PAYPAL AUTH
====================================================== */
async function getPaypalToken() {
  console.log(`${LOG_PREFIX} Requesting PayPal access token`);

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
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
    console.error(`${LOG_PREFIX} PayPal token error`, data);
    throw new Error("Failed to obtain PayPal token");
  }

  console.log(`${LOG_PREFIX} PayPal token acquired`);
  return data.access_token;
}

/* ======================================================
   PAYPAL REFUND
====================================================== */
async function refundPaypalCapture(
  captureId,
  amount,
  currency
) {
  console.log(`${LOG_PREFIX} Preparing PayPal refund`, {
    captureId,
    amount,
    currency,
  });

  const token = await getPaypalToken();

  const res = await fetch(
    `${PAYPAL_BASE}/v2/payments/captures/${captureId}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: {
          value: amount.toFixed(2),
          currency_code: currency,
        },
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error(`${LOG_PREFIX} PayPal refund failed`, data);
    throw new Error(data?.message || "PayPal refund failed");
  }

  console.log(`${LOG_PREFIX} PayPal refund successful`, {
    refundId: data.id,
  });

  return data;
}

/* ======================================================
   MAIN ACTION
====================================================== */
export async function updateOrderStatusAction({
  orderId,
  status,
}) {

  console.log('==========================================')
  console.log(`${LOG_PREFIX} Incoming request`, {
    orderId,
    nextStatus: status,
  });

  /* ---------- AUTH ---------- */
  const admin = await requireAdmin();
  if (!admin) {
    console.warn(`${LOG_PREFIX} Unauthorized access attempt`, { orderId });
    return { success: false, message: "Unauthorized" };
  }

  if (!orderId || !status) {
    console.warn(`${LOG_PREFIX} Invalid payload`, { orderId, status });
    return { success: false, message: "Invalid data" };
  }

  try {
    /* ---------- FETCH ORDER ---------- */
    console.log(`${LOG_PREFIX} Fetching order`, { orderId });

    const order = await prisma.order_list.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      console.warn(`${LOG_PREFIX} Order not found`, { orderId });
      return { success: false, message: "Order not found" };
    }

    const prevStatus = order.status;
    const nextStatus = status;

    console.log(`${LOG_PREFIX} Current order status`, {
      prevStatus,
      nextStatus,
    });

    const TERMINAL_STATUSES = ["CANCELLED", "PAYMENT_FAILED", "REFUNDED"];

    /* ---------- HARD LOCK ---------- */
    if (TERMINAL_STATUSES.includes(prevStatus)) {
      console.warn(`${LOG_PREFIX} Terminal order state`, { prevStatus });
      return {
        success: false,
        message: `Order already ${prevStatus.replaceAll("_", " ")}`,
      };
    }

    /* ======================================================
       REFUND FLOW
    ====================================================== */
    if (nextStatus === "REFUNDED" || nextStatus === "CANCELLED") {
      console.log(`${LOG_PREFIX} Refund requested by admin`, { orderId });

      const payment = order.payments.find(
        (p) => p.provider === "PAYPAL" && p.status === "COMPLETED"
      );

      if (!payment) {
        console.warn(`${LOG_PREFIX} No refundable PayPal payment`, {
          orderId,
        });
        return {
          success: false,
          message: "No completed PayPal payment found",
        };
      }
      // 🛡️ STOP if already refunded
const alreadyRefunded = order.payments.some(
  (p) => p.provider === "PAYPAL" && p.status === "REFUNDED"
);

if (alreadyRefunded) {
  console.log(`${LOG_PREFIX} Already refunded, skipping PayPal API`, {
    orderId,
  });

  return {
    success: false,
    message: "Order already refunded",
  };
}


      if (!payment.provider_txn_id) {
        console.error(`${LOG_PREFIX} Missing PayPal capture ID`, {
          paymentId: payment.id,
        });
        return {
          success: false,
          message: "Missing PayPal capture ID",
        };
      }

      console.log(`${LOG_PREFIX} Initiating PayPal refund`, {
        captureId: payment.provider_txn_id,
      });

      const refundData = await refundPaypalCapture(
        payment.provider_txn_id,
        Number(order.total),
        order.currency
      );
console.log('\|\\',refundData)
      /* ---------- UPDATE PAYMENT ---------- */
      console.log(`${LOG_PREFIX} insert payment record`, {
        paymentId: payment.id,
      });

      await prisma.payments.create({
        data: {
          order_id: payment.order_id,
          provider: "PAYPAL",
        provider_order_id: refundData.id, // 🔥 use refund id as unique key

          provider_txn_id: refundData.id, // 🔥 refund ID as txn id
          amount: refundData.amount?.value || order.total,
          currency: refundData.amount?.currency_code || order.currency,
          status: "PROCESSING",
          raw_response: JSON.stringify(refundData),
        },
      });

      /* ---------- UPDATE ORDER ---------- */
      console.log(`${LOG_PREFIX} Updating order status to REFUNDED`, {
        orderId,
      });

      await prisma.order_list.update({
        where: { id: orderId },
        data: { status: "REFUNDED" },
      });

      /* ---------- STOCK ROLLBACK ---------- */
      console.log(`${LOG_PREFIX} Rolling back stock`, {
        itemCount: order.items.length,
      });

      for (const item of order.items) {
        await prisma.product_list.update({
          where: { id: item.product_list_id },
          data: {
            stock_qty: { increment: item.quantity },
          },
        });

        console.log(`${LOG_PREFIX} Stock restored`, {
          productId: item.product_list_id,
          qty: item.quantity,
        });
      }

      console.log(`${LOG_PREFIX} Refund flow completed`, { orderId });

      return {
        success: true,
        message: "Order refunded successfully",
        refundId: refundData.id,
      };
    }

    /* ======================================================
       NORMAL STATUS UPDATE
    ====================================================== */
    console.log(`${LOG_PREFIX} Updating order status`, {
      orderId,
      nextStatus,
    });

    await prisma.order_list.update({
      where: { id: orderId },
      data: { status: nextStatus },
    });

    const ROLLBACK_STOCK = ["CANCELLED", "PAYMENT_FAILED"];

    if (ROLLBACK_STOCK.includes(nextStatus)) {
      console.log(`${LOG_PREFIX} Rolling back stock (non-refund)`);

      for (const item of order.items) {
        await prisma.product_list.update({
          where: { id: item.product_list_id },
          data: {
            stock_qty: { increment: item.quantity },
          },
        });

        console.log(`${LOG_PREFIX} Stock restored`, {
          productId: item.product_list_id,
          qty: item.quantity,
        });
      }
    }

    console.log(`${LOG_PREFIX} Order status updated successfully`, {
      orderId,
      nextStatus,
    });

    return {
      success: true,
      message: `Order status changed to ${nextStatus.replaceAll("_", " ")}`,
    };
  } catch (error) {
    console.error(`${LOG_PREFIX} FATAL ERROR`, {
      orderId,
      status,
      message: error?.message,
      stack: error?.stack,
    });

    return {
      success: false,
      message: error?.message || "Failed to update order status",
    };
  }
}
