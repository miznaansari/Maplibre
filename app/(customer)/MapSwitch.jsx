"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GlobeAsiaAustraliaIcon,
  MapIcon,
  SparklesIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

export default function MapSwitch() {
  const pathname = usePathname();

  const tabs = [
    {
      href: "/map1",
      label: "Leaflet",
      icon: GlobeAsiaAustraliaIcon,
    },
    {
      href: "/map2",
      label: "Libre",
      icon: MapIcon,
    },
    {
      href: "/map3",
      label: "Smart",
      icon: SparklesIcon,
    },
    {
      href: "/map6",
      label: "Tile",
      icon: Squares2X2Icon,
    },
  ];

  const base =
    "flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 rounded-full text-xs transition-all duration-200";

  const active =
    "bg-white text-black shadow-md scale-[1.05]";
  const inactive =
    "text-white hover:bg-white/10 hover:scale-[1.03]";

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[3000]">
      <div className="flex items-center gap-1 p-1 rounded-full 
      bg-[#111]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
        
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`${base} ${isActive ? active : inactive}`}
            >
              <Icon className="w-4 h-4" />

              {/* 💡 Show label:
                  - always on desktop
                  - only active on mobile */}
              <span
                className={`
                  ${isActive ? "inline" : "hidden"} 
                  sm:inline
                `}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}