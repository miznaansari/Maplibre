"use client";

import Link from "next/link";
import {
  GlobeAsiaAustraliaIcon,
  MapIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export default function Page() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center 
    bg-gradient-to-br from-black via-zinc-900 to-zinc-800 text-white px-4">

      {/* 🌟 Hero Title */}
      <h1 className="text-3xl md:text-5xl font-bold mb-2 text-center tracking-tight">
        Choose Your Map
      </h1>
      <p className="text-white/60 mb-8 md:mb-10 text-center text-sm md:text-base">
        Select your preferred map experience
      </p>

      {/* 🗺️ Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl">

        {/* 🍃 Leaflet */}
        <Link
          href="/map1"
          className="group p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10 
          hover:bg-white/10 transition-all duration-300 backdrop-blur-xl shadow-xl
          hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex flex-col items-center text-center gap-3 md:gap-4">
            <div className="p-3 md:p-4 rounded-full bg-white/10 group-hover:bg-white/20 transition">
              <GlobeAsiaAustraliaIcon className="w-6 h-6 md:w-8 md:h-8" />
            </div>

            <h2 className="text-base md:text-xl font-semibold">
              Leaflet Map
              <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-white text-black">
                             IndexedDB 

              </span>
            </h2>

            <p className="text-xs md:text-sm text-white/60 leading-relaxed">
              Lightweight and simple. Great for basic maps and fast loading.
            </p>
          </div>
        </Link>

        {/* 🚀 MapLibre */}
        <Link
          href="/map2"
          className="group p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10 
          hover:bg-white/10 transition-all duration-300 backdrop-blur-xl shadow-xl
          hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex flex-col items-center text-center gap-3 md:gap-4">
            <div className="p-3 md:p-4 rounded-full bg-white/10 group-hover:bg-white/20 transition">
              <MapIcon className="w-6 h-6 md:w-8 md:h-8" />
            </div>

            <h2 className="text-base md:text-xl font-semibold">
              MapLibre + Ola
            </h2>

            <p className="text-xs md:text-sm text-white/60 leading-relaxed">
              High performance vector maps with advanced customization.
            </p>
          </div>
        </Link>

        {/* ⚡ Smart Map */}
        <Link
          href="/map3"
          className="group p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10 
          hover:bg-white/10 transition-all duration-300 backdrop-blur-xl shadow-xl
          hover:scale-[1.03] active:scale-[0.98]"
        >
          <div className="flex flex-col items-center text-center gap-3 md:gap-4">
            <div className="p-3 md:p-4 rounded-full bg-white/10 group-hover:bg-white/20 transition">
              <SparklesIcon className="w-6 h-6 md:w-8 md:h-8" />
            </div>

            <h2 className="text-base md:text-xl font-semibold">
             MapLibre + Ola <br />
              <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-white text-black">
                            Image Markers  

              </span>
              <br />
               <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-white text-black">
                            IndexedDB 

              </span>
            </h2>

            <p className="text-xs md:text-sm text-white/60 leading-relaxed">
              MapLibre + Ola with image markers and enhanced experience.
            </p>
          </div>
        </Link>

      </div>
    </div>
  );
}