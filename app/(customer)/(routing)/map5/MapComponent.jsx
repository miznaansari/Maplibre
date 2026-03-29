"use client";

import MarkerClusterGroup from "react-leaflet-cluster";
import { useEffect, useState, useRef } from "react";
import { getTile, saveTile } from "@/lib/map/tileDB";
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
  const isLoadingTilesRef = useRef(false);
  const pendingReloadRef = useRef(false);
  const didInitialLoadRef = useRef(false);
  const abortControllerRef = useRef(null);
  const requestSeqRef = useRef(0);

  useEffect(() => {
    const logEvent = (log) => {
      setApiLogs((prev) => [
        {
          id: Date.now() + Math.random(),
          ...log,
        },
        ...prev.slice(0, 9),
      ]);
    };

    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const MAX_RENDER_CAFES = isMobile ? 900 : 1800;
    const MAX_TILES_PER_LOAD = isMobile ? 36 : 64;
    const MAX_CONCURRENT_FETCHES = isMobile ? 4 : 8;

    const toCafeList = (features) => {
      const byId = new Map();

      features.forEach((feature) => {
        const props = feature?.properties ?? {};
        const [lng, lat] = feature?.geometry?.coordinates ?? [];

        if (typeof lng !== "number" || typeof lat !== "number") {
          return;
        }

        const id = props.id ?? `${lng}_${lat}_${props.name ?? "cafe"}`;
        if (byId.has(id)) return;

        byId.set(id, {
          id,
          name: props.name ?? "Cafe",
          image: props.image ?? "",
          lng,
          lat,
        });
      });

      return Array.from(byId.values())
        .sort((a, b) => String(a.id).localeCompare(String(b.id)))
        .slice(0, MAX_RENDER_CAFES);
    };

    const limitTilesByDistance = (tiles, bounds, zoom) => {
      if (tiles.length <= MAX_TILES_PER_LOAD) return tiles;

      const center = bounds.getCenter();
      const centerTile = lngLatToTile(center.lng, center.lat, zoom);

      const dist = (tile) => {
        const dx = tile.x - centerTile.x;
        const dy = tile.y - centerTile.y;
        return dx * dx + dy * dy;
      };

      return tiles
        .slice()
        .sort((a, b) => dist(a) - dist(b))
        .slice(0, MAX_TILES_PER_LOAD);
    };

    const loadTiles = async () => {
      if (!map || !map.getBounds) return;
      if (isLoadingTilesRef.current) {
        pendingReloadRef.current = true;
        return;
      }

      isLoadingTilesRef.current = true;
      if (!didInitialLoadRef.current) {
        setLoading(true);
      }

      try {
        requestSeqRef.current += 1;
        const currentSeq = requestSeqRef.current;

        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        const loadStart = performance.now();
        const bounds = map.getBounds();
        const zoom = Math.floor(map.getZoom());
        const preloadPadding = zoom >= 13 ? 1 : 0;
        const rawTiles = getVisibleTiles(bounds, zoom, preloadPadding);
        const tiles = limitTilesByDistance(rawTiles, bounds, zoom);
        const allFeatures = [];
        let cacheHits = 0;
        let networkSuccess = 0;
        let networkErrors = 0;

        let tileIndex = 0;
        const workers = Array.from(
          { length: Math.min(MAX_CONCURRENT_FETCHES, tiles.length) },
          async () => {
            while (tileIndex < tiles.length) {
              const currentIndex = tileIndex;
              tileIndex += 1;
              const { x, y, z } = tiles[currentIndex];

            const key = `${z}_${x}_${y}`;
            const url = `/api/map/tile/${z}/${x}/${y}`;

            const cached = await getTile(key);

            if (cached?.data?.features) {
              cacheHits += 1;
              allFeatures.push(...cached.data.features);
              return;
            }

            try {
              const res = await fetch(url, { signal: controller.signal });
              const data = await res.json();
              const features = Array.isArray(data?.features) ? data.features : [];

              allFeatures.push(...features);
              await saveTile(key, { features });
              networkSuccess += 1;
            } catch (err) {
              if (err?.name === "AbortError") {
                return;
              }
              networkErrors += 1;
              logEvent({
                url,
                status: "error",
                time: null,
              });
            }
            }
          }
        );

        await Promise.all(workers);

        if (currentSeq !== requestSeqRef.current) {
          return;
        }

        const cafes = toCafeList(allFeatures);
        setCafes((prev) => {
          if (prev.length !== cafes.length) return cafes;
          for (let i = 0; i < prev.length; i += 1) {
            const a = prev[i];
            const b = cafes[i];
            if (!b || a.id !== b.id || a.lat !== b.lat || a.lng !== b.lng) {
              return cafes;
            }
          }
          return prev;
        });

        const duration = Math.round(performance.now() - loadStart);
        logEvent({
          url: `/api/map/tile/* z${zoom} (${tiles.length}/${rawTiles.length})`,
          status: networkErrors > 0 ? "error" : networkSuccess > 0 ? "success" : "cache-hit",
          time: duration,
          meta: { cacheHits, networkSuccess, networkErrors, cafes: cafes.length },
        });
      } finally {
        if (!didInitialLoadRef.current) {
          didInitialLoadRef.current = true;
          setLoading(false);
        }
        isLoadingTilesRef.current = false;

        if (pendingReloadRef.current) {
          pendingReloadRef.current = false;
          window.setTimeout(() => {
            void loadTiles();
          }, 0);
        }
      }
    };

    const handleMove = () => {
      clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        if (map && map._loaded) {
          void loadTiles();
        } else {
          map.whenReady(() => {
            void loadTiles();
          });
        }
      }, 400); // debounce
    };

    map.on("moveend", handleMove);
    map.on("zoomend", handleMove);

    // initial load
    if (map && map._loaded) {
      void loadTiles();
    } else {
      map.whenReady(() => {
        void loadTiles();
      });
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
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
  const logsContainerRef = useRef(null);
  const [cafes, setCafes] = useState([]);
  const [apiLogs, setApiLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");
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

  useEffect(() => {
    if (!logsContainerRef.current) return;
    if (typeof window === "undefined") return;

    if (window.innerWidth < 640) {
      logsContainerRef.current.scrollTo({ left: 0, behavior: "auto" });
    }
  }, [apiLogs]);

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
    <div
      className={`relative w-full h-[100dvh] ${
        theme === "dark" ? "bg-zinc-950" : "bg-slate-100"
      }`}
    >
      <div className="absolute top-3 left-3 right-3 z-[3000] sm:right-auto sm:max-w-[360px] flex flex-col gap-2 pointer-events-auto">
        <div
          className={`rounded-2xl p-2 border shadow-xl backdrop-blur-xl ${
            theme === "dark"
              ? "bg-zinc-900/85 border-white/10"
              : "bg-white/90 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border w-full ${
                theme === "dark"
                  ? "bg-zinc-800/80 border-white/10"
                  : "bg-slate-50 border-slate-300"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 ${
                  theme === "dark" ? "text-white/60" : "text-slate-500"
                }`}
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

              <input
                type="text"
                placeholder="Search cafes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full bg-transparent outline-none text-sm ${
                  theme === "dark"
                    ? "text-white placeholder:text-white/50"
                    : "text-slate-900 placeholder:text-slate-500"
                }`}
              />

              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setFiltered([]);
                  }}
                  className={`transition text-sm ${
                    theme === "dark"
                      ? "text-white/50 hover:text-white"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className={`flex items-center justify-center p-2.5 rounded-xl border shadow-sm transition-all ${
                theme === "dark"
                  ? "bg-zinc-800 text-white border-white/10 hover:bg-zinc-700"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {theme === "dark" ? (
                <MoonIcon className="w-5 h-5 text-blue-400" />
              ) : (
                <SunIcon className="w-5 h-5 text-amber-500" />
              )}
            </button>
          </div>

          {filtered.length > 0 && (
            <div
              className={`mt-2 max-h-[220px] overflow-y-auto rounded-xl border divide-y ${
                theme === "dark"
                  ? "bg-zinc-800/90 border-white/10 divide-white/10"
                  : "bg-white border-slate-200 divide-slate-100"
              }`}
            >
              {filtered.map((cafe) => (
                <div
                  key={cafe.id}
                  onClick={() => {
                    setSelectedLocation({ lat: cafe.lat, lng: cafe.lng });
                    setSearch("");
                    setFiltered([]);
                  }}
                  className={`px-3 py-2 cursor-pointer text-sm flex items-center justify-between transition-all duration-150 ${
                    theme === "dark"
                      ? "text-white hover:bg-white/10"
                      : "text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">{cafe.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      theme === "dark"
                        ? "text-blue-300 bg-blue-500/15"
                        : "text-blue-700 bg-blue-100"
                    }`}
                  >
                    Cafe
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          ref={logsContainerRef}
          className="flex flex-row sm:flex-col gap-1 overflow-x-auto sm:overflow-x-hidden sm:max-h-[180px] sm:overflow-y-auto"
        >
          {apiLogs.map((log) => (
            <div
              key={log.id}
              className={`min-w-max whitespace-nowrap px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono border shadow-sm backdrop-blur-md ${
                log.status === "pending"
                  ? theme === "dark"
                    ? "bg-yellow-500/20 text-yellow-200 border-yellow-500/30"
                    : "bg-yellow-100 text-yellow-700 border-yellow-300"
                  : ""
              }
              ${
                log.status === "success"
                  ? theme === "dark"
                    ? "bg-green-500/20 text-green-200 border-green-500/30"
                    : "bg-green-100 text-green-700 border-green-300"
                  : ""
              }
              ${
                log.status === "error"
                  ? theme === "dark"
                    ? "bg-red-500/20 text-red-200 border-red-500/30"
                    : "bg-red-100 text-red-700 border-red-300"
                  : ""
              }
              ${
                log.status === "cache-hit"
                  ? theme === "dark"
                    ? "bg-blue-500/20 text-blue-200 border-blue-500/30"
                    : "bg-blue-100 text-blue-700 border-blue-300"
                  : ""
              }
              ${
                log.status === "cache-miss"
                  ? theme === "dark"
                    ? "bg-purple-500/20 text-purple-200 border-purple-500/30"
                    : "bg-purple-100 text-purple-700 border-purple-300"
                  : ""
              }`}
            >
              {log.url} → {log.status}
              {log.time && ` (${log.time}ms)`}
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div
          className={`absolute inset-0 z-[2000] flex items-center justify-center backdrop-blur-md transition-opacity duration-500 ${
            theme === "dark" ? "bg-black/45" : "bg-white/45"
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full border-4 border-[#0ea5e9]/30 border-t-[#0ea5e9] animate-spin shadow-[0_0_30px_#0ea5e9]" />
            <p
              className={`text-sm tracking-wide animate-pulse ${
                theme === "dark" ? "text-white" : "text-slate-700"
              }`}
            >
              Finding cafes near you...
            </p>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-[1000]" />

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

function lngLatToTile(lng, lat, zoom) {
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
  const y = Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );
  return { x, y };
}

function getVisibleTiles(bounds, zoom, padding = 0) {
  const ne = lngLatToTile(bounds.getEast(), bounds.getNorth(), zoom);
  const sw = lngLatToTile(bounds.getWest(), bounds.getSouth(), zoom);

  const tiles = [];
  const maxIndex = Math.pow(2, zoom) - 1;

  const startX = Math.max(0, sw.x - padding);
  const endX = Math.min(maxIndex, ne.x + padding);
  const startY = Math.max(0, ne.y - padding);
  const endY = Math.min(maxIndex, sw.y + padding);

  for (let x = startX; x <= endX; x++) {
    for (let y = startY; y <= endY; y++) {
      tiles.push({ x, y, z: zoom });
    }
  }

  return tiles;
}