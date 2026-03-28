"use client";

import Link from "next/link";
import {
  GlobeAsiaAustraliaIcon,
  MapIcon,
} from "@heroicons/react/24/outline";

export default function Page() {
  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white">

      {/* 🌟 Hero Title */}
      <h1 className="text-3xl md:text-5xl font-bold mb-3 text-center">
        Choose Your Map
      </h1>
      <p className="text-white/60 mb-10 text-center">
        Select your preferred map experience
      </p>

      {/* 🗺️ Big Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl px-6">

        {/* 🍃 Leaflet */}
        <Link
          href="/map1"
          className="group p-6 rounded-2xl bg-white/5 border border-white/10 
          hover:bg-white/10 transition-all duration-300 backdrop-blur-xl shadow-xl"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-4 rounded-full bg-white/10 group-hover:bg-white/20 transition">
              <GlobeAsiaAustraliaIcon className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-semibold">Leaflet Map</h2>

            <p className="text-sm text-white/60">
              Lightweight and simple. Great for basic maps and fast loading.
            </p>
          </div>
        </Link>

        {/* 🚀 MapLibre */}
        <Link
          href="/map2"
          className="group p-6 rounded-2xl bg-white/5 border border-white/10 
          hover:bg-white/10 transition-all duration-300 backdrop-blur-xl shadow-xl"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-4 rounded-full bg-white/10 group-hover:bg-white/20 transition">
              <MapIcon className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-semibold">MapLibre + Ola Map</h2>

            <p className="text-sm text-white/60">
              High performance vector maps with advanced customization.
            </p>
          </div>
        </Link>

      </div>
    </div>
  );
}