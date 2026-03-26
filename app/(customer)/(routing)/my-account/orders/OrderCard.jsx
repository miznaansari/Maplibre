import Link from "next/link";
import StatusChip from "@/app/admin/UI/common/StatusChip";

export default function OrderCard({ order }) {
  const formattedDate = new Date(order.created_at).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Link href={`/order/${order.id}`} className="group">
      <div
        className="
          relative overflow-hidden rounded-3xl
          bg-white
          border border-gray-200
          p-6
          transition-all duration-300
          hover:-translate-y-1
          hover:shadow-xl
          hover:border-[#347eb3]/40
        "
      >
        {/* Soft Glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#347eb3]/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[#6366f1]/10 blur-3xl" />
        </div>

        <div className="relative space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-500">
                Order
              </p>

              <h2 className="text-2xl font-bold text-gray-900">
                #{order.order_number}
              </h2>
            </div>

            <StatusChip value={order.status} />
          </div>

          {/* Total */}
          <div>
            {/* <p className="text-xs uppercase tracking-widest text-gray-500">
              Total
            </p> */}

            {/* <p className="
              text-3xl font-extrabold
              bg-gradient-to-r from-[#347eb3] to-[#6366f1]
              bg-clip-text text-transparent
            ">
              ${order.total.toFixed(2)}
            </p> */}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{formattedDate}</span>

            <span className="group-hover:text-gray-900 transition">
              View →
            </span>
          </div>

        </div>
      </div>
    </Link>
  );
}