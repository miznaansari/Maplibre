"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import {
  UserIcon,
  ChevronDownIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

export default function AccountMenu() {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState(null);
  const ref = useRef(null);

  /* READ USER NAME FROM LOCALSTORAGE */
  useEffect(() => {
    const name =
      localStorage.getItem("user_name") ||
      localStorage.getItem("userName");

    if (name) setUserName(name);
  }, []);

  /* CLOSE ON OUTSIDE CLICK */
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeMenu = () => setOpen(false);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* BUTTON */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 select-none hover:text-[#3170B7] transition-colors"
      >
        <UserIcon className="h-5 w-5" />
        <span className="font-medium">
          {userName || "My Account"}
        </span>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN */}
      <div
        className={`
          absolute right-0 top-full mt-0 w-60 rounded-xl
          bg-[#111827] text-white
          border border-white/10
          shadow-2xl z-50 overflow-hidden
          transform transition-all duration-200 ease-out
          ${
            open
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }
        `}
      >
        {/* USER HEADER */}
        <div className="px-4 py-3 border-b border-white/10 bg-white/5">
          <p className="text-xs text-gray-400">Signed in as</p>
          <p className="font-medium truncate">
            {userName || "User"}
          </p>
        </div>

        <MenuItem
          href="/my-account"
          label="My Profile"
          icon={<UserIcon className="h-5 w-5" />}
          onClick={closeMenu}
        />

        <MenuItem
          href="/my-account/orders"
          label="Orders"
          icon={<ClipboardDocumentListIcon className="h-5 w-5" />}
          onClick={closeMenu}
        />

        <MenuItem
          href="/my-account/addresses"
          label="Address"
          icon={<MapPinIcon className="h-5 w-5" />}
          onClick={closeMenu}
        />

        <div className="border-t border-white/10">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------
   MENU ITEM
------------------------------------------ */
function MenuItem({ href, label, icon, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="
        flex items-center gap-3 px-4 py-3
        hover:bg-white/5
        transition-colors duration-150
      "
    >
      <span className="text-gray-400">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
