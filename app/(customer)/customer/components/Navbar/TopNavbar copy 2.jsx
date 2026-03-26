"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AccountMenu from "./AccountMenu";

export default function TopNavbar({ isLoggedIn }) {
  const pathname = usePathname();

  // hide on quick-order
  const isQuickOrder = pathname.startsWith("/shop");
  if (isQuickOrder) return null;

  return (
    <header
      className="w-full 
                 bg-gradient-to-r 
                 from-[#0f0f0f] 
                 via-[#1a1a1a] 
                 to-[#111827]
                 border-b border-white/10
                 backdrop-blur-md"
    >
      <div className="mx-auto flex h-12 max-w-7xl 
                      items-center justify-end 
                      px-6 text-sm text-gray-300">

        <nav className="flex items-center gap-6 z-90 ">

          {/* ABOUT */}
          <Link
            href="/about-us"
            className="hidden z-90 md:block 
                       hover:text-sky-400 
                       transition-colors"
          >
            About Us
          </Link>

          <Divider />

          {/* CONTACT */}
          <Link
            href="/contact-us"
            className="hidden md:block 
                       hover:text-sky-400 
                       transition-colors"
          >
            Contact Us
          </Link>

          <Divider />

          {/* AUTH */}
          {!isLoggedIn ? (
            <Link href="/auth/login" className="hover:underline">
              Login / Register
            </Link>
          ) : (
            <AccountMenu />
          )}
        </nav>
      </div>
    </header>
  );
}

/* -----------------------------------------
   DIVIDER
------------------------------------------ */
function Divider({ className = "" }) {
  return (
    <span
      className={`h-4 w-px 
                  bg-white/10 
                  hidden md:block ${className}`}
    />
  );
}
