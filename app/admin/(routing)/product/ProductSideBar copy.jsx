"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { label: "Add Product", href: "/admin/product/add" },
  { label: "Tier Pricing", href: "/admin/product/add/tier-pricing" },
  { label: "Customer Pricing", href: "/admin/product/add/customer-pricing" },
];

export default function ProductTopBar() {
  const pathname = usePathname();

  return (
    <div className="w-full border-b border-gray-200 bg-white">
      <nav
        className="
          mx-auto flex max-w-7xl gap-2
          overflow-x-auto px-3 py-2
          sm:overflow-visible sm:px-4 sm:py-4
          scrollbar-hide
        "
      >
        {menu.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group relative flex shrink-0 items-center
                h-9 sm:h-11
                pl-4 pr-8 sm:pl-5 sm:pr-10
                text-xs sm:text-sm font-medium
                rounded-l-md
                transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0072BC]/60
                mr-5
                ${
                  isActive
                    ? "bg-[#0072BC] text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              {/* LABEL */}
              <span className="relative z-10 whitespace-nowrap">
                {item.label}
              </span>

              {/* ARROW */}
              <span
                className={`
                  pointer-events-none absolute right-[-14px] sm:right-[-18px] top-0
                  h-0 w-0
                  border-t-[18px] border-b-[18px]
                  sm:border-t-[22px] sm:border-b-[22px]
                  border-l-[14px] sm:border-l-[18px]
                  border-t-transparent border-b-transparent
                  transition-colors duration-200
                  ${
                    isActive
                      ? "border-l-[#0072BC]"
                      : "border-l-gray-100 group-hover:border-l-gray-200"
                  }
                `}
              />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
