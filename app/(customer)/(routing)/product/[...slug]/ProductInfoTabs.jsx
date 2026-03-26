"use client";

import { useEffect, useRef, useState } from "react";

export default function ProductInfoTabs({
  description = "Drop-shoulder oversized fit with digital void artwork. Premium 240GSM cotton for the ultimate streetwear drape.",
  fabric = "Premium Cotton",
  fit = "Oversized",
  print = "Screen Print",
  wash = "Cold Machine Wash",

  sizing = [
    { size: "XS", chest: '36"', length: '26"', shoulder: '16"' },
    { size: "S", chest: '38"', length: '27"', shoulder: '17"' },
    { size: "M", chest: '40"', length: '28"', shoulder: '18"' },
    { size: "L", chest: '42"', length: '29"', shoulder: '19"' },
    { size: "XL", chest: '44"', length: '30"', shoulder: '20"' },
    { size: "XXL", chest: '46"', length: '31"', shoulder: '21"' },
  ],

  reviews = [
    {
      name: "Kiran D.",
      rating: 5,
      text: "Absolutely fire. The fabric quality exceeded my expectations. This is my 3rd purchase.",
    },
    {
      name: "Zara M.",
      rating: 5,
      text: "The fit is perfect and the print is super crisp. Washed it 5 times, still holding up perfectly.",
    },
    {
      name: "Arjun V.",
      rating: 4,
      text: "Great quality but slightly longer than expected. Still a banger piece.",
    },
  ],
}) {
  const [tab, setTab] = useState("description");

  const tabs = [
    { id: "description", label: "Description" },
    { id: "sizing", label: "Sizing" },
    { id: "reviews", label: "Reviews" },
  ];

  const avgRating =
    reviews.reduce((a, b) => a + b.rating, 0) / reviews.length;


  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const tabsRef = useRef([]);

  useEffect(() => {
    const index = tabs.findIndex((t) => t.id === tab);
    const el = tabsRef.current[index];

    if (el) {
      setIndicator({
        left: el.offsetLeft,
        width: el.offsetWidth,
      });
    }
  }, [tab]);

  return (
    <div className=" text-white mt-16 px-10 max-w-7xl mx-auto ">

      {/* Tabs */}
    <div className="relative border-b border-white/10 mb-8">

      <div className="flex gap-8 relative">

        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => (tabsRef.current[i] = el)}
            onClick={() => setTab(t.id)}
            className={`pb-3 text-sm uppercase tracking-wider transition
            ${
              tab === t.id
                ? "text-cyan-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}

        {/* Animated indicator */}
        <span
          className="absolute bottom-0 h-[2px] bg-cyan-400 transition-all duration-300 ease-out"
          style={{
            left: indicator.left,
            width: indicator.width,
          }}
        />

      </div>
    </div>

      {/* DESCRIPTION */}
      {tab === "description" && (
        <div className="space-y-6">

          <p className="text-gray-300 max-w-3xl">
            {description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <FeatureCard title="Fabric" value={fabric} />
            <FeatureCard title="Fit" value={fit} />
            <FeatureCard title="Print" value={print} />
            <FeatureCard title="Wash" value={wash} />

          </div>

        </div>
      )}

      {/* SIZING */}
      {tab === "sizing" && (
        <div className="overflow-x-auto">

          <table className="w-full text-left text-sm">

            <thead className="text-gray-400 border-b border-white/10">
              <tr>
                <th className="py-3">Size</th>
                <th>Chest (in)</th>
                <th>Length (in)</th>
                <th>Shoulder (in)</th>
              </tr>
            </thead>

            <tbody>
              {sizing.map((s, i) => (
                <tr
                  key={i}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="py-3 text-cyan-400 font-medium">
                    {s.size}
                  </td>
                  <td>{s.chest}</td>
                  <td>{s.length}</td>
                  <td>{s.shoulder}</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}

      {/* REVIEWS */}
      {tab === "reviews" && (
        <div className="space-y-8">

          {/* rating */}
          <div className="flex items-center gap-6">

            <div className="text-5xl font-bold">
              {avgRating.toFixed(1)}
            </div>

            <div>

              <Stars rating={Math.round(avgRating)} />

              <p className="text-gray-400 text-sm mt-1">
                {reviews.length} reviews
              </p>

            </div>

          </div>

          {/* review list */}
          <div className="space-y-4">

            {reviews.map((r, i) => (
              <div
                key={i}
                className="border border-white/10 rounded-xl p-5 bg-white/[0.02]"
              >

                <div className="flex justify-between mb-2">

                  <p className="font-semibold">
                    {r.name}
                  </p>

                  <Stars rating={r.rating} />

                </div>

                <p className="text-gray-400 text-sm">
                  {r.text}
                </p>

              </div>
            ))}

          </div>

        </div>
      )}

    </div>
  );
}

function FeatureCard({ title, value }) {
  return (
    <div className="border border-white/10 rounded-xl p-4 bg-white/[0.02]">

      <p className="text-gray-400 text-xs uppercase mb-1">
        {title}
      </p>

      <p className="font-semibold">
        {value}
      </p>

    </div>
  );
}

function Stars({ rating }) {
  return (
    <div className="text-yellow-400 text-sm">
      {"★".repeat(rating)}
      {"☆".repeat(5 - rating)}
    </div>
  );
}