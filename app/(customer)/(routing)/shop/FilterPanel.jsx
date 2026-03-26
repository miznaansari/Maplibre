"use client";

import { useRouter } from "next/navigation";

export default function FilterPanel({ query }) {
  const router = useRouter();

  const update = (key, value) => {
    const params = new URLSearchParams({
      ...query,
      [key]: value,
    });
    router.push(`?${params}`);
  };

  const isActive = (key, value) => query?.[key] === value;

  return (
    <div className="space-y-6 rounded-2xl border border-white/10 bg-[#151515] p-5">

      {/* TITLE */}
      <h2 className="text-sm font-semibold tracking-wide text-gray-300">
        Filters
      </h2>

      {/* ================= CATEGORY ================= */}
      <div>
        <p className="mb-2 text-xs uppercase tracking-widest text-gray-500">
          Category
        </p>

        <div className="flex flex-wrap gap-2">
          {["dress", "tshirt", "hoodie"].map((cat) => {
            const active = isActive("category", cat);

            return (
              <button
                key={cat}
                onClick={() => update("category", cat)}
                className={`
                  px-4 py-2 text-xs rounded-full transition-all duration-300
                  border
                  ${active
                    ? "bg-[#347eb3]/10 border-[#38bdf8] text-[#38bdf8] shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                    : "border-white/10 text-gray-400 hover:border-[#38bdf8]/40 hover:text-white"}
                `}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= SIZE ================= */}
      <div>
        <p className="mb-2 text-xs uppercase tracking-widest text-gray-500">
          Size
        </p>

        <div className="flex flex-wrap gap-2">
          {["S", "M", "L", "XL"].map((s) => {
            const active = isActive("size", s);

            return (
              <button
                key={s}
                onClick={() => update("size", s)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-300
                  border
                  ${active
                    ? "bg-[#38bdf8] text-black border-[#38bdf8] shadow-[0_0_10px_rgba(56,189,248,0.5)] scale-105"
                    : "border-white/10 text-gray-400 hover:border-[#38bdf8]/50 hover:text-white"}
                `}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= ACTIVE FILTERS ================= */}
      {(query?.category || query?.size) && (
        <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2">

          {query?.category && (
            <span className="text-xs px-3 py-1 rounded-full bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30">
              {query.category}
            </span>
          )}

          {query?.size && (
            <span className="text-xs px-3 py-1 rounded-full bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/30">
              Size: {query.size}
            </span>
          )}

          <button
            onClick={() => router.push("?")}
            className="text-xs text-gray-500 hover:text-white transition"
          >
            Clear ✕
          </button>
        </div>
      )}

    </div>
  );
}