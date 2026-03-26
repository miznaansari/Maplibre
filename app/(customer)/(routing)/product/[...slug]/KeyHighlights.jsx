"use client";

import React from "react";

export default function KeyHighlights({ data = [] }) {
  return (
    <div className="
      w-full max-w-md
      rounded-xl
      bg-[#1a1a1a]
      border border-white/10
      shadow-[0_4px_30px_rgba(0,0,0,0.6)]
      p-4
    ">

      {/* TITLE */}
      <h3 className="
        text-sm font-semibold
        text-white
        tracking-wide
        mb-4
        pl-2
      ">
        Key Highlights
      </h3>

      {/* ✅ 2 COLUMN CARDS */}
      <div className="grid grid-cols-2 gap-4">

        {data.map((item, i) => (
          <div
            key={i}
            className="
              rounded-lg
              bg-white/[0.02]
              p-3
              transition
              hover:bg-white/[0.05]
            "
          >
            {/* LABEL */}
            <p className="text-xs text-[#9ca3af] mb-1">
              {item.label}
            </p>

            {/* VALUE */}
            <p className="
              text-sm font-medium text-[#d1d5db]
            ">
              {item.value}
            </p>
          </div>
        ))}

      </div>
    </div>
  );
}