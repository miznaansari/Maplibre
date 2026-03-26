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
    <header className="w-full 
                 bg-gradient-to-r 
                 from-[#0f0f0f] 
                 via-[#1a1a1a] 
                 to-[#111827]
                 border-b border-white/10
">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-end px-6 text-sm text-white">
        <nav className="flex items-center gap-6">
    


          <Link href="/about-us" className="hover:underline hidden md:block">
            About Us
          </Link>

          <Divider className="hidden md:block" />

          <Link href="/contact-us" className="hover:underline hidden md:block">
            Contact Us
          </Link>

          <Divider />

          {/* AUTH SECTION */}
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
   HELPERS
------------------------------------------ */
function Divider({ className = "" }) {
  return (
    <span className={`h-4 w-px bg-white/40 hidden md:block ${className}`} />
  );
}
