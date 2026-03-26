"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import SwipeableDrawer from "../../UI/common/SwipeableDrawer";

export default function ProductSearch({
  searchPlaceholder = "Search...",
  filters = [],
  title = "Products",
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [openDrawer, setOpenDrawer] = useState(false);

  function updateParam(key, value) {
    const sp = new URLSearchParams(params.toString());

    if (!value) sp.delete(key);
    else sp.set(key, value);

    sp.set("page", "1");
    router.push(`?${sp.toString()}`);
  }

  function onSearch(e) {
    updateParam("search", e.target.value);
  }

  const inlineFilters = filters.filter((f) => f.showInline);

  return (
    <>
      {/* HEADER */}
      <div className="flex items-center w-full justify-between gap-3 py-2">
        <div className="flex items-center gap-3">
          <h2 className="ml-2 text-lg font-semibold text-gray-900">
            {title}
          </h2>

          {/* DESKTOP SEARCH */}
          <input
            defaultValue={params.get("search") || ""}
            onChange={onSearch}
            placeholder={searchPlaceholder}
            className="hidden w-64 rounded border border-gray-200 px-3 py-2 text-sm md:block"
          /></div>

        {/* MOBILE FILTER BUTTON */}
        <button
          onClick={() => setOpenDrawer(true)}
          className="md:hidden flex items-center justify-center
           rounded border border-gray-200
           min-h-10 min-w-10 px-3 py-2
           text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
          </svg>



        </button>
      </div>

      {/* DESKTOP INLINE FILTERS */}
      <div className="hidden gap-2 md:flex">
        {inlineFilters.map((filter) => (
          <select
            key={filter.key}
            value={params.get(filter.key) || ""}
            onChange={(e) => updateParam(filter.key, e.target.value)}
            className="rounded border border-gray-200 px-2 py-2 text-sm"
          >
            <option value="">{filter.label}</option>
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      {/* 📱 MOBILE DRAWER */}
      <SwipeableDrawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
      >
        <h3 className="mb-4 text-base font-semibold">Filters</h3>

        {/* SEARCH */}
        <input
          defaultValue={params.get("search") || ""}
          onChange={onSearch}
          placeholder={searchPlaceholder}
          className="mb-4 w-full rounded border border-gray-200 px-3 py-2 text-base"
        />

        {/* FILTERS */}
        {filters.map((filter) => (
          <div key={filter.key} className="mb-4">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              {filter.label}
            </label>
            <select
              value={params.get(filter.key) || ""}
              onChange={(e) => updateParam(filter.key, e.target.value)}
              className="w-full rounded border border-gray-200 px-3 py-2 text-base"
            >
              <option value="">All</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        <button
          onClick={() => setOpenDrawer(false)}
          className="mt-2 w-full rounded bg-blue-600  py-2 text-base font-medium text-white"
        >
          Apply Filters
        </button>
      </SwipeableDrawer>
    </>
  );
}
