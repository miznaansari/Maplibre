"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, CartIcon } from "./Icons";
import { menuData } from "./menuData";

export default function Navbar() {
  const router = useRouter();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [open, setOpen] = useState({});

  /* ================= BODY SCROLL LOCK ================= */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [drawerOpen]);

  const toggle = (key) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navigate = (path) => {
    if (path) {
      router.push(path);
      setDrawerOpen(false);
      setOpen({});
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      {/* ================= TOP BAR ================= */}
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        {/* LOGO */}
        <div className="cursor-pointer" onClick={() => router.push("/")}>
          <Image src="/images/logo4.png" alt="Samad Agency" width={140} height={60} />
        </div>


        {/* ================= DESKTOP MENU ================= */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
          {menuData.map((menu) => (
            <li key={menu.title} className="group relative cursor-pointer">

              {/* LEVEL 1 */}
              <div
                className="flex items-center gap-1 hover:text-blue-600"
                onClick={() => handleNavigate(menu.path)}
              >
                {menu.title}
                {menu.children && <ChevronDown />}
              </div>

              {/* LEVEL 2 */}
              {menu.children && (
                <ul
                  className="invisible absolute left-0 top-full mt-3 w-60 bg-white text-black shadow-lg opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100"
                >
                  {menu.children.map((level2) => (
                    <li
                      key={level2.title}
                      className="group/level2 relative flex items-center justify-between  px-4 py-2 cursor-pointer hover:bg-[#347eb3] hover:text-white"
                      onClick={() => handleNavigate(level2.path)}
                    >
                      {level2.title}
                      {level2.children && <ChevronRight />}

                      {/* LEVEL 3 */}
                      {level2.children && (
                        <ul
                          className="invisible absolute left-full top-0 w-64 bg-white text-black shadow-lg opacity-0 transition-all duration-200  group-hover/level2:visible group-hover/level2:opacity-100"
                        >
                          {level2.children.map((level3) => (
                            <li
                              key={level3.title}
                              className="group/level3 relative flex items-center justify-between  px-4 py-2 cursor-pointer hover:bg-[#347eb3] hover:text-white"
                              onClick={() => handleNavigate(level3.path)}
                            >
                              {level3.title}
                              {level3.children && <ChevronRight />}

                              {/* LEVEL 4 */}
                              {level3.children && (
                                <ul
                                  className="invisible absolute left-full top-0 w-72 bg-white text-black shadow-lg opacity-0 transition-all duration-200  group-hover/level3:visible group-hover/level3:opacity-100"
                                >
                                  {level3.children.map((level4) => (
                                    <li
                                      key={level4.title}
                                      className="px-4 py-2 cursor-pointer hover:bg-[#347eb3] hover:text-white"
                                      onClick={() =>
                                        handleNavigate(level4.path)
                                      }
                                    >
                                      {level4.title}
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

        {/* ================= RIGHT ICONS ================= */}
        <div className="flex items-center gap-4">
          {/* DESKTOP SEARCH */}
          <input
            className="hidden md:block w-56 border px-3 py-2 text-sm"
            placeholder="Search for Products"
          />

          {/* CART */}
          <div
            className="relative bg-blue-600 p-2 rounded text-white cursor-pointer"
            onClick={() => router.push("/cart")}
          >
            <CartIcon />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-[10px] flex items-center justify-center">
              2
            </span>
          </div>

          {/* MOBILE SEARCH */}
          <button
            className="md:hidden text-xl"
            onClick={() => router.push("/search")}
            aria-label="Search"
          >
            🔍
          </button>

          {/* HAMBURGER */}
          <button
            className="md:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open Menu"
          >
            <span className="block w-6 h-[2px] bg-black mb-1" />
            <span className="block w-6 h-[2px] bg-black mb-1" />
            <span className="block w-6 h-[2px] bg-black" />
          </button>
        </div>
      </div>

      {/* ================= MOBILE DRAWER ================= */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300
        ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        {/* BACKDROP */}
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300
          ${drawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setDrawerOpen(false)}
        />

        {/* DRAWER PANEL */}
        <div
          className={`absolute left-0 top-0 h-full w-[100%] 
          bg-gradient-to-b from-[#061a2d] to-[#04111e]
          text-white
          transform transition-transform duration-300 ease-in-out
          ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <Image src="/images/logo4.png" alt="Samad Agency" width={120} height={50} />
            <button
              className="text-2xl"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close Menu"
            >
              ✕
            </button>
          </div>

          {/* MENU CONTENT */}
          <div className="overflow-y-auto h-full pb-24">
            {menuData.map((l1) => (
              <div key={l1.title} className="border-b border-white/10">
                {/* LEVEL 1 */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer text-[15px] font-medium"
                  onClick={() => (l1.children ? toggle(l1.title) : navigate(l1.path))}
                >
                  <span className="text-sky-400">{l1.title}</span>
                  {l1.children && (
                    <ChevronDown
                      className={`transition-transform duration-300 ${
                        open[l1.title] ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>

                {/* LEVEL 2 */}
                <div
                  className={`pl-5 overflow-hidden transition-all duration-300 ease-in-out
                  ${open[l1.title] ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
                >
                  {l1.children?.map((l2) => (
                    <div key={l2.title}>
                      <div
                        className="flex items-center justify-between py-3 pr-4 cursor-pointer text-sm"
                        onClick={() =>
                          l2.children
                            ? toggle(l1.title + l2.title)
                            : navigate(l2.path)
                        }
                      >
                        {l2.title}
                        {l2.children && (
                          <ChevronDown
                            className={`transition-transform duration-300 ${
                              open[l1.title + l2.title] ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </div>

                      {/* LEVEL 3 */}
                      <div
                        className={`pl-4 overflow-hidden transition-all duration-300 ease-in-out
                        ${
                          open[l1.title + l2.title]
                            ? "max-h-[800px] opacity-100"
                            : "max-h-0 opacity-0"
                        }`}
                      >
                        {l2.children?.map((l3) => (
                          <div key={l3.title}>
                            <div
                              className="flex items-center justify-between py-2 cursor-pointer text-[13px] text-gray-300"
                              onClick={() =>
                                l3.children
                                  ? toggle(l1.title + l2.title + l3.title)
                                  : navigate(l3.path)
                              }
                            >
                              {l3.title}
                              {l3.children && (
                                <ChevronDown
                                  className={`transition-transform duration-300 ${
                                    open[l1.title + l2.title + l3.title]
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                />
                              )}
                            </div>

                            {/* LEVEL 4 */}
                            <div
                              className={`pl-4 overflow-hidden transition-all duration-300 ease-in-out
                              ${
                                open[l1.title + l2.title + l3.title]
                                  ? "max-h-[600px] opacity-100"
                                  : "max-h-0 opacity-0"
                              }`}
                            >
                              {l3.children?.map((l4) => (
                                <div
                                  key={l4.title}
                                  className="py-2 text-[12px] text-gray-400 cursor-pointer"
                                  onClick={() => navigate(l4.path)}
                                >
                                  {l4.title}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
