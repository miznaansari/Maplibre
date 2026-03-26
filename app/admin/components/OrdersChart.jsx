"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { getOrdersChart } from "../actions";

/* ApexCharts dynamic import */
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

/* ------------------ CONFIG ------------------ */

const ranges = [
  { label: "7D", value: "week" },
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
];

const STATUS_META = {
  CREATED: { label: "Created", color: "#CBD5E1" },
  PENDING: { label: "Pending", color: "#FBBF24" },
  PAYMENT_FAILED: { label: "Payment Failed", color: "#F87171" },
  PAID: { label: "Paid", color: "#22C55E" },
  PROCESSING: { label: "Processing", color: "#38BDF8" },
  SHIPPED: { label: "Shipped", color: "#6366F1" },
  DELIVERED: { label: "Completed", color: "#10B981" },
  CANCELLED: { label: "Cancelled", color: "#EF4444" },
  REFUNDED: { label: "Refunded", color: "#EC4899" },
};

/* ------------------ COMPONENT ------------------ */

export default function OrdersChart() {
  const [range, setRange] = useState("week");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getOrdersChart(range).then((res) => {
      setData(res || []);
      setLoading(false);
    });
  }, [range]);

  /* ------------------ KPIs ------------------ */

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

  /* ------------------ Apex Data ------------------ */

  const categories = useMemo(
    () => data.map((d) => d.date),
    [data]
  );

  const series = useMemo(
    () =>
      Object.entries(STATUS_META).map(([key, meta]) => ({
        name: meta.label,
        data: data.map((d) => d[key] || 0),
        color: meta.color,
      })),
    [data]
  );

  /* ------------------ Apex Options ------------------ */

  const options = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
     animations: {
  enabled: true,
  easing: "easeout",
  speed: 800,
  animateGradually: {
    enabled: true,
    delay: 80, // stagger bars
  },
  dynamicAnimation: {
    enabled: true,
    speed: 500,
  },
},

    },

    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: "55%",
      },
    },

    dataLabels: { enabled: false },

    xaxis: {
      categories,
      labels: {
        style: { fontSize: "11px", colors: "#6B7280" },
      },
    },

    yaxis: {
      labels: {
        style: { fontSize: "11px", colors: "#6B7280" },
      },
    },

    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (v) => v,
      },
    },

    legend: {
      show: false, // we already render custom legend
    },

    grid: {
      strokeDashArray: 3,
      borderColor: "#E5E7EB",
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded p-6 shadow-sm">
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

        <div className="flex bg-gray-100 rounded p-1">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-all ${range === r.value
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
        {/* <Stat label="Avg / Day" value={avgPerDay} /> */}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs">
        {Object.entries(STATUS_META).map(([k, m]) => (
          <div key={k} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: m.color }}
            />
            <span className="text-gray-600">{m.label}</span>
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
          <Chart
            options={options}
            series={series}
            type="bar"
            height={300}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------ UI PARTS ------------------ */

function Stat({ label, value }) {
  return (
    <div className="bg-gray-50 rounded p-4 border border-gray-100">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="h-full rounded bg-gray-100 animate-pulse" />
  );
}

function Empty() {
  return (
    <div className="h-full flex items-center justify-center text-xs text-gray-400">
      No data available
    </div>
  );
}
