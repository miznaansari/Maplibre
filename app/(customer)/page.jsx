"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GlobeAsiaAustraliaIcon,
  MapIcon,
} from "@heroicons/react/24/outline";

// 🚨 Disable SSR
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
});

const Maplibre = dynamic(() => import("./Maplibre"), {
  ssr: false,
});

export default function Page() {
  const pathname = usePathname();

  const isMap1 = pathname === "/map1";
  const isMap2 = pathname === "/map2";

  return (
    <div className="h-screen w-full relative overflow-hidden">


      {/* 🔥 FLOATING NAV UI */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[3000]">
        <div className="flex items-center gap-1 p-1 rounded-full 
        bg-[#111]/80 backdrop-blur-md border border-white/10 shadow-xl">

          {/* MAP 1 */}
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

          {/* MAP 2 */}
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
    </div>
  );
}