"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import StatusChip from "@/app/admin/UI/common/StatusChip";
import { Accordion } from "./Accordion";

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
    <div className="min-h-screen bg-[#0f0f0f] text-white px-4 md:px-8 py-6 space-y-6">

      {/* ================= HERO ================= */}
      {/* ================= HERO ================= */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#151515] p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        {/* 🔥 Glow Background */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[#38bdf8]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#a78bfa]/20 blur-3xl" />

        {/* Content */}
        <div className="relative z-10">
          <p
            onClick={() => router.back()}
            className="text-sm text-gray-400 cursor-pointer hover:text-white"
          >
            ← Back to Orders
          </p>

          <h1 className="text-xl md:text-2xl font-bold mt-1">
            Order #{order?.order_number}
          </h1>

          <p className="text-gray-400 text-sm">
            {new Date(order?.created_at).toLocaleString()}
          </p>
        </div>

        <div className="relative z-10 text-right">
          <StatusChip value={order?.status} />

          <p className="text-xs text-gray-400 mt-2">Total</p>
          <p className="text-2xl font-bold text-[#38bdf8]">
            ₹{order?.total}
          </p>
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ================= LEFT ================= */}
        <div className="lg:col-span-2 space-y-6">

          {/* ITEMS */}
          <div className="rounded-2xl border border-white/10 bg-[#151515]">
            <h3 className="p-4 border-b border-white/10 font-semibold">
              Items
            </h3>

            {items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border-b border-white/5 last:border-none"
              >
                <div className="flex gap-3">
                  <div className="h-14 w-14 rounded-lg overflow-hidden bg-[#111]">
                    <Image
                      src={
                        item.product?.images?.[0]?.image_url ||
                        "/images/not-found.png"
                      }
                      alt=""
                      width={56}
                      height={56}
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <p className="font-medium">{item.product_title}</p>
                    <p className="text-xs text-gray-400">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>

                <p className="font-semibold text-[#38bdf8]">
                  ₹{item.line_total}
                </p>
              </div>
            ))}
          </div>

          {/* ADDRESSES */}

        </div>

        {/* ================= RIGHT (STICKY SUMMARY) ================= */}
        <div className="space-y-6">

          <div className="rounded-2xl border border-white/10 bg-[#151515] p-5 ">

            <h3 className="font-semibold mb-4">Order Summary</h3>

            <SummaryRow label="Subtotal" value={order?.sub_total} />
            <SummaryRow label="Shipping" value={order?.shipping_amount} />
            <SummaryRow label="GST" value={order?.tax_amount} />

            <div className="border-t border-white/10 my-3" />

            <div className="flex justify-between font-bold text-lg text-[#38bdf8]">
              <span>Total</span>
              <span>₹{order?.total}</span>
            </div>
          </div>
          

          {/* PAYMENTS */}
          <Card title="Payments">
            {paypal?.length ? (
              paypal.map((tx) => (
                <div key={tx.id} className="mb-3 text-sm">
                  <p className="text-gray-400">{tx.providerTxnId}</p>
                  <p className="text-[#38bdf8] font-semibold">
                    ₹{tx.amount}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">
                No transactions
              </p>
            )}
          </Card>
          <div className="space-y-4">

            <Accordion title="Shipping Address" >
              {shippingLines.map((l, i) => (
                <p key={i} className="text-sm text-gray-300">{l}</p>
              ))}
            </Accordion>

            <Accordion title="Billing Address">
              {billingLines.map((l, i) => (
                <p key={i} className="text-sm text-gray-300">{l}</p>
              ))}

              {order?.gst_number && (
                <p className="mt-3 text-xs text-[#38bdf8]">
                  GST: {order.gst_number}
                </p>
              )}
            </Accordion>

          </div>

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