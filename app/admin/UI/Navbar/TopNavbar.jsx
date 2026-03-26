"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function TopNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  useEffect(() => {
    // ✅ Read cookie (client-side)
    const hasAuthCookie = document.cookie
      .split("; ")
      .some((row) => row.startsWith("authToken="));

    setIsLoggedIn(hasAuthCookie);
  }, []);

const handleLogout = () => {
  // Clear cookie
  document.cookie = "authToken=; path=/; max-age=0";

  // Navigate (optional)
  router.replace("/my-account");

  // 🔥 FORCE SERVER RE-RENDER
  router.refresh();
};


  return (
    <header className="w-full bg-[#0072BC]">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-end px-6 text-sm text-white">
        <nav className="flex items-center gap-6">

          <Link href="/shop" className="hover:underline">
            Quick Order
          </Link>

          <span className="h-4 w-px bg-white/40" />

          <Link href="/about-us" className="hover:underline">
            About Us
          </Link>

          <span className="h-4 w-px bg-white/40" />

          <Link href="/orders" className="hover:underline">
            Orders
          </Link>

          <span className="h-4 w-px bg-white/40" />

          <Link href="/contact-us" className="hover:underline">
            Contact Us
          </Link>

          <span className="h-4 w-px bg-white/40" />

          {/* AUTH SECTION */}
          {!isLoggedIn ? (
            <Link href="/my-account" className="hover:underline">
              Login / Register
            </Link>
          ) : (
            <div className="relative group">

              {/* BUTTON */}
              <button className="flex items-center gap-1 hover:underline">
                My Account
                <span className="text-xs">▾</span>
              </button>

              {/* DROPDOWN */}
              <div
                className="
                  absolute right-0 top-full mt-2 w-48
                  bg-white text-black
                  border border-gray-200
                  shadow-lg
                  opacity-0 invisible
                  group-hover:opacity-100 group-hover:visible
                  transition-all duration-200
                  z-60
                "
              >
                {[
                  { label: "Account details", href: "/my-account" },
                  { label: "Orders", href: "/my-account/orders" },
                  { label: "Downloads", href: "/my-account/downloads" },
                  { label: "Addresses", href: "/my-account/addresses" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="
                      block px-4 py-2
                      hover:bg-[#347eb3] hover:text-white
                      transition-colors
                    "
                  >
                    {item.label}
                  </Link>
                ))}

                <button
                  onClick={handleLogout}
                  className="
                    w-full text-left px-4 py-2
                    hover:bg-[#347eb3] hover:text-white
                    transition-colors
                  "
                >
                  Log out
                </button>
              </div>

            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
