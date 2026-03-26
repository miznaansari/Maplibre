"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSidebar } from "../../context/SidebarContext";
import LogoutButton from "./LogoutButton";

import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export default function AdminNavbar() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState(null);

  const dropdownRef = useRef(null);
  const { toggle } = useSidebar();

  // ✅ Load profile from localStorage
useEffect(() => {
  const email = localStorage.getItem("userEmail");
  const name = localStorage.getItem("userName");

  if (email || name) {
    setProfile({
      email,
      name,
    });
  }
}, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ✅ Get First Letter Logic
  const getInitial = () => {
    if (!profile) return "?";

    const name = profile.name?.trim();
    const email = profile.email?.trim();

    if (name) return name.charAt(0).toUpperCase();
    if (email) return email.charAt(0).toUpperCase();

    return "?";
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <button className="rounded p-2 hover:bg-gray-100" onClick={toggle}>
            <span className="block h-0.5 w-5 bg-gray-600" />
            <span className="mt-1 block h-0.5 w-5 bg-gray-600" />
            <span className="mt-1 block h-0.5 w-5 bg-gray-600" />
          </button>

          {/* Search */}
          <div className="relative hidden md:block">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search or type command..."
              className="w-72 rounded bg-gray-50 py-2 pl-9 pr-14 text-sm outline-none shadow-inner focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          {/* PROFILE */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 rounded px-2 py-1 hover:bg-gray-100"
            >
              {/* Avatar */}
              {profile?.image ? (
                <Image
                  src={profile.image}
                  alt="Admin"
                  width={32}
                  height={32}
                  className="rounded-full shadow-sm"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
                  {getInitial()}
                </div>
              )}

              <span className="hidden text-sm font-medium md:block">
                {profile?.name || profile?.email || "Admin"}
              </span>

              <ChevronDownIcon className="h-4 w-4 text-gray-500" />
            </button>

            {/* DROPDOWN */}
            {open && (
              <div className="absolute right-0 mt-3 w-60 rounded bg-white shadow-lg">
                <div className="px-4 py-3 shadow-sm">
                  <p className="text-sm font-semibold">
                    {profile?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {profile?.email || "No email"}
                  </p>
                </div>

                <div className="py-2 text-sm">
                  <Link href="/admin/change-password">
                    <DropdownItem
                      icon={<Cog6ToothIcon className="h-5 w-5" />}
                      label="Change Password"
                    />
                  </Link>
                </div>

                <div className="py-2 shadow-inner">
                  <LogoutButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function DropdownItem({ icon, label, danger }) {
  return (
    <button
      className={`flex w-full items-center gap-3 px-4 py-2 text-left transition ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
