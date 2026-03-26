"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { label: "Dashboard", href: "/my-account" },
  { label: "Orders", href: "/my-account/orders" },
  { label: "Downloads", href: "/my-account/downloads" },
  { label: "Addresses", href: "/my-account/addresses" },
  { label: "Payment methods", href: "/my-account/payment-methods" },
  { label: "Account Details", href: "/my-account/account-details" },
  { label: "Wishlist", href: "/my-account/wishlist" },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0">
      <ul className="space-y-2">
        {menu.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded px-4 py-3 text-sm font-medium transition
                  ${
                    isActive
                      ? "bg-[#0072BC] text-white"
                      : "bg-white text-gray-800 hover:bg-gray-100"
                  }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}

        {/* LOGOUT */}
        <li>
          <button
            className="block w-full rounded bg-white px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-100"
            onClick={() => {
              localStorage.removeItem("authToken");
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </li>
      </ul>
    </aside>
  );
}
