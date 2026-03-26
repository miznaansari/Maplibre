"use client";

import Image from "next/image";
import Link from "next/link";
import pkg from "../../../../../package.json";
import { HeartIcon } from "@heroicons/react/24/solid";

export default function Footer({ category = [] }) {
  const filteredCategories = category.filter(
    (cat) => cat.slug !== "uncategorized"
  );

  return (
    <footer className="bg-white text-gray-600 border-t border-gray-200">

      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* BRAND */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/images/logo/samadLogoremove.png"
                alt="Samad Agency"
                width={140}
                height={40}
              />
            </div>

            <p className="text-sm leading-relaxed mb-6">
              Wholesale mobile accessories supplier delivering quality
              products across India including Airpods, Chargers, Data Cables,
              Handsfree, Neckbands, and Power Banks.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4">
              <a
                href="#"
                className="border border-gray-300 p-2 hover:border-[#347eb3] hover:text-[#347eb3] transition"
              >
                IG
              </a>
              <a
                href="#"
                className="border border-gray-300 p-2 hover:border-[#347eb3] hover:text-[#347eb3] transition"
              >
                TW
              </a>
              <a
                href="#"
                className="border border-gray-300 p-2 hover:border-[#347eb3] hover:text-[#347eb3] transition"
              >
                YT
              </a>
            </div>

            <p className="text-xs text-gray-500 mt-6">
              v{pkg.version}
            </p>
          </div>

          {/* SHOP */}
          <FooterColumn
            title="SHOP"
            links={filteredCategories.map((cat) => ({
              label: cat.name,
              href: `/product-category/${cat.path || cat.slug}`,
            }))}
          />

          {/* SUPPORT */}
          <FooterColumn
            title="SUPPORT"
            links={[
              { label: "Shipping Info", href: "/shipping" },
              { label: "Returns & Exchanges", href: "/returns" },
              { label: "Track Order", href: "/track-order" },
              { label: "Contact Us", href: "/contact-us" },
              { label: "Admin Access", href: "/admin" },
            ]}
          />

          {/* NEWSLETTER */}
          <div>
            <h4 className="text-black text-sm font-semibold mb-4 uppercase tracking-wider">
              NEWSLETTER
            </h4>

            <p className="text-sm mb-6">
              Get updates about new arrivals, wholesale deals,
              and latest accessories offers.
            </p>

            <div className="flex">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-white border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:border-[#347eb3]"
              />
              <button className="bg-[#347eb3] text-white px-4 hover:bg-[#0284c7] transition">
                →
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mt-14 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">

          <p className="text-center">
            © 2026 Samad Agency. All Rights Reserved. 
            Developed & Designed by{" "}
            <a
              href="https://www.mizna.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#347eb3] hover:underline"
            >
              Mohd Mizna Ansari
            </a>
          </p>

          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-[#347eb3]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#347eb3]">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-[#347eb3]">
              Cookies
            </Link>
          </div>

          <p className="text-gray-500 flex items-center gap-2">
            MADE WITH
            <span className="text-red-500">
              <HeartIcon height={20} />
            </span>
            FOR THE CULTURE
          </p>

        </div>
      </div>
    </footer>
  );
}


/* COLUMN COMPONENT */
function FooterColumn({ title, links = [] }) {
  return (
    <div>
      <h4 className="text-black text-sm font-semibold mb-4 uppercase tracking-wider">
        {title}
      </h4>

      <ul className="space-y-3 text-sm">
        {links.map((link, i) => (
          <li key={i}>
            <Link
              href={link.href}
              className="hover:text-[#347eb3] transition"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}