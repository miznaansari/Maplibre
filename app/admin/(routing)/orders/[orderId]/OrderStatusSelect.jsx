"use client";

import { useRef, useState, startTransition } from "react";
import { updateOrderStatusAction } from "./action";
import { useToast } from "@/app/admin/context/ToastProvider";
import StatusChip from "@/app/admin/UI/common/StatusChip";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

const ORDER_STATUSES = [
  "CREATED",
  "PENDING",
  "PAYMENT_FAILED",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export default function OrderStatusSelect({ order }) {
  const { showToast } = useToast();

  const lastValidStatus = useRef(order.status);
  const [status, setStatus] = useState(order.status);
  const [pending, setPending] = useState(false);

  const handleChange = async (nextStatus) => {
    setPending(true);

    startTransition(() => {
      setStatus(nextStatus);
    });

    const res = await updateOrderStatusAction({
      orderId: order.id,
      status: nextStatus,
    });

    showToast({
      type: res.success ? "success" : "error",
      message: res.message,
    });

    if (!res.success) {
      setStatus(lastValidStatus.current);
    } else {
      lastValidStatus.current = nextStatus;
    }

    setPending(false);
  };

  return (
    <div className="relative inline-flex items-center gap-1">
      {/* Selected chip */}
      <StatusChip value={status} />

      {/* Down arrow */}
      <ChevronDownIcon
        className="h-4 w-4 text-gray-500 pointer-events-none"
        aria-hidden="true"
      />

      {/* Native select (invisible but clickable) */}
      <select
        value={status}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Change order status"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </div>
  );
}
