"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight } from "../../customer/components/Navbar/Icons";
import clsx from "clsx";

/* -------------------------------------------------------
   Utils
------------------------------------------------------- */

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [handler]);
}

function getSmartDirection(el, parentDir = {}) {
  if (!el) return { x: "right", y: "down" };

  // 🔒 inherit direction once decided
  if (parentDir.x || parentDir.y) {
    return {
      x: parentDir.x || "right",
      y: parentDir.y || "down",
    };
  }

  const r = el.getBoundingClientRect();

  return {
    x: r.right + 280 > window.innerWidth ? "left" : "right",
    y: r.bottom + 300 > window.innerHeight ? "up" : "down",
  };
}

/* -------------------------------------------------------
   Component
------------------------------------------------------- */

export default function QuickOrderTopBar({ menuData = [], onCategorySelect }) {
  const ref = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [l1, setL1] = useState(null);
  const [l2, setL2] = useState(null);
  const [l3, setL3] = useState(null);

  const [dir2, setDir2] = useState({});
  const [dir3, setDir3] = useState({});

  useClickOutside(ref, () => {
    setL1(null);
    setL2(null);
    setL3(null);
    setMobileOpen(false);
  });

  const filter = (path) => {
    if (path) onCategorySelect(path);
    setMobileOpen(false);
  };

  return (
    <div ref={ref} className="w-full bg-[#0072BC] text-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-12 items-center justify-between">

          <span className="font-semibold">Quick Order</span>

          <button
            className="md:hidden rounded bg-white/10 px-3 py-1 text-sm"
            onClick={() => setMobileOpen((s) => !s)}
          >
            Categories
          </button>

          {/* ================= DESKTOP ================= */}
          <ul className="hidden md:flex gap-8 text-sm font-semibold">

            <li
              className="cursor-pointer hover:text-yellow-300"
              onClick={() => filter(null)}
            >
              All Products
            </li>

            {menuData.map((m1, i1) => (
              <li
                key={m1.title}
                className="relative"
                onMouseEnter={() => {
                  setL1(i1);
                  setL2(null);
                  setL3(null);
                }}
              >
                <div className="flex items-center gap-1">
                  <button
                    className="hover:text-yellow-300"
                    onClick={() => filter(m1.path)}
                  >
                    {m1.title}
                  </button>

                  {m1.children && (
                    <button onClick={() => setL1(l1 === i1 ? null : i1)}>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* LEVEL 2 */}
                {m1.children && l1 === i1 && (
                  <ul className="absolute left-0 top-full mt-2 w-72 bg-white text-black shadow-xl">
                    {m1.children.map((m2, i2) => (
                      <li
                        key={m2.title}
                        className="relative"
                        onMouseEnter={(e) => {
                          setL2(i2);
                          setDir2(getSmartDirection(e.currentTarget));
                        }}
                      >
                        <div className="flex items-center justify-between px-4 py-3 hover:bg-sky-50">
                          <button
                            className="font-semibold text-left"
                            onClick={() => filter(m2.path)}
                          >
                            {m2.title}
                          </button>

                          {m2.children && (
                            <ChevronRight className="h-4 w-4 text-sky-600" />
                          )}
                        </div>

                        {/* LEVEL 3 */}
                        {m2.children && l2 === i2 && (
                          <ul
                            className={clsx(
                              "absolute top-0 w-72 bg-white shadow-xl",
                              dir2.x === "right" ? "left-full" : "right-full",
                              dir2.y === "up" && "bottom-0 top-auto"
                            )}
                          >
                            {m2.children.map((m3, i3) => (
                              <li
                                key={m3.title}
                                className="relative"
                                onMouseEnter={(e) => {
                                  setL3(i3);
                                  setDir3(getSmartDirection(e.currentTarget, dir2));
                                }}
                              >
                                <div className="flex justify-between px-4 py-2 hover:bg-sky-50">
                                  <button
                                    className="font-medium text-left"
                                    onClick={() => filter(m3.path)}
                                  >
                                    {m3.title}
                                  </button>

                                  {m3.children && (
                                    <ChevronRight className="h-4 w-4 text-[#347eb3]" />
                                  )}
                                </div>

                                {/* LEVEL 4 */}
                                {m3.children && l3 === i3 && (
                                  <ul
                                    className={clsx(
                                      "absolute top-0 w-72 bg-white shadow-xl",
                                      dir3.x === "right"
                                        ? "left-full"
                                        : "right-full",
                                      dir3.y === "up" && "bottom-0 top-auto"
                                    )}
                                  >
                                    {m3.children.map((m4) => (
                                      <li key={m4.title}>
                                        <button
                                          className="w-full text-left px-4 py-2 hover:bg-sky-100"
                                          onClick={() => filter(m4.path)}
                                        >
                                          {m4.title}
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      {mobileOpen && (
        <div className="md:hidden bg-[#F0F7FF] text-black">
          <MobileAccordion items={menuData} onSelect={filter} level={0} />
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   Mobile Accordion
------------------------------------------------------- */

function MobileAccordion({ items, onSelect, level }) {
  const [open, setOpen] = useState(null);

  return (
    <ul>
      {items.map((item, i) => (
        <li key={item.title} className="border-b border-blue-200">
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ paddingLeft: 16 + level * 16 }}
          >
            <button
              className={clsx(
                "text-left",
                level === 0 && "font-bold text-sm text-blue-700",
                level === 1 && "font-semibold text-xs text-blue-600",
                level >= 2 && "text-xs text-blue-500"
              )}
              onClick={() => onSelect(item.path)}
            >
              {item.title}
            </button>

            {item.children && (
              <button onClick={() => setOpen(open === i ? null : i)}>
                <ChevronDown
                  className={clsx(
                    "h-4 w-4 text-blue-600 transition-transform",
                    open === i && "rotate-180"
                  )}
                />
              </button>
            )}
          </div>

          {item.children && open === i && (
            <MobileAccordion
              items={item.children}
              onSelect={onSelect}
              level={level + 1}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
