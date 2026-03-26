"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, CartIcon } from "./Icons";
// import { menuData } from "./menuData";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { clientFetch } from "@/lib/clientFetch";
import { useRef } from "react";
import { HeartIcon, ShoppingBagIcon, UserIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import ProfileDropdown from "./ProfileDropdown";

export default function Navbar({ menuData = [], isLoggedIn }) {

  const pathname = usePathname();


  const { setOpen, cartItems } = useCart();
  const router = useRouter();
  const [openNewMenu, setOpenNewMenu] = useState(null);

  const [openLeft, setOpenLeft] = useState(false);
  const level3Ref = useRef(null);


  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openMenu, setMenuOpen] = useState({});

  /* ================= BODY SCROLL LOCK ================= */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [drawerOpen]);

  const toggle = (key) => {
    setMenuOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navigate = (path) => {
    if (path) {
      router.push(path);
      setDrawerOpen(false);
      // setOpen({});
    }
  };


  // DESKTOP ACCORDION (LEVEL 3 → LEVEL 4)
  const [openL3, setOpenL3] = useState(null);

  const toggleL3 = (key) => {
    setOpenL3((prev) => (prev === key ? null : key));
  };

  // Alias to keep naming consistent
  const handleNavigate = navigate;
  const [topPosition, setTopPosition] = useState(30);
  useEffect(() => {
    console.log('topPositioasdn', topPosition)
  }, [topPosition])

  useEffect(() => {


    function handleScroll() {
      if (window.scrollY > 50) {
        console.log('object')
        setTopPosition(45);
      } else {
        setTopPosition(85);
      }
    }

    // Initial set
    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);



  return (
    <nav
      aria-label="Primary Navigation"
      className="sticky top-0 z-10 w-full
            bg-[rgb(var(--bg))]
             h-full
             border-b border-black/10
             
             z-20"
    >

      {/* ================= TOP BAR ================= */}
      <div className="mx-auto max-w-7xl  px-4 py-4 lg:py-4 xl:py-6 flex items-center justify-between">
        {/* LOGO */}
        <button
          className="lg:hidden"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open Menu"
        >
          <span className="block w-6 h-[2px]     bg-[rgb(var(--text))] mb-1" />
          <span className="block w-6 h-[2px] bg-[rgb(var(--text))] mb-1" />
          <span className="block w-6 h-[2px] bg-[rgb(var(--text))]" />
        </button>
        <Link href={'/'} className="cursor-pointer" >
          <img
            src="/images/logo/samadLogoremove.png"
            alt="Samad Agency"
            width="120"
            height="50"
          />
        </Link>


        {/* ================= DESKTOP MENU ================= */}
        {/* ================= DESKTOP MENU ================= */}
        <ul className="hidden lg:flex gap-8 px-6  font-medium">
          {Array.isArray(menuData) &&
            menuData.map((menu, index) => {

              const columnCount = Array.isArray(menu.children) ? menu.children.length : 0;
              // console.log('columnCount', columnCount, menu.children)

              const widthClass =
                columnCount >= 4
                  ? "!max-w-6xl bg-black"
                  : columnCount === 5
                    ? "!max-w-5xl bg-black"
                    : columnCount === 2
                      ? "!max-w-[1000px] "
                      : "!max-w-[1000px]";

              const gridColsClass =
                columnCount === 8
                  ? "col-span-4 columns-4 overflow-hidden gap-0 striped-cols [column-fill:auto] max-h-[400px]"
                  : columnCount === 6
                    ? "col-span-4 columns-4 gap-0 overflow-hidden striped-cols [column-fill:auto] max-h-[400px]"
                    : columnCount === 4
                      ? "col-span-4 columns-4 gap-0 striped-cols [column-fill:auto] max-h-[380px]"
                      : columnCount === 2
                        ? "col-span-1 columns-1 gap-0 [column-fill:auto] max-h-[300px]"
                        : "col-span-1 columns-1 gap-0 overflow-hidden [column-fill:auto] max-h-[320px]";

              return (
                <li
                  key={menu.title}
                  className="relative"
                  onMouseEnter={() => setOpenNewMenu(menu.title)}
                  onMouseLeave={() => setOpenNewMenu(null)}
                >
                  <div className={`
    flex items-center gap-1
    cursor-pointer
    
    transition-colors
    ${openNewMenu === menu.title
                      ? "text-[rgb(var(--text))]"
                      : "text-[rgb(var(--text))] hover:text-[rgb(var(--text))]"
                    }
  `}>
                    <Link href={menu.path} className="flex items-center gap-1">
                      {menu.title}
                    </Link>
                    {menu.children && <ChevronDown size={16} />}
                  </div>


                  {/* MEGA MENU */}
                  <div
                    style={{ top: topPosition }}
                    className={`fixed left-1/2 -translate-x-1/2 z-50
                  transition-all duration-200
                  ${widthClass}
                  ${openNewMenu === menu.title
                        ? "visible opacity-100"
                        : "invisible opacity-0"
                      }
                      
                      `}

                  >
                    <div className="bg-[#0f0f0f]
border-t border-white/10
shadow-[0_20px_60px_rgba(0,0,0,0.8)]
backdrop-blur-xl

 rounded p-6 flex gap-6 !m-0 !p-0">

                      {/* LEFT CONTENT */}
                      {/* <div className={`col-span-4 grid ${gridColsClass}  overflow-hidden gap-0 p-0 !m-0 striped-cols `}> */}
                      <div className={`${gridColsClass}   `}>


                        {Array.isArray(menu.children) &&
                          menu.children.map((lvl2) => (

                            <div key={lvl2.title} className="p-6 !min-w-[200px] break-inside-avoid">
                              <h4 className="font-semibold mb-3 text-black ">
                                <Link href={lvl2.path} className="flex items-center gap-1">

                                  {lvl2.title}
                                </Link>
                              </h4>

                              <ul className="space-y-2">
                                {lvl2.children?.map((lvl3) => (
                                  <li
                                    key={lvl3.title}
                                    className="relative group text-sm text-gray-400 hover:text-sky-400 flex justify-between items-center cursor-pointer"
                                  >
                                    <Link href={lvl3.path} className="flex justify-between items-center w-full">
                                      {lvl3.title}
                                      {lvl3.children && <ChevronRight size={14} />}
                                    </Link>

                                    {/* LEVEL 4 */}
                                    {lvl3.children && (
                                      <ul

                                        className="absolute left-full top-0 w-70 bg-[#111827]
shadow-[0_10px_40px_rgba(0,0,0,0.9)]
border border-white/10 rounded p-2 space-y-2 max-h-[200px] overflow-y-auto z-[999] opacity-0 invisible group-hover:visible group-hover:opacity-100 transition"

                                      >
                                        {lvl3.children.map((lvl4) => (
                                          <li
                                            key={lvl4.title}
                                            className="px-2 py-1 !mb-0 text-sm rounded hover:bg-[#347eb3] hover:text-black z-90 bg-white"
                                          >
                                            <Link href={lvl4.path} className="block">
                                              {lvl4.title}
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                      </div>

                      {/* RIGHT IMAGE */}
                      <div
                        className="pr-6 flex flex-col gap-4 justify-center items-center"
                      >
                        {/* INNER CARD */}

                        {/* INNER CARD */}




                      </div>

                    </div>
                  </div>
                </li>
              );
            })}
        </ul>



        {/* ================= RIGHT ICONS ================= */}
        <div className="flex items-center gap-6 md:gap-6 ">
          {/* DESKTOP SEARCH */}
          <div className="relative hidden md:block">
            {/* Search Icon */}
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              className=" hidden lg:block pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg> */}

            {/* Input */}
            {/* <input
              type="text"
              placeholder="Search for Products"
              className="
      w-64
      rounded-full
      border border-gray-300
      bg-white
      hidden lg:block
      py-2 pl-10 pr-4
      text-sm text-gray-700
      placeholder-gray-400
      outline-none
      focus:border-gray-400
      focus:ring-0
    "
            /> */}
          </div>

          <ProfileDropdown isLoggedIn={isLoggedIn} />

          <Divider />

          <button

            onClick={(() => {
              setOpen(true)
            })}
            aria-label="Open cart"
            className="
    relative
    flex items-center gap-2
    text-[rgb(var(--text))]
    hover:text-gray-700
    transition
    cursor-pointer
  "
          >

            {/* ICON WRAPPER */}
            <div className="relative flex items-center justify-center">
              <div className="relative mr-2">
                {/* <Image
                  src="/images/page/Navbar/bag.svg"
                  alt="Cart"
                  width={26}
                  height={26}
                /> */}
                <ShoppingBagIcon className="w-6 h-6" />
                {cartItems.length > 0 && (<span
                  className="
        absolute -top-1 -right-1
        flex h-4 w-4 items-center justify-center
        rounded-full
        bg-[rgb(var(--text))]
        text-[10px]
        font-semibold
        text-white
        
      "
                >
                  {cartItems.length}
                </span>)}
              </div>
              {/* BADGE */}


              {/* TEXT */}
              <span
                className="
    font-inter
    text-[14px]
    font-semibold
    leading-none
    align-middle
    hidden md:inline-block 
  "
              >
                Cart
              </span>

            </div>

          </button>




          {/* HAMBURGER */}

        </div>
      </div>

      {/* ================= MOBILE DRAWER ================= */}
      <div
        className={`fixed inset-0 z-90 lg:hidden transition-opacity duration-300
        ${drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        {/* BACKDROP */}
        <div
          className={`absolute inset-0 bg-white transition-opacity duration-300
          ${drawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setDrawerOpen(false)}
        />

        {/* DRAWER PANEL */}
        <div
          className={`absolute left-0 top-0 h-full w-[100%] 
          bg-gradient-to-b from-[#0f0f0f] via-[#111827] to-[#020617]
          text-black
          transform transition-transform duration-300 ease-in-out
          ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* HEADER */}
          <div className="flex items-center bg-white justify-between px-4 py-4 border-b border-white/10">
            <Image src="/images/logo/samadLogoremove.png" alt="Samad Agency" width={120} height={50} />
            <button
              className="text-2xl text-black"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close Menu"
            >
              ✕
            </button>
          </div>

          {/* MENU CONTENT */}
          <div className="overflow-y-auto bg-white h-full pb-24">
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">

              {/* HOME */}
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className="block px-4 py-3 rounded-xl
     hover:bg-white/10 text-black
     text-[15px] font-semibold
    transition-all"
              >
                Home
              </Link>

              {/* MENU */}
              {menuData.map((l1) => {
                const isOpen = openMenu[l1.title];

                return (
                  <div
                    key={l1.title}
                    className={`rounded-xl transition-all duration-300
        ${isOpen ? "bg-black/05 border text-black border-black" : ""}`}
                  >
                    {/* LEVEL 1 */}
                    <div
                      className="flex items-center justify-between px-4 py-3 cursor-pointer"
                      onClick={() => (l1.children ? toggle(l1.title) : navigate(l1.path))}
                    >
                      <span className="text-[15px] font-medium text-black">
                        {l1.title}
                      </span>

                      {l1.children && (
                        <ChevronDown
                          className={`w-4 h-4 text-black transition-transform duration-300
              ${isOpen ? "rotate-180 " : ""}`}
                        />
                      )}
                    </div>

                    {/* LEVEL 2 */}
                    <div
                      className={`overflow-hidden transition-all duration-300
          ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
                    >
                      <div className="pl-3 pb-3 space-y-2">
                        {l1.children?.map((l2) => {
                          const key2 = l1.title + l2.title;
                          const isOpen2 = openMenu[key2];

                          return (
                            <div key={l2.title}>
                              {/* LEVEL 2 ITEM */}
                              <div
                                className="flex items-center justify-between px-3 py-2 rounded-lg
                    text-sm text-black hover:bg-white/10 transition cursor-pointer"
                                onClick={() =>
                                  l2.children ? toggle(key2) : navigate(l2.path)
                                }
                              >
                                <span>{l2.title}</span>

                                {l2.children && (
                                  <ChevronDown
                                    className={`w-3.5 h-3.5 transition-transform
                        ${isOpen2 ? "rotate-180 text-sky-400" : ""}`}
                                  />
                                )}
                              </div>

                              {/* LEVEL 3 */}
                              <div
                                className={`overflow-hidden transition-all duration-300
                    ${isOpen2 ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}
                              >
                                <div className="pl-3 space-y-1">
                                  {l2.children?.map((l3) => (
                                    <Link
                                      key={l3.title}
                                      href={l3.path}
                                      onClick={() => setDrawerOpen(false)}
                                      className="block px-3 py-2 rounded-md text-[13px]
                          text-gray-400 hover:text-black hover:bg-white/10
                          transition"
                                    >
                                      {l3.title}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
function Divider() {
  return <span className="h-6 w-px mx-0 bg-black/40 hidden md:block" />;
}
