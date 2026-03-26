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
      <div className="min-h-screen  px-2 py-2 space-y-2">

        <div className="rounded-2xl border border-gray-200 bg-white p-2">
          <div className="flex justify-between">
            <div className="space-y-3">
              <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-56 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
            </div>

            <div className="space-y-2 text-right">
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white">

            <div className="p-4 border-b border-gray-200">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>

            {[1, 2].map((i) => (
              <div key={i} className="flex justify-between items-center p-4 border-b border-gray-100">

                <div className="flex gap-3 items-center">
                  <div className="h-14 w-14 bg-gray-200 rounded animate-pulse" />

                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>

                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">

            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />

            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}

          </div>
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
    <div className="min-h-screen  px-2 py-2 space-y-2">

      {/* HERO */}

      <div className="rounded-2xl border border-gray-200 bg-white p-2 flex flex-col md:flex-row md:justify-between md:items-center">

        <div>
          <p
            onClick={() => router.back()}
            className="text-sm text-gray-500 cursor-pointer hover:text-black"
          >
            ← Back to Orders
          </p>

          <h1 className="text-md md:text-2xl font-bold text-gray-900 mt-1">
            Order #{order?.order_number}
          </h1>

          <p className="text-gray-500 text-sm">
            {new Date(order?.created_at).toLocaleString()}
          </p>
        </div>

        <div className="text-right">
          <StatusChip value={order?.status} />

          {/* <p className="text-xs text-gray-500 mt-2">Total</p>

          <p className="text-2xl font-bold text-[#347eb3]">
            ₹{order?.total}
          </p> */}
        </div>
      </div>

      {/* GRID */}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ITEMS */}

        <div className="lg:col-span-2 space-y-6">

          <div className="rounded-2xl border border-gray-200 bg-white">

            <h3 className="p-4 border-b border-gray-200 font-semibold text-gray-900">
              Items
            </h3>

            {items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border-b border-gray-100 last:border-none"
              >

                <div className="flex gap-3">

                  <div className="h-14 w-14 rounded-lg overflow-hidden bg-gray-100">

                    <img
                      src={
                        item.product?.images?.[0]?.image_url ||
                        "/images/not-found.png"
                      }
                      alt=""
                      width="56"
                      height="56"
                      className="object-cover"
                    />

                  </div>

                  <div>
                    <p className="font-medium text-gray-900">
                      {item.product_title}
                    </p>

                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>

                {/* <p className="font-semibold text-[#347eb3]">
                  ₹{item.line_total}
                </p> */}

              </div>
            ))}

          </div>
        </div>

        {/* SUMMARY */}

        <div className="space-y-6">

          {/* <div className="rounded-2xl border border-gray-200 bg-white p-5">

            <h3 className="font-semibold mb-4 text-gray-900">
              Order Summary
            </h3>

            <SummaryRow label="Subtotal" value={order?.sub_total} />
            <SummaryRow label="Shipping" value={order?.shipping_amount} />
            <SummaryRow label="GST" value={order?.tax_amount} />

            <div className="border-t border-gray-200 my-3" />

            <div className="flex justify-between font-bold text-lg text-[#347eb3]">
              <span>Total</span>
              <span>₹{order?.total}</span>
            </div>

          </div> */}

          {/* <Card title="Payments">

            {paypal?.length ? (
              paypal.map((tx) => (
                <div key={tx.id} className="mb-3 text-sm">

                  <p className="text-gray-500">
                    {tx.providerTxnId}
                  </p>

                  <p className="text-[#347eb3] font-semibold">
                    ₹{tx.amount}
                  </p>

                  <p className="text-xs text-gray-400">
                    {new Date(tx.createdAt).toLocaleString()}
                  </p>

                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                No transactions
              </p>
            )}

          </Card> */}

          <div className="space-y-4">

            <Accordion title="Shipping Address">
              {shippingLines.map((l, i) => (
                <p key={i} className="text-sm text-gray-700">
                  {l}
                </p>
              ))}
            </Accordion>

            <Accordion title="Billing Address">

              {billingLines.map((l, i) => (
                <p key={i} className="text-sm text-gray-700">
                  {l}
                </p>
              ))}

              {order?.gst_number && (
                <p className="mt-3 text-xs text-[#347eb3]">
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

/* COMPONENTS */

function Card({ title, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h4 className="mb-3 font-semibold text-gray-900">{title}</h4>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm text-gray-600 mb-2">
      <span>{label}</span>
      <span>₹{value}</span>
    </div>
  );
}