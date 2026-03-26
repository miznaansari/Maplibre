"use client";

import SparkLine from "./SparkLine";

const RANGE_LABEL = {
  week: "Week",
  month: "Month",
  year: "Year",
};

export default function Stat({
  title,
  value,
  change,
  chart,   // 👈 accept chart directly
  range,
}) {
  const positive = Number(change) >= 0;
  const label = RANGE_LABEL[range] || "Period";

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-300 last:border-b-0">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-semibold">{value}</h3>
        <p className={`text-sm ${positive ? "text-green-600" : "text-red-600"}`}>
          {positive && "+"}
          {change}% <span className="text-gray-400">vs last {label}</span>
        </p>
      </div>

      <SparkLine
        data={chart}
        color={positive ? "#22c55e" : "#ef4444"}
      />
    </div>
  );
}
