import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import QuickOrderTopBar from "./QuickOrderTopBar";
import { useEffect, useState } from "react";
import { ChevronDown } from "../../customer/components/Navbar/Icons";
import { useCart } from "@/app/context/CartContext";
import { useToast } from "@/app/admin/context/ToastProvider";

export default function QuickOrderNavbar({ setActiveCategory, menuData }) {
  const { setOpen, cartItems } = useCart();
  const { showToast } = useToast();

  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    console.log('drawerOpendrawerOpen', drawerOpen)
  }, [drawerOpen])
  const [openMenu, setMenuOpen] = useState({});
  const toggle = (key) => {
    setMenuOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-3  flex items-center justify-between  rounded-tl-lg rounded-tr-lg">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-36 md:w-40">
            <Image
              src="/images/logo.png"
              alt="Shield King"
              width={160}
              height={80}
              className="w-full h-auto"
            />
          </div>
        </Link>
        {/* LEFT : CATEGORY */}
        <div className="w-full ">

          <QuickOrderTopBar
            onCategorySelect={setActiveCategory}
            menuData={menuData}
          />
        </div>
        <div className="flex items-center gap-4">
          {/* DESKTOP SEARCH */}
          <div className="relative hidden md:block">

          </div>

          <Link href="/my-account/wishlist" className="relative flex items-center gap-2 text-gray-900 hover:text-gray-700 transition cursor-pointer"


          >

            {/* ICON WRAPPER */}
            <div className="relative flex items-center justify-center">
              <div className="relative mr-2">
                <HeartIcon className="w-6 h-6" />

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
  "
              >
                Wishlist
              </span>

            </div>

          </Link>
          <Divider />

          <button
            onClick={() => setOpen(true)} 
            aria-label="Open cart"
            className="
    relative
    flex items-center gap-2
    text-gray-900
    hover:text-gray-700
    transition
    cursor-pointer
  "
          >

            {/* ICON WRAPPER */}
            <div className=" flex items-center justify-center">
              <img
                src="/images/page/bag.svg"
                alt="Cart"
                className="w-6 h-6 block "
              />
              <div className=" mr-2">
                <div>
                </div>

                {cartItems.length > 0 && (<span
                  className="
        absolute -top-1 right-6
        flex h-4 w-4 items-center justify-center
        rounded-full
        bg-black
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
  "
              >
                Cart
              </span>

            </div>

          </button>




          {/* HAMBURGER */}
          <button
            className="lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open Menu"
          >
            <span className="block w-6 h-[2px] bg-black mb-1" />
            <span className="block w-6 h-[2px] bg-black mb-1" />
            <span className="block w-6 h-[2px] bg-black" />
          </button>
        </div>

      </div>

      {/* mobile */}
      <div
        className={`fixed inset-0 z-90 lg:hidden transition-opacity duration-300
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
            <Image src="/images/logo.png" alt="Shield King" width={120} height={50} />
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
            <div onClick={() => { setDrawerOpen(false); setActiveCategory(null); showToast({ type: 'success', message: `Selected category: All Product` }) }} className="px-5 py-4 cursor-pointer text-[15px] font-medium">All Product</div>
            {menuData.map((l1) => (
              <div key={l1.title} className="border-b border-white/10">
                {/* LEVEL 1 */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer text-[15px] font-medium"
                  onClick={() => (l1.children ? toggle(l1.title) : setActiveCategory(l1.path))}
                >
                  <div onClick={() => { setDrawerOpen(false); setActiveCategory(l1.path); showToast({ type: 'success', message: `Selected category: ${l1.title}` }) }} href={l1.path} className="flex items-center gap-1">

                    <span className="text-sky-400">{l1.title}</span></div>
                  {l1.children && (
                    <ChevronDown
                      className={`transition-transform duration-300 ${openMenu[l1.title] ? "rotate-180" : ""
                        }`}
                    />
                  )}
                </div>

                {/* LEVEL 2 */}
                <div
                  className={`pl-5 overflow-hidden transition-all duration-300 ease-in-out
                  ${openMenu[l1.title] ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}
                >
                  {l1.children?.map((l2) => (
                    <div key={l2.title}>
                      <div
                        className="flex items-center justify-between py-3  pr-4 cursor-pointer text-sm"
                        onClick={() =>
                          l2.children
                            ? toggle(l1.title + l2.title)
                            : setActiveCategory(l2.path)
                        }
                      >
                        <div onClick={() => { setDrawerOpen(false); setActiveCategory(l2.path); showToast({ type: 'success', message: `Selected category: ${l2.title}` }) }} href={l2.path} className="flex items-center gap-1">

                          {l2.title}
                        </div>
                        {l2.children && (
                          <ChevronDown
                            className={`transition-transform duration-300 ${openMenu[l1.title + l2.title] ? "rotate-180" : ""
                              }`}
                          />
                        )}
                      </div>

                      {/* LEVEL 3 */}
                      <div
                        className={`pl-4 overflow-hidden transition-all duration-300 ease-in-out
                        ${openMenu[l1.title + l2.title]
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
                                  : setActiveCategory(l3.path)
                              }
                            >
                              <div onClick={() => { setDrawerOpen(false); setActiveCategory(l3.path); showToast({ type: 'success', message: `Selected category: ${l3.title}` }) }} href={l3.path} className="flex items-center gap-1">

                                {l3.title}
                              </div>
                              {l3.children && (
                                <ChevronDown
                                  className={`transition-transform duration-300 ${openMenu[l1.title + l2.title + l3.title]
                                    ? "rotate-180"
                                    : ""
                                    }`}
                                />
                              )}
                            </div>

                            {/* LEVEL 4 */}
                            <div
                              className={`pl-4 overflow-hidden transition-all duration-300 ease-in-out
                              ${openMenu[l1.title + l2.title + l3.title]
                                  ? "max-h-[600px] opacity-100"
                                  : "max-h-0 opacity-0"
                                }`}
                            >
                              {l3.children?.map((l4) => (
                                <div
                                  key={l4.title}
                                  className="py-2 text-[12px] text-gray-400 cursor-pointer"
                                  onClick={() => { setActiveCategory(l4.path); setDrawerOpen(false); showToast({ type: 'success', message: `Selected category: ${l4.title}` }) }}
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
    </>
  );
}

function Divider() {
  return <span className="h-6 w-px mx-0 bg-black/40 hidden md:block" />;
}
