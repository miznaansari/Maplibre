"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomerAutocomplete({
  customers = [],
  value,
  onChange,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState("down");

  const containerRef = useRef(null);

  /* ===============================
     RESTORE SELECTED VALUE
  =============================== */
  const restoreSelected = () => {
    if (!customers.length) return;

    if (value === null || value === undefined) {
      setQuery("Everyone");
      return;
    }

    const selected = customers.find((c) => c.id === value);

    if (selected) {
      setQuery(`${selected.name} (${selected.email})`);
    }
  };

  useEffect(() => {
    restoreSelected();
  }, [value, customers]);

  /* ===============================
     FILTER
  =============================== */
  const filtered = customers.filter((c) =>
    `${c.name || ""} ${c.email || ""}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  /* ===============================
     SELECT
  =============================== */
  const selectCustomer = (c) => {
    const label = c.id ? `${c.name} (${c.email})` : "Everyone";

    setQuery(label);
    onChange?.(c.id ?? null);

    setOpen(false);
  };

  /* ===============================
     DETECT SPACE
  =============================== */
  const detectDirection = () => {
    const rect = containerRef.current?.getBoundingClientRect();

    if (!rect) return;

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < 260 && spaceAbove > spaceBelow) {
      setDirection("up");
    } else {
      setDirection("down");
    }
  };

  const openDropdown = () => {
    detectDirection();
    setOpen(true);
  };

  /* ===============================
     CLOSE OUTSIDE
  =============================== */
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
        restoreSelected();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [customers, value]);

  /* ===============================
     CLOSE ON SCROLL
  =============================== */
useEffect(() => {
  const handler = () => {
    if (!open) return;
    detectDirection();
  };

  window.addEventListener("scroll", handler, true);
  window.addEventListener("resize", handler);

  return () => {
    window.removeEventListener("scroll", handler, true);
    window.removeEventListener("resize", handler);
  };
}, [open]);
  return (
    <div ref={containerRef} className="relative w-72">

      <input
        type="text"
        value={query}
        placeholder="Select customer..."
        onChange={(e) => {
          setQuery(e.target.value);
          openDropdown();
        }}
        onFocus={openDropdown}
        onBlur={() => {
          setTimeout(() => {
            if (!open) restoreSelected();
          }, 120);
        }}
        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {open && (
        <div
          className={`absolute z-50 max-h-60 w-full overflow-auto rounded border border-gray-200 bg-white shadow-lg
          ${direction === "down" ? "top-full mt-1" : "bottom-full mb-1"}`}
        >
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              No customers found
            </div>
          )}

          {filtered.map((c) => (
            <button
              key={c.id ?? "everyone"}
              type="button"
              onMouseDown={() => selectCustomer(c)}
              className="flex w-full flex-col px-3 py-2 text-left hover:bg-gray-100"
            >
              <span className="text-sm font-medium">
                {c.id ? c.name : "Everyone"}
              </span>

              {c.email && (
                <span className="text-xs text-gray-500">{c.email}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}