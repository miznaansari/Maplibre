"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { useCart } from "../../context/CartContext";

export default function AboutNavbar() {
  const { cartItems, setOpen } = useCart();

  return (
    <nav className="sticky top-0 z-20 w-full bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">

        {/* LOGO */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.png"
            alt="Shield King"
            width={140}
            height={60}
            priority
          />
        </Link>

        {/* CENTER MENU */}
        <ul className="flex gap-8 font-medium">
          <li>
            <Link
              href="/about-us"
              className="text-gray-900 hover:text-sky-600 transition"
            >
              About Us
            </Link>
          </li>

          <li>
            <Link
              href="/contact-us"
              className="text-gray-900 hover:text-sky-600 transition"
            >
              Contact Us
            </Link>
          </li>
        </ul>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-6">

          {/* WISHLIST */}
          <Link
            href="/my-account/wishlist"
            className="flex items-center gap-2 text-gray-900 hover:text-gray-700"
          >
            <HeartIcon className="w-6 h-6" />
            <span className="text-sm font-semibold hidden sm:block">
              Wishlist
            </span>
          </Link>

          {/* CART */}
          <button
            onClick={() => setOpen(true)}
            className="relative flex items-center gap-2 text-gray-900 hover:text-gray-700"
            aria-label="Open cart"
          >
            <div className="relative">
              <Image
                src="/images/page/Navbar/bag.svg"
                alt="Cart"
                width={26}
                height={26}
              />

              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-semibold text-white">
                  {cartItems.length}
                </span>
              )}
            </div>

            <span className="text-sm font-semibold hidden sm:block">
              Cart
            </span>
          </button>

        </div>
      </div>
    </nav>
  );
}
