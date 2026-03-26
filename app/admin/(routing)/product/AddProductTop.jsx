"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AddProductTop() {
  const pathname = usePathname();

  const match = pathname.match(/\/admin\/product\/add\/(\d+)/);
  const productId = match?.[1];

  const basePath = productId
    ? `/admin/product/add/${productId}`
    : `/admin/product/add`;

  const menu = [
    { label: "Add Product", href: basePath },
    { label: "Tier Pricing", href: `${basePath}/tier-price` },
    { label: "Customer Pricing", href: `${basePath}/customer-pricing` },
  ];

  return (
    <div className="overflow-x-auto">
      <ul className="flex flex-nowrap whitespace-nowrap mt-2 mx-2 text-sm font-medium border-b border-gray-200">
        {menu.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(item.href + "/");

          const isLocked = !productId && item.label !== "Add Product";

          /* 🔒 Disabled tab */
          if (isLocked) {
            return (
              <li key={item.label} className="me-2 shrink-0">
                <span className="inline-block px-4 py-3 text-gray-400 cursor-not-allowed">
                  {item.label}
                </span>
              </li>
            );
          }

          /* ✅ Active / Normal tab */
          return (
            <li key={item.href} className="me-2 shrink-0">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-block px-4 py-3 rounded-t-md transition
                  ${
                    isActive
                      ? "text-blue-600 bg-blue-50 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }
                `}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
