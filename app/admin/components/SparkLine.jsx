"use client";

import dynamic from "next/dynamic";

/* ApexCharts must be dynamically imported */
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function SparkLine({ data = [], color = "#4f46e5" }) {
  if (!data.length) return null;

  const options = {
    chart: {
      type: "area",
      sparkline: { enabled: true },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 500,
      },
    },
    stroke: {
      curve: "smooth",
      width: 2.5,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 0.4,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    colors: [color],
    tooltip: {
      enabled: true,
      x: { show: false },
      y: {
        formatter: (v) => `Value: ${v}`,
      },
    },
  };

  const series = [
    {
      name: "Value",
      data,
    },
  ];

  return (
    <div className="w-24 h-10 hover:scale-105 transition-transform">
      <Chart
        options={options}
        series={series}
        type="area"
        height={40}
      />
    </div>
  );
}
