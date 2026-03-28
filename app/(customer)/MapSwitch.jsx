"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GlobeAsiaAustraliaIcon,
  MapIcon,
} from "@heroicons/react/24/outline";

export default function MapSwitch() {
  const pathname = usePathname();

  const isMap1 = pathname === "/map1";
  const isMap2 = pathname === "/map2";

  return (
    <div className="fixed bottom-2 left-2  z-[3000]">
      <div className="flex items-center gap-1 p-1 rounded-full 
      bg-[#111]/80 backdrop-blur-md border border-white/10 shadow-xl">

        {/* 🌍 Leaflet */}
        <Link
          href="/map1"
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all
          ${
            isMap1
              ? "bg-white text-black shadow-md"
              : "text-white hover:bg-white/10"
          }`}
        >
          <GlobeAsiaAustraliaIcon className="w-4 h-4" />
          Leaflet
        </Link>

        {/* 🗺️ MapLibre */}
        <Link
          href="/map2"
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all
          ${
            isMap2
              ? "bg-white text-black shadow-md"
              : "text-white hover:bg-white/10"
          }`}
        >
          <MapIcon className="w-4 h-4" />
          MapLibre
        </Link>

      </div>
    </div>
  );
}