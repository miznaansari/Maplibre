"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import StatusChip from "@/app/admin/UI/common/StatusChip";
import OrderStatusSelect from "./OrderStatusSelect";

const POLL_INTERVAL = 5000;
const MAX_POLL_TIME = 30000;

export default function OrderDetailsClient({ orderId }) {
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  /* =========================
     FETCH ORDER STATUS (ADMIN)
  ========================= */
  const fetchStatus = async () => {
    try {
      const res = await fetch("/admin/api/paypal/verify-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const json = await res.json();
      setData(json);
      setLoading(false);

      if (
        json?.order?.status === "PAID" ||
        json?.order?.status === "PAYMENT_FAILED" ||
        json?.paypal?.status === "COMPLETED"
      ) {
        stopPolling();
      }
    } catch (err) {
      console.error("Verify failed:", err);
      setLoading(false);
    }
  };

  /* =========================
     POLLING
  ========================= */
  const startPolling = () => {
    if (isPolling) return;

    setIsPolling(true);
    setElapsed(0);

    intervalRef.current = setInterval(() => {
      fetchStatus();
      setElapsed((p) => p + POLL_INTERVAL);
    }, POLL_INTERVAL);

    timeoutRef.current = setTimeout(stopPolling, MAX_POLL_TIME);
  };

  const stopPolling = () => {
    setIsPolling(false);
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
  };

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    fetchStatus();
    return () => stopPolling();
  }, [orderId]);

  /* =========================
     START POLLING IF PENDING
  ========================= */
  useEffect(() => {
    if (data?.paypal?.status === "PENDING") {
      startPolling();
    }
  }, [data?.paypal?.status]);

  /* =========================
     LOADING (IDENTICAL)
  ========================= */
  if (loading) {
    return (
      <div className="mx-auto mt-4 p-4 pt-0 max-w-6xl space-y-6 animate-pulse">
        <p className="flex text-md text-gray-600">
          <span className="cursor-pointer" onClick={() => router.back()}>
            Orders
          </span>
          <span className="mx-1 text-[#0172BC]">{">"}</span>
          <span className="font-medium text-[#0172BC]">Order Details</span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-gray-200 rounded p-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-300 rounded" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded p-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-36 bg-gray-300 rounded" />
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="h-3 w-full bg-gray-200 rounded" />
              ))}
            </div>
          ))}
        </div>

        <div className="border border-gray-200 rounded">
          {[1, 2].map((i) => (
            <div key={i} className="flex justify-between p-4 border-b border-dashed border-gray-200 last:border-none">
              <div className="space-y-2">
                <div className="h-4 w-40 bg-gray-300 rounded" />
                <div className="h-3 w-28 bg-gray-200 rounded" />
              </div>
              <div className="space-y-2 text-right">
                <div className="h-3 w-16 bg-gray-200 rounded ml-auto" />
                <div className="h-4 w-20 bg-gray-300 rounded ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { order, items, paypal } = data || {};
  const isPending = paypal?.status === "PENDING";

  const billingLines = order?.billing_address
    ?.split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const shippingLines = order?.shipping_address
    ?.split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className=" bg-white m-2 p-4 md:p-6">
      {isPending && (
        <div className="mb-4 flex items-center gap-3 rounded border border-yellow-300 bg-yellow-50 p-3 text-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent" />
          <span>
            Payment is pending. Confirming…
            {isPolling && (
              <span className="ml-1 text-gray-500">
                ({Math.max(0, Math.ceil((MAX_POLL_TIME - elapsed) / 1000))}s)
              </span>
            )}
          </span>
        </div>
      )}

      <div className="mb-4 flex text-md text-gray-600">
        <span className="cursor-pointer" onClick={() => router.back()}>
          Orders
        </span>
        <span className="mx-1 text-[#0172BC]">{">"}</span>
        <span className="font-medium text-[#0172BC]">Order Details</span>
      </div>

      <div className="mb-6 grid gap-4 rounded border border-gray-300 bg-slate-50 p-4 text-sm md:grid-cols-4">
        <div>
          <p className="text-gray-500">Order ID</p>
          <p className="font-medium">#{order?.order_number}</p>
        </div>
        <div>
          <p className="text-gray-500">Order Placed</p>
      <p className="font-medium">
  {(() => {
    if (!order?.created_at) return "-";

    const d = new Date(order.created_at);

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const day = String(d.getDate()).padStart(2, "0");
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  })()}
</p>

        </div>
        <div>
          <p className="text-gray-500">Payment Mode</p>
          <p className="font-medium text-blue-600">PayPal</p>
        </div>
        <div>
         <div>
  <p className="text-gray-500">Order Status</p>
  <OrderStatusSelect order={order} />
</div>
          {/* </span> */}
        </div>
      </div>

      <div className="mb-6 grid gap-4 border border-gray-300 md:grid-cols-3">
        <div className="p-4 text-sm">
          <h4 className="mb-2 font-semibold">Shipping Address</h4>
          {shippingLines?.map((l, i) => (
            <p key={i} className={i === 0 ? "font-semibold" : "text-gray-600"}>
              {l}
            </p>
          ))}
        </div>

        <div className="p-4 text-sm">
          <h4 className="mb-2 font-semibold">Billing Address</h4>
          {billingLines?.map((l, i) => (
            <p key={i} className={i === 0 ? "font-semibold" : "text-gray-600"}>
              {l}
            </p>
          ))}
        </div>

        <div className="p-4 text-sm">
          <h4 className="mb-3 font-semibold">Order Summary</h4>
          <div className="flex justify-between">
            <span>Sub Total</span>
            <span>${order?.sub_total}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Shipping</span>
            <span>${order?.shipping_amount}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>GST</span>
            <span>${order?.tax_amount}</span>
          </div>
          <hr className="my-3 border-dashed" />
          <div className="flex justify-between font-semibold">
            <span>Grand Total</span>
            <span>${order?.total}</span>
          </div>
        </div>
      </div>

      <div className="rounded border border-gray-300">
        {items?.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-4 border-b border-dashed p-4 last:border-none md:flex-row md:justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded  bg-gray-50 overflow-hidden">
                <Image
                  src={item.product?.images?.[0]?.image_url || "/images/not-found.png"}
                  width={40}
                  height={40}
                  alt=""
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{item.product_title}</p>
                <p className="text-xs text-gray-500">SKU: {item.sku}</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p>QTY: {item.quantity}</p>
              <p className="font-semibold">${item.line_total}</p>
            </div>
          </div>
        ))}
      </div>

     <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5 text-sm">
  <div className="mb-4 flex items-center justify-between">
    <h3 className="text-base font-semibold text-gray-800">
      PayPal Transactions
    </h3>
    <span className="text-xs text-gray-500">
      {paypal?.length || 0} records
    </span>
  </div>

  {paypal?.length ? (
    <div className="space-y-3">
      {paypal.map((tx) => (
        <div
          key={tx.id}
          className="rounded-md border border-gray-200 bg-gray-50 p-4"
        >
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Order ID</p>
              <p className="font-medium text-gray-800 truncate">
                {tx.providerOrderId || "—"}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-xs">Transaction ID</p>
              <p className="font-medium text-gray-800 truncate">
                {tx.providerTxnId || "—"}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-xs">Amount</p>
              <p className="font-medium text-gray-800">
                {tx.amount} {tx.currency}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-xs">Date</p>
              <p className="font-medium text-gray-800">
                {new Date(tx.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <span
              className="
                inline-flex items-center rounded-full
                border border-gray-300
                px-3 py-1 text-xs font-semibold
                text-gray-700 bg-white
              "
            >
              {tx.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500 text-sm">No PayPal transactions found.</p>
  )}
</div>

    </div>
  );
}
