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
            localStorage.getItem("username");

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

    /* CLOSE MENU (USED BY ITEMS) */
    const closeMenu = () => {
        setOpen(false);
    };

    return (
        <div
            ref={ref}
            className="relative"
            /* HOVER SUPPORT (DESKTOP ONLY) */
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            {/* BUTTON */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 hover:underline select-none"
            >
                <UserIcon className="h-5 w-5" />
                <span className="font-medium">
                    {userName || "My Account"}
                </span>
                <ChevronDownIcon
                    className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* DROPDOWN */}
            <div
                className={`
          absolute right-0 top-full mt-0 w-56 rounded bg-white text-gray-800 shadow-xl z-50 overflow-hidden
          transform transition-all duration-200 ease-out
          ${open
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
        `}
            >
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

                <div className="border-t border-gray-200">
                    {/* LOGOUT (AUTO CLOSE AFTER SUBMIT VIA REDIRECT) */}
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
        border-t border-gray-200
        hover:bg-gray-100 transition-colors duration-150
      "
        >
            <span className="text-gray-600">{icon}</span>
            <span className="font-medium">{label}</span>
        </Link>
    );
}
