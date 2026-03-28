"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Maplibre() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({}); // 🔥 use object (id based)

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // 🧠 debounce helper
  let debounceTimer = useRef(null);

  const fetchData = async (map) => {
    if (!map) return;

    const bounds = map.getBounds();

    setLoading(true);

    try {
      const res = await fetch(
        `/api/map/get?north=${bounds.getNorth()}&south=${bounds.getSouth()}&east=${bounds.getEast()}&west=${bounds.getWest()}`
      );

      const data = await res.json();

      const newMarkers = {};

      data.cafes.forEach((cafe) => {
        if (markersRef.current[cafe.id]) {
          // ✅ reuse marker
          newMarkers[cafe.id] = markersRef.current[cafe.id];
          return;
        }

        // 🔥 Gen-Z styled popup
        const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
          <div style="
            width:220px;
            border-radius:12px;
            overflow:hidden;
            font-family:sans-serif;
          ">
            ${
              cafe.image
                ? `<img src="${cafe.image}" style="width:100%; height:120px; object-fit:cover;" />`
                : ""
            }
            <div style="padding:10px">
              <h4 style="margin:0;font-size:14px;font-weight:600">
                ${cafe.name}
              </h4>
              <p style="font-size:12px;color:#666;margin-top:4px">
                Cafe · Trending ☕
              </p>
            </div>
          </div>
        `);

        // 🔥 custom marker (blue glow)
        const el = document.createElement("div");
        el.className = "marker";

        const marker = new maplibregl.Marker(el)
          .setLngLat([cafe.lng, cafe.lat])
          .setPopup(popup)
          .addTo(map);

        newMarkers[cafe.id] = marker;
      });

      // ❌ remove old markers not in view
      Object.keys(markersRef.current).forEach((id) => {
        if (!newMarkers[id]) {
          markersRef.current[id].remove();
        }
      });

      markersRef.current = newMarkers;
    } catch (err) {
      console.error("API error:", err);
    }

    setLoading(false);
  };

  // 🗺️ Init map
useEffect(() => {
  if (mapRef.current) return;

  const waitForContainer = () => {
    if (!mapContainer.current) return false;

    const rect = mapContainer.current.getBoundingClientRect();

    return rect.width > 0 && rect.height > 0;
  };

  const initMap = () => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          carto: {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
              "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
              "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "carto-layer",
            type: "raster",
            source: "carto",
          },
        ],
      },
      center: [77.4126, 23.2599],
      zoom: 5,
    });

    mapRef.current = map;

    map.on("load", () => {
      map.resize();
      fetchData(map);
    });
  };

  const interval = setInterval(() => {
    if (waitForContainer()) {
      clearInterval(interval);
      initMap();
    }
  }, 100); // 🔥 keeps checking until ready

  return () => clearInterval(interval);
}, []);
  // 🔍 Search
  const handleSearch = async () => {
    if (!query) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
    );
    const data = await res.json();

    if (data.length > 0) {
      const { lat, lon } = data[0];

      mapRef.current.flyTo({
        center: [parseFloat(lon), parseFloat(lat)],
        zoom: 14,
        essential: true,
      });
    }
  };

  return (
    <div className="relative h-screen w-full">
      {/* 🔍 Search UI */}
      <div className="absolute top-4 left-4 z-10">
  <div
    className="flex items-center gap-2 px-2 py-2 rounded-xl
    bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/10
    shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all"
  >
    {/* 🔍 Input with icon */}
    <div className="flex items-center gap-2 px-2 py-1 rounded-lg 
    bg-white/5 border border-white/10 focus-within:border-blue-400/50
    focus-within:shadow-[0_0_12px_rgba(14,165,233,0.3)] transition">

      {/* Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 text-white/50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
        />
      </svg>

      {/* Input */}
      <input
        className="bg-transparent outline-none text-sm text-white placeholder:text-white/40 w-[180px]"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search city..."
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
      />

      {/* Clear */}
      {query && (
        <button
          onClick={() => setQuery("")}
          className="text-white/40 hover:text-white text-sm transition"
        >
          ✕
        </button>
      )}
    </div>

    {/* 🚀 Button */}
    <button
      onClick={handleSearch}
      className="px-3 py-1.5 rounded-lg text-sm font-medium
      bg-blue-500 hover:bg-blue-600 text-white
      shadow-[0_0_10px_rgba(59,130,246,0.6)]
      transition-all active:scale-95"
    >
      Go
    </button>
  </div>
</div>

      {/* 🧊 Gen-Z Loader */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600 animate-pulse">
              Loading cafes...
            </p>
          </div>
        </div>
      )}

      {/* 🗺️ Map */}
      <div ref={mapContainer} className="h-full w-full" />

      {/* 🔥 Marker Style */}
      <style jsx>{`
        .marker {
          width: 14px;
          height: 14px;
          background: #0ea5e9;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(14, 165, 233, 0.9);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}