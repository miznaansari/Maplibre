"use client";

export default function StatusChip({ value, type = "order" }) {
  const ORDER_STATUS_STYLES = {
    CREATED: {
      text: "text-blue-300",
      bg: "bg-blue-500/15",
      border: "border-blue-500/30",
      dot: "bg-blue-400",
    },
    PENDING: {
      text: "text-yellow-300",
      bg: "bg-yellow-500/15",
      border: "border-yellow-500/30",
      dot: "bg-yellow-400",
    },
    PAYMENT_FAILED: {
      text: "text-red-300",
      bg: "bg-red-500/15",
      border: "border-red-500/30",
      dot: "bg-red-400",
    },
    PAID: {
      text: "text-green-300",
      bg: "bg-green-500/15",
      border: "border-green-500/30",
      dot: "bg-green-400",
    },
    PROCESSING: {
      text: "text-cyan-300",
      bg: "bg-cyan-500/15",
      border: "border-cyan-500/30",
      dot: "bg-cyan-400",
    },
    SHIPPED: {
      text: "text-indigo-300",
      bg: "bg-indigo-500/15",
      border: "border-indigo-500/30",
      dot: "bg-indigo-400",
    },
    DELIVERED: {
      text: "text-emerald-300",
      bg: "bg-emerald-500/15",
      border: "border-emerald-500/30",
      dot: "bg-emerald-400",
    },
    CANCELLED: {
      text: "text-red-300",
      bg: "bg-red-500/15",
      border: "border-red-500/30",
      dot: "bg-red-400",
    },
    REFUNDED: {
      text: "text-purple-300",
      bg: "bg-purple-500/15",
      border: "border-purple-500/30",
      dot: "bg-purple-400",
    },
  };

  const DELIVERY_METHOD_STYLES = {
    PICKUP: {
      text: "text-slate-300",
      bg: "bg-slate-500/15",
      border: "border-slate-500/30",
      dot: "bg-slate-400",
    },
    DELIVERY: {
      text: "text-cyan-300",
      bg: "bg-cyan-500/15",
      border: "border-cyan-500/30",
      dot: "bg-cyan-400",
    },
  };

  const PAYMENT_STATUS_STYLES = {
    PENDING: {
      text: "text-yellow-300",
      bg: "bg-yellow-500/15",
      border: "border-yellow-500/30",
      dot: "bg-yellow-400",
    },
    COMPLETED: {
      text: "text-green-300",
      bg: "bg-green-500/15",
      border: "border-green-500/30",
      dot: "bg-green-400",
    },
    FAILED: {
      text: "text-red-300",
      bg: "bg-red-500/15",
      border: "border-red-500/30",
      dot: "bg-red-400",
    },
  };

  const DEFAULT = {
    text: "text-gray-300",
    bg: "bg-gray-500/15",
    border: "border-gray-500/30",
    dot: "bg-gray-400",
  };

  let map = ORDER_STATUS_STYLES;
  if (type === "delivery") map = DELIVERY_METHOD_STYLES;
  if (type === "payment") map = PAYMENT_STATUS_STYLES;

  const style = map[value] || DEFAULT;

  // ✅ Friendly labels
  const LABEL_MAP = {
    PAYMENT_FAILED: "Payment Failed",
    DELIVERED: "Completed",
  };

  const label =
    LABEL_MAP[value] ||
    (typeof value === "string" ? value.replace(/_/g, " ") : "—");

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-medium whitespace-nowrap ${style.bg} ${style.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      <span className={style.text}>{label}</span>
    </span>
  );
}