"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProductTopBar() {
  const pathname = usePathname();

  const match = pathname.match(/\/admin\/product\/edit\/(\d+)/);
  const productId = match?.[1];

  const basePath = productId
    ? `/admin/product/edit/${productId}`
    : `/admin/product/add`;

  const menu = [
    { label: "Edit Product", href: basePath },
    { label: "Tier Pricing", href: `${basePath}/tier-price` },
    { label: "Customer Pricing", href: `${basePath}/customer-pricing` },
  ];

  return (
    <div className="overflow-x-auto">
      <ul className="flex flex-nowrap whitespace-nowrap text-sm mt-2 mx-2 font-medium border-b border-gray-200">
        {menu.map((item) => {
          const isActive =
            item.label === "Edit Product"
              ? pathname === item.href
              : pathname === item.href ||
                pathname.startsWith(item.href + "/");

          return (
            <li key={item.href} className="me-2 shrink-0">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`
                  inline-block px-4 py-3 rounded-t-md transition
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
