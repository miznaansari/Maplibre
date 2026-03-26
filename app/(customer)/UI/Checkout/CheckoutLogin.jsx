"use client";

import Link from "next/link";

export default function CheckoutLogin() {
 return (
  <div className="mb-4">
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111827] px-6 py-4 shadow-lg">
      {/* Left text */}
      <p className="text-sm font-medium text-gray-300">
        Login/Signup to complete the order process
      </p>

      {/* Right button */}
      <Link
        href="/auth/login?redirect=/checkout"
        className="
          rounded-md
          border border-[#347eb3]
          px-4 py-2
          text-sm font-medium
          text-[#38bdf8]
          transition
          hover:bg-[#347eb3]/10
        "
      >
        Login / Signup
      </Link>
    </div>
  </div>
);

}
