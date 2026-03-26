"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { getRevenueChart } from "../actions";

/* ApexCharts must be dynamically imported in Next.js */
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

/* ---------------- Range Options ---------------- */
const ranges = [
  { label: "7D", value: "week" },
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "6M", value: "6m" },
];

export default function RevenueChart() {
  const [range, setRange] = useState("week");
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- Fetch Data ---------------- */
  useEffect(() => {
    let active = true;

    async function fetchData() {
      setLoading(true);
      const res = await getRevenueChart(range);
      if (active) {
        setRawData(res ?? []);
        setLoading(false);
      }
    }

    fetchData();
    return () => (active = false);
  }, [range]);

  /* ---------------- Chart Data ---------------- */
  const categories = useMemo(
    () => rawData.map((i) => i.date),
    [rawData]
  );

  const series = useMemo(
    () => [
      {
        name: "Revenue",
        data: rawData.map((i) => i.revenue),
      },
    ],
    [rawData]
  );

  /* ---------------- Apex Options ---------------- */
const options = {
  chart: {
    type: "bar",
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
      columnWidth: "45%",
    },
  },

  dataLabels: { enabled: false },

  xaxis: {
    categories,
    labels: { style: { fontSize: "12px" } },
    tooltip: {
      enabled: false, // keep axis clean
    },
  },

  yaxis: {
    labels: {
      formatter: (v) =>
        v >= 1000 ? `${Math.round(v / 1000)}k` : v,
    },
  },

  tooltip: {
    shared: true,      // ✅ hover anywhere in category
    intersect: false,  // ✅ no need to touch the bar
    followCursor: true,

    y: {
      formatter: (v) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(v),
    },
  },

  grid: {
    strokeDashArray: 4,
    borderColor: "#e5e7eb",
  },

  colors: ["#4f46e5"],
};


  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">
          Sales Overview
        </h2>

        <div className="flex bg-gray-100 rounded-lg p-1 text-xs">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1 rounded-md transition ${
                range === r.value
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[320px]">
        {loading ? (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">
            Loading…
          </div>
        ) : (
          <Chart
            options={options}
            series={series}
            type="bar"
            height={320}
          />
        )}
      </div>
    </div>
  );
}
