import {
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

export default function StatCard({
  title,
  value,
  percent,
  trend = "up", // "up" | "down"
  icon: Icon,
}) {
  const isUp = trend === "up";

  return (
    <div className="w-full rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
      {/* Icon */}
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded bg-gray-100 shadow-inner">
        <Icon className="h-5 w-5 text-gray-700" />
      </div>

      {/* Title */}
      <p className="text-sm text-gray-500">{title}</p>

      {/* Value + Badge */}
      <div className="mt-2 flex items-center justify-between">
        <h3 className="text-3xl font-semibold text-gray-900">
          {value}
        </h3>

        <span
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium shadow-sm
            ${isUp
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
            }`}
        >
          {isUp ? (
            <ArrowUpIcon className="h-3 w-3" />
          ) : (
            <ArrowDownIcon className="h-3 w-3" />
          )}
          {percent}
        </span>
      </div>
    </div>
  );
}
