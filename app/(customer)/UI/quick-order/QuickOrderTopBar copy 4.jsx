"use client";

import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { ChevronDown, ChevronRight } from "../../customer/components/Navbar/Icons";
import { useToast } from "@/app/admin/context/ToastProvider";

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

function getSmartDirection(el) {
  if (!el) return { x: "right", y: "down" };

  const r = el.getBoundingClientRect();
  const WIDTH = 280;
  const HEIGHT = 300;

  const spaceRight = window.innerWidth - r.right;
  const spaceLeft = r.left;
  const spaceBottom = window.innerHeight - r.bottom;

  return {
    x: spaceRight >= WIDTH ? "right" : spaceLeft >= WIDTH ? "left" : "right",
    y: spaceBottom >= HEIGHT ? "down" : "up",
  };
}

/* -------------------------------------------------------
   Component
------------------------------------------------------- */

export default function QuickOrderTopBar({ menuData = [], onCategorySelect }) {
  const ref = useRef(null);
  const {showToast} = useToast();

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

const select = (path) => {
  onCategorySelect?.(path ?? null);

  showToast({
    type: "success",
    message: path
      ? "Category applied successfully"
      : "All products loaded",
  });

  setMobileOpen(false);
  setL1(null);
  setL2(null);
  setL3(null);
};


  return (
    <div ref={ref} className="relative z-50 w-full">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-center">
          {/* <span className="md:hidden font-semibold">Quick Order</span> */}

    

          {/* ================= DESKTOP ================= */}
          <ul className="hidden md:flex gap-8 text-sm font-semibold">
            <li
              className="cursor-pointer  hover:text-[#00AEEF]"
              onClick={() => select(null)}
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
                onMouseLeave={() => {
                  setL1(null);
                  setL2(null);
                  setL3(null);
                }}
              >
                <div className="flex items-center gap-1">
                  <button
                    className="hover:text-[#00AEEF] cursor-pointer"
                    onClick={() => select(m1.path)}
                  >
                    {m1.title}
                  </button>
                  {m1.children && (
                    <ChevronDown className="h-4 w-4 opacity-80" />
                  )}
                </div>

                {/* ---------- LEVEL 2 ---------- */}
                {m1.children && l1 === i1 && (
                  <ul className="absolute left-0 cursor-pointer top-full mt-0 w-72 bg-white text-black shadow-xl">
                    {m1.children.map((m2, i2) => (
                      <li
                        key={m2.title}
                        className="relative cursor-pointer"
                        onMouseEnter={(e) => {
                          setL2(i2);
                          setDir2(getSmartDirection(e.currentTarget));
                        }}
                      >
                        <div className="flex items-center px-4 py-3 hover:bg-sky-50 cursor-pointer">
                          <button
                            className="flex-1 text-left font-semibold cursor-pointer"
                            onClick={() => select(m2.path)}
                          >
                            {m2.title}  
                          </button>

                          {m2.children && (
                            <ChevronRight
                              className={clsx(
                                "h-4 w-4 transition-transform",
                                dir2.x === "left" && "rotate-180"
                              )}
                            />
                          )}
                        </div>

                        {/* ---------- LEVEL 3 ---------- */}
                        {m2.children && l2 === i2 && (
                          <ul
                            className={clsx(
                              "absolute w-72 bg-white shadow-xl cursor-pointer",
                              dir2.x === "right"
                                ? "left-full"
                                : "right-full",
                              dir2.y === "down" ? "top-0" : "bottom-0"
                            )}
                          >
                            {m2.children.map((m3, i3) => (
                              <li
                                key={m3.title}
                                className="relative cursor-pointer"
                                onMouseEnter={(e) => {
                                  setL3(i3);
                                  setDir3(getSmartDirection(e.currentTarget));
                                }}
                              >
                                <div className="flex items-center px-4 py-2 hover:bg-sky-50">
                                  <button
                                    className="flex-1 text-left cursor-pointer"
                                    onClick={() => select(m3.path)}
                                  >
                                    {m3.title}
                                  </button>

                                  {m3.children && (
                                    <ChevronRight
                                      className={clsx(
                                        "h-4 w-4 transition-transform",
                                        dir3.x === "left" && "rotate-180"
                                      )}
                                    />
                                  )}
                                </div>

                                {/* ---------- LEVEL 4 ---------- */}
                                {m3.children && l3 === i3 && (
                                  <ul
                                    className={clsx(
                                      "absolute w-72 bg-white shadow-xl cursor-pointer",
                                      dir3.x === "right"
                                        ? "left-full"
                                        : "right-full",
                                      dir3.y === "down"
                                        ? "top-0"
                                        : "bottom-0"
                                    )}
                                    style={{zIndex:9999999999999999}}
                                  >
                                    {m3.children.map((m4) => (
                                      <li key={m4.title}>
                                        <button
                                          className="w-full px-4 py-2 text-left cursor-pointer hover:bg-sky-100"
                                          onClick={() => select(m4.path)}
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
        <div className="md:hidden bg-[#3170B7F] text-black">
          <MobileDrillMenu items={menuData} onSelect={select} />
        </div>
    </div>
  );
}

/* -------------------------------------------------------
   Mobile Drill-Down Menu
------------------------------------------------------- */
function MobileDrillMenu({ items, onSelect }) {
  const ROOT = {
    title: "All",
    items,
    hidden: false,
    isRoot: true,
  };

  const [stack, setStack] = useState([ROOT]);

  const current = stack[stack.length - 1];
  const visibleStack = stack; // root is visible now

  /* ================= Helpers ================= */

  const resetToRoot = () => {
    setStack([ROOT]);
  };

  const openTopLevel = (item) => {
    setStack([
      ROOT,
      {
        title: item.title,
        items: item.children,
      },
    ]);
  };

  const openChild = (item) => {
    setStack([
      ...stack,
      {
        title: item.title,
        items: item.children,
      },
    ]);
  };

  const goToBreadcrumb = (index) => {
    setStack(stack.slice(0, index + 1));
  };

  /* ================= Render ================= */

  return (
    <div className="bg-[#3170B7] text-white hidden " style={{zIndex:-1}}>
      {/* ===== Breadcrumb ===== */}
     <div className="flex items-center gap-2 px-4 py-3 border-b border-white/20 text-xs font-semibold overflow-hidden">
  {visibleStack.map((lvl, i) => (
    <span key={i} className="flex items-center gap-2 min-w-0">
      {i > 0 && <span className="opacity-60 shrink-0">›</span>}

     <button
  className="hover:underline truncate max-w-[90px] sm:max-w-[140px] md:max-w-none"
  onClick={() => {
    goToBreadcrumb(i);

    if (lvl.isRoot) {
      onSelect(null); // reset filter
    }
  }}
  title={lvl.title}
>
  {lvl.title}
</button>

    </span>
  ))}
</div>


      {/* ===== Menu ===== */}
      <ul>
        {current.items.map((item) => {
          const isRootLevel = stack.length === 1;

          return (
            <li key={item.title} className="border-b border-white/20">
              <div className="flex items-center justify-between px-4 py-3">
                {/* TEXT → APPLY FILTER */}
                <button
                  className="flex-1 text-left text-sm font-medium hover:text-yellow-300"
                  onClick={() => onSelect(item.path)}
                >
                  {item.title}
                </button>

                {/* ICON → CHILD */}
                {item.children && (
                  <button
                    onClick={() => {
                      if (isRootLevel) {
                        openTopLevel(item);
                      } else {
                        openChild(item);
                      }
                    }}
                  >
                    <ChevronRight className="h-4 w-4 text-white/80" />
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
