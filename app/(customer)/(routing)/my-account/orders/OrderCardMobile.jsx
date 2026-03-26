"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function OrderCardMobile({ order }) {
  const total = parseFloat(order?.total);

  const statusMap = {
    delivered: {
      text: "text-emerald-700",
      bg: "bg-emerald-100",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      label: "Delivered",
    },
    created: {
      text: "text-blue-700",
      bg: "bg-blue-100",
      border: "border-blue-200",
      dot: "bg-blue-500",
      label: "Created",
    },
    pending: {
      text: "text-yellow-700",
      bg: "bg-yellow-100",
      border: "border-yellow-200",
      dot: "bg-yellow-500",
      label: "Pending",
    },
    cancelled: {
      text: "text-red-700",
      bg: "bg-red-100",
      border: "border-red-200",
      dot: "bg-red-500",
      label: "Cancelled",
    },
    paid: {
      text: "text-green-700",
      bg: "bg-green-100",
      border: "border-green-200",
      dot: "bg-green-500",
      label: "Paid",
    },
  };

  const status =
    statusMap[order?.status?.toLowerCase()] || {
      text: "text-gray-700",
      bg: "bg-gray-100",
      border: "border-gray-200",
      dot: "bg-gray-400",
      label: order?.status || "Unknown",
    };

  return (
    <Link
      href={`/order/${order.id}`}
      className="block group active:scale-[0.98] transition"
    >
      <div className="relative overflow-hidden border border-gray-200 bg-white px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition">

        {/* subtle hover highlight */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-[#347eb3]/5 via-transparent to-[#6366f1]/5" />

        <div className="relative flex items-center justify-between">

          {/* LEFT */}
          <div className="flex flex-col gap-1.5">

            {/* Order ID */}
            <div className="text-sm font-semibold text-gray-900 tracking-wide">
              #{order?.order_number || "—"}
            </div>

            {/* Date */}
            <div className="text-[11px] text-gray-500">
              {order?.created_at
                ? new Date(order.created_at).toLocaleDateString()
                : "—"}
            </div>

            {/* Status */}
            <div className="flex items-center gap-1.5">
              <div
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${status.bg} ${status.border}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                <span className={`text-[11px] font-medium ${status.text}`}>
                  {status.label}
                </span>
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            {/* Price */}
            {/* <div className="text-sm font-semibold text-gray-900">
              ₹{!isNaN(total) ? total.toFixed(2) : "0.00"}
            </div> */}

            {/* Arrow */}
            <div className="rounded-full p-1 bg-gray-100 group-hover:bg-gray-200 transition">
              <ArrowRightIcon className="h-4 w-4 text-gray-500 group-hover:text-gray-900 transition" />
            </div>

          </div>

        </div>
      </div>
    </Link>
  );
}