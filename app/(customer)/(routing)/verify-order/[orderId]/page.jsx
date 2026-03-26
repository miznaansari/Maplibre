"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import StatusChip from "@/app/admin/UI/common/StatusChip";
import { Accordion } from "./Accordion";
import { CheckBadgeIcon } from "@heroicons/react/24/outline";

const POLL_INTERVAL = 5000;
const MAX_POLL_TIME = 30000;

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  /* ================= FETCH ================= */
  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/paypal/verify-order", {
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
      console.error(err);
      setLoading(false);
    }
  };

  const startPolling = () => {
    if (isPolling) return;

    setIsPolling(true);

    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL);
    timeoutRef.current = setTimeout(stopPolling, MAX_POLL_TIME);
  };

  const stopPolling = () => {
    setIsPolling(false);
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    fetchStatus();
    return () => stopPolling();
  }, [orderId]);

  useEffect(() => {
    if (data?.paypal?.status === "PENDING") {
      startPolling();
    }
  }, [data?.paypal?.status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white px-4 md:px-8 py-6 space-y-6">

      {/* ================= HERO ================= */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#151515] p-6">

        {/* Glow */}
        <div className="absolute -top-20 -right-20 h-60 w-60 bg-[#38bdf8]/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 bg-[#a78bfa]/20 blur-3xl" />

        <div className="relative z-10 flex justify-between items-center">

          <div className="space-y-3">
            <div className="h-3 w-28 rounded bg-white/10 shimmer" />
            <div className="h-5 w-56 rounded bg-white/10 shimmer" />
            <div className="h-3 w-40 rounded bg-white/10 shimmer" />
          </div>

          <div className="text-right space-y-2">
            <div className="h-6 w-16 rounded-full bg-[#22c55e]/20 shimmer" />
            <div className="h-4 w-20 rounded bg-white/10 shimmer" />
          </div>

        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ================= ITEMS ================= */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#151515]">

          <div className="p-4 border-b border-white/10">
            <div className="h-4 w-24 bg-white/10 rounded shimmer" />
          </div>

          {[1, 2].map((i) => (
            <div key={i} className="flex justify-between items-center p-4 border-b border-white/5">

              <div className="flex gap-3 items-center">
                <div className="h-14 w-14 rounded-lg bg-white/10 shimmer" />

                <div className="space-y-2">
                  <div className="h-4 w-40 bg-white/10 rounded shimmer" />
                  <div className="h-3 w-24 bg-white/10 rounded shimmer" />
                </div>
              </div>

              <div className="h-4 w-16 bg-white/10 rounded shimmer" />
            </div>
          ))}
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="rounded-2xl border border-white/10 bg-[#151515] p-5 space-y-4">

          <div className="h-4 w-32 bg-white/10 rounded shimmer" />

          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-24 bg-white/10 rounded shimmer" />
              <div className="h-3 w-16 bg-white/10 rounded shimmer" />
            </div>
          ))}

          <div className="border-t border-white/10 pt-3 flex justify-between">
            <div className="h-4 w-24 bg-white/10 rounded shimmer" />
            <div className="h-4 w-20 bg-[#38bdf8]/20 rounded shimmer" />
          </div>
        </div>
      </div>

      {/* ================= ACCORDION (ADDRESS) ================= */}
      <div className="space-y-4">

        {[1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-[#151515] p-4">
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 bg-white/10 rounded shimmer" />
              <div className="h-4 w-4 bg-white/10 rounded shimmer" />
            </div>
          </div>
        ))}

      </div>

    </div>
    );
  }

  const { order, items, paypal } = data || {};

  const billingLines = (order?.billing_address || "")
    .split("\n")
    .filter(Boolean);

  const shippingLines = (order?.shipping_address || "")
    .split("\n")
    .filter(Boolean);

return (
  <div className="min-h-screen bg-white text-black px-4 md:px-6 py-10">

    {/* ================= HERO ================= */}
    <div className="text-center mb-10">

      <div className="flex justify-center mb-5">
        <div className="h-16 w-16 rounded-full bg-green-500 flex items-center justify-center text-white text-3xl">
          <CheckBadgeIcon />
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
        ORDER CONFIRMED!
      </h1>

      <p className="text-gray-600 mt-2 text-sm">
        Thank you for your order. We'll send you shipping confirmation once your items are on the way.
      </p>

      <div className="mt-5 inline-block border border-cyan-500 text-cyan-600 px-5 py-2 rounded-lg text-sm">
        ORDER ID #{order?.order_number}
      </div>
    </div>

    {/* ================= INFO GRID ================= */}
    <div className="grid md:grid-cols-3 gap-6 border border-gray-200 rounded-xl bg-white p-6 mb-8">

      {/* DELIVERY ADDRESS */}
      <div>
        <p className="text-xs text-cyan-600 mb-2 font-semibold">
          DELIVERY ADDRESS
        </p>

        {shippingLines.map((line, i) => (
          <p key={i} className="text-sm text-gray-700">
            {line}
          </p>
        ))}
      </div>

      {/* PAYMENT */}
      <div>
        <p className="text-xs text-cyan-600 mb-2 font-semibold">
          PAYMENT METHOD
        </p>

        <p className="text-sm text-gray-700">
          {paypal?.[0]?.provider || "PayPal"}
        </p>

        <p className="text-green-600 text-sm">
          Status: completed
        </p>

        {paypal?.[0]?.providerTxnId && (
          <p className="text-xs text-gray-500">
            TXN:{paypal?.[0]?.providerTxnId}
          </p>
        )}
      </div>

      {/* DELIVERY ESTIMATE */}
      <div>
        <p className="text-xs text-cyan-600 mb-2 font-semibold">
          ESTIMATED DELIVERY
        </p>

        <p className="text-sm text-gray-700">
          {new Date(order?.created_at).toLocaleDateString()}
        </p>

        <p className="text-xs text-gray-500">
          Tracking: {order?.tracking_number || "Processing"}
        </p>
      </div>
    </div>

    {/* ================= ITEMS ================= */}
    <div className="border border-gray-200 rounded-xl bg-white p-5 mb-6">

      <h3 className="text-sm font-semibold mb-4">
        ORDER ITEMS ({items?.length})
      </h3>

      {items?.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between border border-gray-200 rounded-lg p-4 mb-4"
        >
          <div className="flex items-center gap-3">

            <div className="h-14 w-14 bg-gray-100 rounded-md overflow-hidden">
              <Image
                src={
                  item.product?.images?.[0]?.image_url ||
                  "/images/not-found.png"
                }
                alt=""
                width={56}
                height={56}
              />
            </div>

            <div>
              <p className="text-sm font-semibold">
                {item.product_title}
              </p>

              <p className="text-xs text-gray-500">
                Qty: {item.quantity}
              </p>
            </div>
          </div>

          <p className="text-cyan-600 font-semibold">
            ₹{item.line_total}
          </p>
        </div>
      ))}
    </div>

    {/* ================= PRICE SUMMARY ================= */}
    <div className="border border-gray-200 rounded-xl bg-white p-5">

      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600">Subtotal</span>
        <span>₹{order?.sub_total}</span>
      </div>

      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-600">Shipping</span>
        <span>
          {order?.shipping_amount ? `₹${order?.shipping_amount}` : "Free"}
        </span>
      </div>

      <div className="border-t border-gray-200 my-3"></div>

      <div className="flex justify-between font-bold text-lg text-cyan-600">
        <span>TOTAL PAID</span>
        <span>₹{order?.total}</span>
      </div>

    </div>

  </div>
);
}

/* ================= COMPONENTS ================= */

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#151515] p-5">
      <h4 className="mb-3 font-semibold">{title}</h4>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm text-gray-300 mb-2">
      <span>{label}</span>
      <span>₹{value}</span>
    </div>
  );
}