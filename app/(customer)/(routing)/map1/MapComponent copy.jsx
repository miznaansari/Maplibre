"use client";

import MarkerClusterGroup from "react-leaflet-cluster";
import { useEffect, useState, useRef } from "react";
import { saveCafes, getCafesInBounds } from "@/lib/indexedDB";
import { GeoJSON } from "react-leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import indiaBoundary from "./india.json";

import L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { MoonIcon, SunIcon } from "lucide-react";

// Fix marker issue
delete L.Icon.Default.prototype._getIconUrl;

const indiaBounds = [
  [6.5, 68],
  [37.5, 97],
];


// 🔥 FETCH ON MOVE (OPTIMIZED + LOADER CONTROL)
function FetchOnMove({ setCafes, setLoading, setApiLogs }) {
  const map = useMap();
  const timeoutRef = useRef(null);
  const firstLoad = useRef(true);

  useEffect(() => {
   
const fetchData = async () => {
  const boundsObj = {
    north: map.getBounds().getNorth(),
    south: map.getBounds().getSouth(),
    east: map.getBounds().getEast(),
    west: map.getBounds().getWest(),
  };

  const zoom = map.getZoom();
  const requestId = Date.now();

  // 🔥 1. CHECK INDEXED DB FIRST
  const cacheStart = performance.now();
  const cached = await getCafesInBounds(boundsObj);
  const cacheTime = Math.round(performance.now() - cacheStart);

  if (cached.length > 50) {
    // ✅ CACHE HIT
    setApiLogs((prev) => [
      {
        id: requestId,
        url: "indexedDB",
        status: "cache-hit",
        time: cacheTime,
      },
      ...prev.slice(0, 5),
    ]);

    setCafes((prev) => {
      const mapData = new Map(prev.map((c) => [c.id, c]));
      cached.forEach((c) => mapData.set(c.id, c));
      return Array.from(mapData.values());
    });

    setLoading(false);
    return; // 🚀 STOP API CALL
  }

  // ❌ CACHE MISS
  setApiLogs((prev) => [
    {
      id: requestId,
      url: "indexedDB",
      status: "cache-miss",
      time: cacheTime,
    },
    ...prev.slice(0, 5),
  ]);

  // 🔥 2. API CALL
  const url = `/api/map/get?north=${boundsObj.north}&south=${boundsObj.south}&east=${boundsObj.east}&west=${boundsObj.west}&zoom=${zoom}`;

  const start = performance.now();

  setApiLogs((prev) => [
    {
      id: requestId,
      url: "api/map/get",
      status: "pending",
      time: null,
    },
    ...prev.slice(0, 5),
  ]);

  try {
    const res = await fetch(url);
    const data = await res.json();

    const duration = Math.round(performance.now() - start);

    // ✅ success log
    setApiLogs((prev) =>
      prev.map((log) =>
        log.id === requestId
          ? { ...log, status: "success", time: duration }
          : log
      )
    );

    // 🔥 STORE IN INDEXED DB
    await saveCafes(data.cafes);

    setCafes((prev) => {
      const mapData = new Map(prev.map((c) => [c.id, c]));
      data.cafes.forEach((c) => mapData.set(c.id, c));
      return Array.from(mapData.values());
    });

    setLoading(false);
  } catch (err) {
    const duration = Math.round(performance.now() - start);

    setApiLogs((prev) =>
      prev.map((log) =>
        log.id === requestId
          ? { ...log, status: "error", time: duration }
          : log
      )
    );

    console.error(err);
    setLoading(false);
  }
};
    const handleMove = () => {
      clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        fetchData();
      }, 400); // debounce
    };

    map.on("moveend", handleMove);
    map.on("zoomend", handleMove);

    // initial load
    fetchData();

    return () => {
      map.off("moveend", handleMove);
      map.off("zoomend", handleMove);
    };
  }, [map, setCafes, setLoading]);

  return null;
}


// ✈️ Fly animation
function FlyToLocation({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 14, { duration: 1.5 });
    }
  }, [lat, lng, map]);

  return null;
}


// 🔍 Zoom Control UI
function ZoomControl() {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const updateZoom = () => setZoom(map.getZoom());

    map.on("zoomend", updateZoom);
    return () => map.off("zoomend", updateZoom);
  }, [map]);

  return (
    <div className="absolute bottom-6 right-4 z-[1000]">
      <div className="bg-[#111]/90 backdrop-blur-md rounded-xl shadow-lg flex flex-col overflow-hidden text-center border border-white/10">

        <div className="text-white text-xs py-1 border-b border-white/10">
          {zoom}
        </div>

        <button
          onClick={() => map.zoomIn()}
          className="px-3 py-2 text-white hover:bg-white/10 transition"
        >
          +
        </button>
        <button
          onClick={() => map.zoomOut()}
          className="px-3 py-2 text-white hover:bg-white/10 transition"
        >
          -
        </button>
      </div>
    </div>
  );
}


// 🌍 MAIN COMPONENT
export default function MapComponent() {
  const [cafes, setCafes] = useState([]);
  const [apiLogs, setApiLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("dark");
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };
  // 📍 user location
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => { }
    );
  }, []);

  // 🔍 search
  useEffect(() => {
    if (!search) return setFiltered([]);

    const result = cafes.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );

    setFiltered(result.slice(0, 6));
  }, [search, cafes]);

  // 🔥 marker UI
  const getMarkerIcon = (image) =>
    L.divIcon({
      html: `<div style="background:#111;padding:4px;border-radius:10px">
        <img src="${image || ""}" style="width:36px;height:36px;border-radius:8px;object-fit:cover"/>
      </div>`,
      className: "",
      iconSize: [46, 50],
      iconAnchor: [23, 50],
    });
  const getFirstImage = (image) => {
    try {
      const arr = JSON.parse(image);
      return arr[0];
    } catch {
      return image?.split('","')[0]?.replace('["', '') || image;
    }
  };
  return (
    <div className="relative w-full h-[100dvh]">
      {/* 🔥 API DEBUG OVERLAY */}
      <div className="absolute top-4 left-4 z-[3000] space-y-2">
        {apiLogs.map((log) => (
     <div
  key={log.id}
  className={`px-3 py-1 rounded-md text-xs font-mono shadow-lg backdrop-blur-md border

    ${log.status === "pending" && "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"}
    ${log.status === "success" && "bg-green-500/20 text-green-300 border-green-500/30"}
    ${log.status === "error" && "bg-red-500/20 text-red-300 border-red-500/30"}

    ${log.status === "cache-hit" && "bg-blue-500/20 text-blue-300 border-blue-500/30"}
    ${log.status === "cache-miss" && "bg-purple-500/20 text-purple-300 border-purple-500/30"}
  `}
>
            {log.url} → {log.status}
            {log.time && ` (${log.time}ms)`}
          </div>
        ))}
      </div>
      {/* 🔥 GEN-Z LOADER */}
      {loading && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center backdrop-blur-md bg-black/50 transition-opacity duration-500">

          <div className="flex flex-col items-center gap-4">

            {/* Glow Spinner */}
            <div className="w-14 h-14 rounded-full border-4 border-[#0ea5e9]/30 border-t-[#0ea5e9] animate-spin shadow-[0_0_40px_#0ea5e9]" />

            <p className="text-white text-sm tracking-wide animate-pulse">
              Finding cafes near you...
            </p>

            {/* Pulse dots */}
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150" />
              <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-300" />
            </div>

          </div>
        </div>
      )}


      {/* 🔍 SEARCH */}
      <div className="absolute top-4 left-4 z-[1000] w-[340px]">
        <div
          className="relative bg-[#0f0f0f]/80 backdrop-blur-xl rounded-2xl 
    shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-white/10 p-2
    transition-all duration-300"
        >
          {/* 🔍 Search Bar */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-full 
    bg-white/5 border border-white/10 focus-within:border-blue-400/50
    focus-within:shadow-[0_0_15px_rgba(14,165,233,0.3)] transition">

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
              type="text"
              placeholder="Search cafes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/40"
            />

            {/* ❌ Clear */}
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  setFiltered([]);
                }}
                className="text-white/40 hover:text-white transition text-sm"
              >
                ✕
              </button>
            )}
          </div>

          {/* 🔽 Dropdown */}
          {filtered.length > 0 && (
            <div
              className="mt-2 max-h-[220px] overflow-y-auto rounded-xl 
        bg-white/5 border border-white/10 backdrop-blur-md
        divide-y divide-white/5 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              {filtered.map((cafe) => (
                <div
                  key={cafe.id}
                  onClick={() => {
                    setSelectedLocation({ lat: cafe.lat, lng: cafe.lng });
                    setSearch("");
                    setFiltered([]);
                  }}
                  className="px-3 py-2 cursor-pointer text-sm text-white 
            flex items-center justify-between
            hover:bg-white/10 active:scale-[0.98] transition-all duration-150"
                >
                  {/* Name */}
                  <span className="truncate">{cafe.name}</span>

                  {/* Small badge */}
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    Cafe
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="absolute top-6 right-7 z-[1000]">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111]/90 backdrop-blur-md text-white border border-white/10 shadow-lg hover:scale-105 transition-all duration-300"
        >
          {theme === "dark" ? (
            <>
              <MoonIcon className="w-5 h-5 text-blue-400" />
              {/* <span className="text-sm">Dark</span> */}
            </>
          ) : (
            <>
              <SunIcon className="w-5 h-5 text-yellow-400" />
              {/* <span className="text-sm">Light</span> */}
            </>
          )}
        </button>
      </div>

      <MapContainer
        center={[22.9734, 78.6569]}
        zoom={5}
        minZoom={5}
        zoomControl={false}
        maxBounds={indiaBounds}
        maxBoundsViscosity={1.0}
        className="h-full w-full"
        keepBuffer={8} // 🔥 increase buffer
      >
        <FetchOnMove
          setCafes={setCafes}
          setLoading={setLoading}
          setApiLogs={setApiLogs}
        />

        {/* 📍 user */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        <TileLayer
          url={
            theme === "dark"
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              // : "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          }
          updateWhenIdle={true}
          keepBuffer={12}
        />
        {/* <GeoJSON
          data={indiaBoundary}
          style={{
            color: "#3d3d3d",
            weight: 2,
            opacity: 0.9,
            fill: false,          // ❌ no fill
            // dashArray: "4 6",     // 🔹 dotted/dashed border
          }}
        /> */}

        {selectedLocation && <FlyToLocation {...selectedLocation} />}

        <ZoomControl />

        <MarkerClusterGroup chunkedLoading disableClusteringAtZoom={16}>
          {cafes.map((cafe) => (
            <Marker
              key={cafe.id}
              position={[cafe.lat, cafe.lng]}
              icon={getMarkerIcon(cafe.image)}
            >
              <Popup>
                <div className="w-[280px]     bg-[#0b0b0f] text-white rounded-2xl p-3 shadow-2xl">

                  {/* Title */}
                  <h3 className="font-semibold text-sm mb-2">
                    {cafe.name}
                  </h3>
                  {cafe.image && (
                    <img
                      src={getFirstImage(cafe.image)}
                      onError={(e) => {
                        e.target.src =
                          "https://cg.a2deats.com/variants/360/gallery_9f70a17b-a215-46d1-85cc-2420fa58db4c.jpeg";
                      }}
                      className="w-full h-[100px] my-4 object-cover mt-2 rounded-lg"
                    />
                  )}
                  {/* 📍 Open in Google Maps */}
                  <button
                    onClick={() => {
                      const destination = `${cafe.lat},${cafe.lng}`;

                      if (userLocation) {
                        const origin = `${userLocation.lat},${userLocation.lng}`;

                        window.open(
                          `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
                          "_blank"
                        );
                      } else {
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${destination}`,
                          "_blank"
                        );
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-black font-medium py-2 rounded-xl text-sm hover:bg-yellow-300 transition"
                  >

                    <MapPinIcon className="w-4 h-4" />
                    Open in Google Maps
                  </button>

                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}