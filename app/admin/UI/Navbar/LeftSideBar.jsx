"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  HomeIcon,
  ShoppingCartIcon,
  TruckIcon,
  ChevronDownIcon,
  UserIcon,
  UsersIcon,
  StarIcon,
  ChatBubbleBottomCenterIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { useSidebar } from "../../context/SidebarContext";

export default function LeftSidebar() {
  const pathname = usePathname();
  const { isOpen, toggle, setOpen } = useSidebar();
  const sidebarRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(null);

  const menu = [
    { title: "Dashboard", icon: HomeIcon, href: "/admin/dashboard" },
    { title: "List Admin", icon: UserIcon, href: "/admin/view" },
    {
      title: "Customer",
      icon: UsersIcon,
      children: [
        { title: "List Customer", href: "/admin/customer" },
        { title: "Company Group", href: "/admin/company/group" },
      ],
    },
    {
      title: "Product Management",
      icon: ShoppingCartIcon,
      children: [
        { title: "List Product", href: "/admin/product" },
        { title: "Product Category", href: "/admin/category" },
      ],
    },
    {
      title: "Orders",
      icon: TruckIcon,
      children: [{ title: "View Orders", href: "/admin/orders" }],
    },
  
    { title: "Wishlist", icon: StarIcon, href: "/admin/wishlist" },
    { title: "Whatsapp", icon: PhoneIcon, href: "/admin/whatsapp" },
    { title: "Contact Form", icon: ChatBubbleBottomCenterIcon, href: "/admin/contact" },
    { title: "Back to Website", icon: TruckIcon, href: "/" }

  ];

  const isParentActive = (item) =>
    item.children?.some((child) => pathname.startsWith(child.href));

  useEffect(() => {
    const activeParent = menu.find(isParentActive);
    if (activeParent) setOpenMenu(activeParent.title);
  }, [pathname]);

  const toggleMenu = (title) =>
    setOpenMenu((prev) => (prev === title ? null : title));

  // Close sidebar on click outside for xs/sm
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        window.innerWidth < 768 &&
        isOpen
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setOpen]);

  return (
    <>
      {/* Overlay for xs/sm */}
      {isOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-md transition-transform duration-300 z-40
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="mb-8 flex items-center gap-2 px-4 py-3">
          <Image
            src="/images/logo/samadLogoremove.png"
            alt="Logo"
            width={150}
            height={100}
            priority
          />
        </div>

        <p className="mb-3 px-4 text-xs font-semibold text-gray-400">MENU</p>

        <nav className="space-y-1 px-2">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = item.href && pathname === item.href;
            const isChildActive = isParentActive(item);
            const isOpenMenu = openMenu === item.title || isChildActive;

            return (
              <div key={item.title}>
                {item.href ? (
                  <Link
                    href={item.href}
                    onClick={() => window.innerWidth < 768 && setOpen(false)}
                    className={`flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-600 shadow-sm"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                ) : (
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={`flex w-full items-center justify-between rounded px-3 py-2 text-sm font-medium transition
                      ${
                        isChildActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      {item.title}
                    </div>
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isOpenMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}

                {item.children && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpenMenu ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="mt-1 space-y-1 pl-10">
                      {item.children.map((child) => {
                        const activeChild = pathname === child.href;
                        return (
                          <Link
                            key={child.title}
                            href={child.href}
                            onClick={() => window.innerWidth < 768 && setOpen(false)}
                            className={`block rounded px-3 py-2 text-sm transition
                              ${
                                activeChild
                                  ? "bg-blue-100 text-blue-600 font-medium"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                          >
                            {child.title}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
