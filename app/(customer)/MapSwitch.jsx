"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GlobeAsiaAustraliaIcon,
  MapIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function MapSwitch() {
  const pathname = usePathname();

  const isMap1 = pathname === "/map1";
  const isMap2 = pathname === "/map2";
  const isMap3 = pathname === "/map3";

  const base =
    "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all duration-200";

  const active =
    "bg-white text-black shadow-md scale-[1.05]";
  const inactive =
    "text-white hover:bg-white/10 hover:scale-[1.03]";

  return (
    <div className="fixed bottom-3 left-3 z-[3000]">
      <div className="flex items-center gap-1 p-1 rounded-full 
      bg-[#111]/80 backdrop-blur-xl border border-white/10 shadow-2xl">

        {/* 🌍 Leaflet */}
        <Link
          href="/map1"
          className={`${base} ${isMap1 ? active : inactive}`}
        >
          <GlobeAsiaAustraliaIcon className="w-4 h-4" />
          Leaflet
        </Link>

        {/* 🗺️ MapLibre */}
        <Link
          href="/map2"
          className={`${base} ${isMap2 ? active : inactive}`}
        >
          <MapIcon className="w-4 h-4" />
          MapLibre
        </Link>

        {/* ⚡ MapLibre + Ola + Image Marker */}
        <Link
          href="/map3"
          className={`${base} ${isMap3 ? active : inactive}`}
        >
          <SparklesIcon className="w-4 h-4" />
          Smart Map
        </Link>

      </div>
    </div>
  );
}