"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "./action";
import Stat from "./Stat";

export default function NewCard() {
  const [range, setRange] = useState("week");
  const [data, setData] = useState(null);

  useEffect(() => {
    getDashboardStats(range).then(setData);
  }, [range]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow p-5">
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold">Business Stats</h2>
       <div className="flex bg-gray-100 rounded-lg p-1 text-xs">
  {[
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
    { label: "Year", value: "year" },
  ].map((r) => (
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

      <Stat {...data.customers} title="New Customers" range={range} />
      <Stat {...data.orders} title="Orders" range={range} />
      <Stat
        {...data.revenue}
        title="Revenue"
        value={`₹${data.revenue.value}`}
        range={range}
      />
    </div>
  );
}
