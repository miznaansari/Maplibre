"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/outline";
import AccountMenu from "./AccountMenu";
import LogoutButton from "./LogoutButton";

export default function ProfileDropdown({isLoggedIn}) {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState(null);

  /* READ USER NAME FROM LOCALSTORAGE */
  useEffect(() => {
    const name =
      localStorage.getItem("user_name") ||
      localStorage.getItem("userName");

    if (name) setUserName(name);
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}   // desktop hover
      onMouseLeave={() => setOpen(false)} // desktop leave
    >

      {/* PROFILE BUTTON */}
      <div
        onClick={() => setOpen(!open)} // mobile click
        className="flex items-center gap-2 text-[rgb(var(--text))] hover:text-[#38bdf8] transition cursor-pointer"
      >
        <UserIcon className="w-6 h-6" />

        <span className="text-[14px] hidden md:block font-semibold">
          Profile 
        </span>
      </div>

      {/* DROPDOWN */}
      <div
        className={`
        absolute right-0 mt-3 w-64
          rounded-2xl
          backdrop-blur-xl
          border border-white/10
          bg-[rgb(var(--bg))]/95
          shadow-[0_0_30px_rgba(14,165,233,0.15)]
          transition-all duration-300
          ${open ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"}
        `}
      >
        {/* TOP SECTION */}
        <div className="p-4 border-b border-white/10">
          <p className="text-sm font-medium text-[rgb(var(--text))]">
            {userName ? `Hello ${userName}` : "Hello User"}
          </p>
          <p className="text-xs text-gray-400">
            To access your samad-agency account
          </p>
          {!isLoggedIn && (
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
            <button className="
            mt-3 w-full py-2 rounded-lg
            bg-gradient-to-r from-[#347eb3] to-[#38bdf8]
            text-black font-semibold
            hover:shadow-[0_0_15px_rgba(56,189,248,0.6)]
            transition cursor-pointer
          ">
              Sign Up / Log In
            </button>
          </Link>
          )}

        </div>

        {/* MENU ITEMS */}
        {isLoggedIn && (
            <Link
        onClick={()=>setOpen(false)}
          href="/my-account/orders"
          className="
            block px-4 py-3 text-sm text-black
            hover:bg-white/5 hover:text-[#38bdf8]
            transition
          "
        >
          My Orders
        </Link>
        )}
      

         {!isLoggedIn ? (
            <>
            </>
          ) : (
             <div className="border-t border-white/10">
                    <LogoutButton />
                  </div>
          )}
      </div>
    </div>
  );
}