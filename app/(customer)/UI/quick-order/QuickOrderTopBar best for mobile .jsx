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

function getSmartDirection(el, parentDir) {
  if (!el) return parentDir || { x: "right", y: "down" };
  if (parentDir) return parentDir;

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

  const isTouch =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  const [l1, setL1] = useState(null);
  const [l2, setL2] = useState(null);

  const [dir2, setDir2] = useState({});
  const [dir3, setDir3] = useState({});

  useClickOutside(ref, () => {
    setL1(null);
    setL2(null);
  });

  const filter = (path) => path && onCategorySelect(path);

  return (
    <div ref={ref} className="w-full bg-[#0072BC] text-white">
      <div className="mx-auto max-w-7xl px-4">
        <ul className="hidden md:flex h-12 items-center gap-8 text-sm font-semibold">
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
              onMouseEnter={!isTouch ? () => setL1(i1) : undefined}
              onClick={isTouch ? () => setL1(l1 === i1 ? null : i1) : undefined}
            >
              <div className="flex items-center gap-1 cursor-pointer">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    filter(m1.path);
                  }}
                  className="hover:text-yellow-300"
                >
                  {m1.title}
                </span>
                {m1.children && (
                  <ChevronDown
                    className={clsx(
                      "h-4 w-4 transition-transform",
                      l1 === i1 && "rotate-180"
                    )}
                  />
                )}
              </div>

              {/* LEVEL 2 */}
              {m1.children && l1 === i1 && (
                <ul className="absolute left-0 top-full mt-2 w-72 bg-white text-black shadow-xl">
                  {m1.children.map((m2, i2) => {
                    const d2 = dir2[i2];

                    return (
                      <li
                        key={m2.title}
                        onMouseEnter={
                          !isTouch
                            ? (e) => {
                                setL2(i2);
                                if (!d2) {
                                  setDir2((p) => ({
                                    ...p,
                                    [i2]: getSmartDirection(e.currentTarget),
                                  }));
                                }
                              }
                            : undefined
                        }
                        onClick={
                          isTouch
                            ? (e) => {
                                e.stopPropagation();
                                setL2(l2 === i2 ? null : i2);
                                if (!d2) {
                                  setDir2((p) => ({
                                    ...p,
                                    [i2]: getSmartDirection(e.currentTarget),
                                  }));
                                }
                              }
                            : undefined
                        }
                      >
                        <div className="flex items-center px-4 py-3 hover:bg-sky-50 cursor-pointer">
                          {m2.children && d2?.x === "left" && (
                            <ChevronRight className="mr-2 h-4 w-4 rotate-180 text-sky-600" />
                          )}

                          <span
                            className="flex-1 font-semibold"
                            onClick={(e) => {
                              e.stopPropagation();
                              filter(m2.path);
                            }}
                          >
                            {m2.title}
                          </span>

                          {m2.children && d2?.x === "right" && (
                            <ChevronRight className="ml-2 h-4 w-4 text-sky-600" />
                          )}
                        </div>

                        {/* LEVEL 3 */}
                        {m2.children && l2 === i2 && (
                          <ul
                            className={clsx(
                              "absolute top-0 w-72 bg-white shadow-xl",
                              d2?.x === "right" ? "left-full" : "right-full",
                              d2?.y === "up" && "bottom-0 top-auto"
                            )}
                          >
                            {m2.children.map((m3) => (
                              <li key={m3.title}>
                                <div
                                  className="px-4 py-2 hover:bg-sky-50 cursor-pointer"
                                  onClick={() => filter(m3.path)}
                                >
                                  {m3.title}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
