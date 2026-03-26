"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import StatusChip from "@/app/admin/UI/common/StatusChip";

const POLL_INTERVAL = 3000; // 3 sec
const MAX_POLL_TIME = 20000; // 20 sec

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  /* =========================
     FETCH ORDER
  ========================= */
  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/order/get-order?orderId=${orderId}`);
      const json = await res.json();

      setData(json);
      setLoading(false);

      // ✅ STOP polling if final
      if (
        json?.order?.status === "PAID" ||
        json?.order?.status === "PAYMENT_FAILED"
      ) {
        stopPolling();
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setLoading(false);
    }
  };

  /* =========================
     START POLLING
  ========================= */
  const startPolling = () => {
    if (isPolling) return;

    setIsPolling(true);

    intervalRef.current = setInterval(() => {
      fetchOrder();
    }, POLL_INTERVAL);

    timeoutRef.current = setTimeout(stopPolling, MAX_POLL_TIME);
  };

  /* =========================
     STOP POLLING
  ========================= */
  const stopPolling = () => {
    setIsPolling(false);
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
  };

  /* =========================
     INITIAL LOAD
  ========================= */
  useEffect(() => {
    fetchOrder();
    return () => stopPolling();
  }, [orderId]);

  /* =========================
     SMART POLLING (ONLY IF NEEDED)
  ========================= */
  useEffect(() => {
    if (
      data?.order?.status === "CREATED" ||
      data?.order?.status === "PENDING"
    ) {
      startPolling();
    }
  }, [data?.order?.status]);

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="mx-auto mt-4 p-6 max-w-6xl text-white animate-pulse">
        Loading order...
      </div>
    );
  }

  const { order, items, payments } = data || {};

  const billingLines = (order?.billing_address || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const shippingLines = (order?.shipping_address || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

return (
  <div className="min-h-screen bg-[#0b0b0f] text-white px-6 py-10">

    {/* ================= HERO ================= */}
    <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#111] via-[#151515] to-[#1b1b1b] p-8">

      {/* Glow background */}
      <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[#38bdf8]/20 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#a78bfa]/20 blur-3xl" />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">

        <div>
          <p
            onClick={() => router.back()}
            className="cursor-pointer text-sm text-gray-400 hover:text-white mb-2"
          >
            ← Back
          </p>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Order #{order?.order_number}
          </h1>

          <p className="text-gray-400 mt-2">
            {new Date(order?.created_at).toLocaleString()}
          </p>
        </div>

        <div className="text-right">
          <StatusChip value={order?.status} />

          <p className="text-xs uppercase tracking-widest text-gray-500 mt-4">
            Grand Total
          </p>

          <p className="text-4xl font-extrabold bg-gradient-to-r from-[#38bdf8] to-[#a78bfa] bg-clip-text text-transparent">
            ₹{order?.total}
          </p>
        </div>

      </div>
    </div>

    {/* ================= MAIN GRID ================= */}
    <div className="grid gap-8 md:grid-cols-3">

      {/* ================= ITEMS ================= */}
      <div className="md:col-span-2 rounded-3xl border border-white/10 bg-[#111] p-6">

        <h3 className="text-xl font-semibold mb-6">Items</h3>

        <div className="space-y-4">
          {items?.map((item) => (
            <div
              key={item.id}
              className="group flex items-center justify-between rounded-2xl bg-[#161616] p-4 transition hover:bg-[#1d1d1d]"
            >
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 overflow-hidden rounded-xl bg-[#0f172a]">
                  <Image
                    src={
                      item.product?.images?.[0]?.image_url ||
                      "/images/not-found.png"
                    }
                    alt={item.product_title}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <p className="font-semibold">{item.product_title}</p>
                  <p className="text-xs text-gray-400">
                    QTY {item.quantity}
                  </p>
                </div>
              </div>

              <p className="font-bold text-[#38bdf8] text-lg">
                ₹{item.line_total}
              </p>
            </div>
          ))}
        </div>

      </div>

      {/* ================= SIDE PANEL ================= */}
<div className="space-y-6">

  {/* ADDRESSES PANEL */}
  <GlassPanel title="Addresses">

    <div className="grid gap-6 md:grid-cols-2">

      {/* Shipping */}
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
          Shipping
        </p>
        {shippingLines.map((line, i) => (
          <p key={i} className="text-sm text-gray-300">
            {line}
          </p>
        ))}
      </div>

      {/* Billing */}
      <div>
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
          Billing
        </p>
        {billingLines.map((line, i) => (
          <p key={i} className="text-sm text-gray-300">
            {line}
          </p>
        ))}
      </div>

    </div>

  </GlassPanel>

  {/* PAYMENT PANEL */}
  <GlassPanel title="Payment">
    {payments?.length ? (
      payments.map((tx) => (
        <div
          key={tx.id}
          className="mb-4 rounded-xl bg-[#161616] p-4"
        >
          <p className="text-xs text-gray-400">
            {tx.provider_txn_id}
          </p>
          <p className="font-semibold text-[#38bdf8]">
            ₹{tx.amount}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(tx.created_at).toLocaleString()}
          </p>
        </div>
      ))
    ) : (
      <p className="text-gray-400 text-sm">
        No payments found.
      </p>
    )}
  </GlassPanel>

</div>
    </div>
  </div>
);
}

/* ================= COMPONENTS ================= */

function Card({ title, children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#1a1a1a] p-5 text-sm">
      <h4 className="mb-3 font-semibold">{title}</h4>
      {children}
    </div>
  );
}

function Meta({ label, children }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium">{children}</p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between text-gray-300">
      <span>{label}</span>
      <span>₹{value}</span>
    </div>
  );
}
function GlassPanel({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#111] to-[#151515] p-6">
      <h4 className="mb-4 text-lg font-semibold">{title}</h4>
      {children}
    </div>
  );
}