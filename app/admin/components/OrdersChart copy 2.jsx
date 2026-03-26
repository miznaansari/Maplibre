"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getOrdersChart } from "../actions";

/* ------------------ CONFIG ------------------ */

const ranges = [
  { label: "7D", value: "week" },
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
];

const STATUS_META = {
  CREATED: {
    label: "Created",
    bg: "bg-gray-100",
    text: "text-gray-700",
    color: "#CBD5E1",
  },
  PENDING: {
    label: "Pending",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    color: "#FBBF24",
  },
  PAYMENT_FAILED: {
    label: "Payment Failed",
    bg: "bg-red-100",
    text: "text-red-700",
    color: "#F87171",
  },
  PAID: {
    label: "Paid",
    bg: "bg-green-100",
    text: "text-green-700",
    color: "#22C55E",
  },
  PROCESSING: {
    label: "Processing",
    bg: "bg-blue-100",
    text: "text-blue-700",
    color: "#38BDF8",
  },
  SHIPPED: {
    label: "Shipped",
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    color: "#6366F1",
  },
  DELIVERED: {
    label: "Completed", // UI label
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    color: "#22C55E",
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-red-100",
    text: "text-red-700",
    color: "#EF4444",
  },
  REFUNDED: {
    label: "Refunded",
    bg: "bg-purple-100",
    text: "text-purple-700",
    color: "#EC4899",
  },
};

/* ------------------ COMPONENT ------------------ */

export default function OrdersChart() {
  const [range, setRange] = useState("3m");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    setLoading(true);
    getOrdersChart(range).then(res => {
      setData(res);
      setLoading(false);
    });
  }, [range]);

  const totalOrders = useMemo(
    () =>
      data.reduce(
        (sum, d) =>
          sum +
          Object.keys(STATUS_META).reduce(
            (s, k) => s + (d[k] || 0),
            0
          ),
        0
      ),
    [data]
  );

  const avgPerDay = useMemo(
    () => (data.length ? Math.round(totalOrders / data.length) : 0),
    [totalOrders, data]
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Orders Analytics
          </h2>
          <p className="text-xs text-gray-500">
            Order status distribution over time
          </p>
        </div>

        <div className="flex bg-gray-100 rounded-xl p-1">
          {ranges.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                range === r.value
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <Stat label="Total Orders" value={totalOrders} />
        <Stat label="Avg / Day" value={avgPerDay} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <div key={key} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: meta.color }}
            />
            <span className="text-gray-600">{meta.label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[300px]">
        {loading ? (
          <Skeleton />
        ) : data.length === 0 ? (
          <Empty />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap={20}>
              <defs>
                {Object.entries(STATUS_META).map(([k, m]) => (
                  <linearGradient
                    key={k}
                    id={`grad-${k}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={m.color} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={m.color} stopOpacity={0.75} />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />

              <Tooltip content={<StatusTooltip />} />

              {Object.entries(STATUS_META).map(([key]) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="orders"
                  fill={`url(#grad-${key})`}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={42}
                  animationDuration={600}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/* ------------------ UI PARTS ------------------ */

function Stat({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function StatusTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg min-w-[170px]">
      <p className="text-xs text-gray-500 mb-2">{label}</p>

      {payload
        .filter(p => p.value > 0)
        .sort((a, b) => b.value - a.value)
        .map(p => (
          <div
            key={p.dataKey}
            className="flex items-center justify-between text-xs mb-1"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: p.fill }}
              />
              <span className="text-gray-600">
                {STATUS_META[p.dataKey].label}
              </span>
            </div>
            <span className="font-semibold text-gray-900">
              {p.value}
            </span>
          </div>
        ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="h-full rounded-xl bg-gray-100 animate-pulse" />
  );
}

function Empty() {
  return (
    <div className="h-full flex items-center justify-center text-xs text-gray-400">
      No data available
    </div>
  );
}
