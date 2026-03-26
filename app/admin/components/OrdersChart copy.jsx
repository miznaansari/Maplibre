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

const ranges = [
  { label: "7D", value: "week" },
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
];

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

  const total = useMemo(
    () => data.reduce((s, d) => s + d.orders, 0),
    [data]
  );

  const avg = useMemo(
    () => (data.length ? Math.round(total / data.length) : 0),
    [total, data]
  );

  const bestDay = useMemo(() => {
    if (!data.length) return null;
    return data.reduce((max, d) => (d.orders > max.orders ? d : max));
  }, [data]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Orders Analytics
          </h2>
          <p className="text-xs text-gray-500">
            Daily order volume & performance
          </p>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1">
          {ranges.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 text-xs rounded-md transition ${
                range === r.value
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Stat label="Total orders" value={total} />
        <Stat label="Avg / day" value={avg} />
        <Stat
          label="Best day"
          value={bestDay ? bestDay.orders : "—"}
          sub={bestDay ? bestDay.date : ""}
        />
      </div>

      {/* Insight */}
      {bestDay && (
        <div className="mb-3 text-xs text-gray-600">
          🔥 Peak activity on{" "}
          <span className="font-medium text-gray-900">
            {bestDay.date}
          </span>{" "}
          with{" "}
          <span className="font-medium text-gray-900">
            {bestDay.orders} orders
          </span>
        </div>
      )}

      {/* Chart */}
      <div className="h-[260px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            Loading chart…
          </div>
        ) : data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap={18}>
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
              />
              <Tooltip content={<CustomTooltip />} />

              <defs>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity={1} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0.2} />
                </linearGradient>
              </defs>

              <Bar
                dataKey="orders"
                fill="url(#ordersGradient)"
                radius={[10, 10, 6, 6]}
                maxBarSize={42}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/* ---------- Components ---------- */

function Stat({
  label,
  value,
  sub,
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
      {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
      <p className="text-xs text-gray-500">{payload[0].payload.date}</p>
      <p className="text-sm font-semibold text-gray-900">
        {payload[0].value} orders
      </p>
    </div>
  );
}
