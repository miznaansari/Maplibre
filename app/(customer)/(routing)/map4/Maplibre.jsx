"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import Supercluster from "supercluster";
import "maplibre-gl/dist/maplibre-gl.css";
import { getTile, saveTile } from "@/lib/map/tileDB";

export default function MapComponent() {
  const mapContainer = useRef(null);
  const searchContainerRef = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const userLocationMarkerRef = useRef(null);
  const clusterRef = useRef(null);
  const markersRef = useRef(new Map());
  const allFeaturesRef = useRef([]);
  const searchQueryRef = useRef("");
  const loadTimeoutRef = useRef(null);
  const isLoadingTilesRef = useRef(false);
  const pendingReloadRef = useRef(false);
  const lastPulseIdRef = useRef(null);
  const pulseTimeoutRef = useRef(null);
  const styleReadyRef = useRef(false);
  const isMounted = useRef(false);

  const [apiLogs, setApiLogs] = useState([]);
  const [allFeaturesState, setAllFeaturesState] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOptions, setSearchOptions] = useState([]);
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const [themeMode, setThemeMode] = useState("light");
  const [zoomLevel, setZoomLevel] = useState(10);

  const API_KEY = process.env.NEXT_PUBLIC_OLAMAP_API_KEY;

  const styleURL =
    themeMode === "dark"
      ? `https://api.olamaps.io/tiles/vector/v1/styles/default-dark-standard/style.json?api_key=${API_KEY}`
      : `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=${API_KEY}`;

  const logEvent = (log) => {
    setApiLogs((prev) => {
      const newLog = {
        id: Date.now() + Math.random(),
        ...log,
      };
      return [newLog, ...prev].slice(0, 10);
    });
  };

  const pulseMarker = (marker) => {
    if (!marker) return;
    const el = marker.getElement();
    if (!el) return;

    if (pulseTimeoutRef.current) {
      window.clearTimeout(pulseTimeoutRef.current);
      pulseTimeoutRef.current = null;
    }

    el.style.transition = "none";
    el.style.opacity = "1";

    requestAnimationFrame(() => {
      el.style.transition = "opacity 180ms ease";
      el.style.opacity = "0.35";

      pulseTimeoutRef.current = window.setTimeout(() => {
        el.style.opacity = "1";
      }, 190);
    });
  };

  const normalizeSearch = (value) =>
    String(value ?? "")
      .toLowerCase()
      .trim();

  const buildSearchOptions = (features, query) => {
    const q = normalizeSearch(query);
    if (!q) return [];

    const byLabel = new Map();

    features.forEach((feature) => {
      const props = feature?.properties ?? {};
      const [lng, lat] = feature?.geometry?.coordinates ?? [];
      if (typeof lng !== "number" || typeof lat !== "number") return;

      const candidates = [
        { type: "cafe", label: props.name },
        { type: "city", label: props.city },
        { type: "state", label: props.state },
      ];

      candidates.forEach(({ type, label }) => {
        const cleanLabel = String(label ?? "").trim();
        if (!cleanLabel) return;
        if (!normalizeSearch(cleanLabel).includes(q)) return;

        const key = `${type}:${cleanLabel.toLowerCase()}`;
        if (byLabel.has(key)) return;

        byLabel.set(key, {
          id: key,
          type,
          label: cleanLabel,
          center: [lng, lat],
        });
      });
    });

    return Array.from(byLabel.values()).slice(0, 8);
  };

  const geocodeSearchQuery = async (query) => {
    const q = normalizeSearch(query);
    if (!q) return null;

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=1`;
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) return null;

      const data = await res.json();
      const first = Array.isArray(data) ? data[0] : null;
      if (!first) return null;

      const lat = Number(first.lat);
      const lng = Number(first.lon);

      if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

      return {
        center: [lng, lat],
      };
    } catch {
      return null;
    }
  };

  const createMarkerEl = (image) => {
    const el = document.createElement("div");

    el.innerHTML = `
      <div style="
        width:42px;
        height:42px;
        border-radius:10px;
        border:3px solid #22c55e;
        padding:2px;
        background:white;
        box-shadow:0 4px 12px rgba(0,0,0,0.25);
      ">
        <img 
          src="${image}" 
          style="
            width:100%;
            height:100%;
            border-radius:8px;
            object-fit:cover;
          "
        />
      </div>
    `;

    return el;
  };

  const getClusterSize = (count) => {
    if (count >= 300) return 90;
    if (count >= 200) return 75;
    if (count >= 100) return 60;
    return 45;
  };

  const createClusterEl = (leaves, count) => {
    const size = getClusterSize(count);
    const el = document.createElement("div");

    const imgs = leaves.slice(0, 4).map((l) => l.properties.image);

    el.innerHTML = `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:12px;
        background:white;
        border:3px solid #3b82f6;
        display:grid;
        grid-template-columns:1fr 1fr;
        grid-template-rows:1fr 1fr;
        overflow:hidden;
        position:relative;
        box-shadow:0 6px 20px rgba(0,0,0,0.3);
      ">
        ${imgs
        .map(
          (img) => `
          <img src="${img}" style="
            width:100%;
            height:100%;
            object-fit:cover;
          "/>
        `
        )
        .join("")}

        <div style="
          position:absolute;
          bottom:-6px;
          right:-6px;
          background:#3b82f6;
          color:white;
          font-size:11px;
          font-weight:600;
          padding:4px 6px;
          border-radius:999px;
          border:2px solid white;
        ">
          ${count}
        </div>
      </div>
    `;

    return el;
  };

  const updateMarkers = (map) => {
    if (!map || !map.isStyleLoaded()) return;
    if (!clusterRef.current) return;

    const previousMarkers = markersRef.current;

    const bounds = map.getBounds();
    const zoom = Math.floor(map.getZoom());

    const clusters = clusterRef.current.getClusters(
      [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ],
      zoom
    );

    const newMarkers = new Map();
    let lastMarkerId = null;
    let markersChanged = false;

    clusters.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      if (typeof lng !== "number" || typeof lat !== "number") return;

      const props = feature.properties;

      const id = props.cluster
        ? `cluster-${props.cluster_id}`
        : `point-${props.id}`;
      lastMarkerId = id;

      let marker = previousMarkers.get(id);
      if (!marker) {
        let el;

        if (props.cluster) {
          const leaves = clusterRef.current.getLeaves(
            props.cluster_id,
            4
          );

          el = createClusterEl(leaves, props.point_count);

          el.onclick = () => {
            const zoom =
              clusterRef.current.getClusterExpansionZoom(
                props.cluster_id
              );

            map.easeTo({ center: [lng, lat], zoom });
          };
        } else {
          el = createMarkerEl(props.image);

          el.onclick = (e) => {
            e.stopPropagation();

            if (popupRef.current) {
              popupRef.current.remove();
            }

            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

            const popup = new maplibregl.Popup({
              offset: 25,
              closeButton: false,
            })
              .setLngLat([lng, lat])
              .setHTML(`
                <div style="
                  width:220px;
                  border-radius:14px;
                  overflow:hidden;
                  font-family:system-ui;
                ">
                  <img 
                    src="${props.image}" 
                    style="width:100%;height:120px;object-fit:cover"
                  />

                  <div style="padding:10px">
                    <h4 style="
                      margin:0;
                      font-size:14px;
                      font-weight:600;
                      color:#111;
                    ">
                      ${props.name || "Cafe"}
                    </h4>

                    <a 
                      href="${googleMapsUrl}" 
                      target="_blank"
                      style="
                        display:block;
                        margin-top:8px;
                        background:#22c55e;
                        color:white;
                        text-align:center;
                        padding:8px;
                        border-radius:8px;
                        font-size:12px;
                        text-decoration:none;
                        font-weight:600;
                      "
                    >
                      🚀 Get Direction
                    </a>
                  </div>
                </div>
              `)
              .addTo(map);

            popupRef.current = popup;
          };
        }

        marker = new maplibregl.Marker({ element: el });
        marker.setLngLat([lng, lat]);
        marker.addTo(map);
        markersChanged = true;
      } else {
        marker.setLngLat([lng, lat]);
      }

      newMarkers.set(id, marker);
    });

    previousMarkers.forEach((marker, id) => {
      if (newMarkers.has(id)) return;
      marker.remove();
      markersChanged = true;
    });

    markersRef.current = newMarkers;

    if (lastMarkerId && markersChanged) {
      const lastMarker = newMarkers.get(lastMarkerId);

      if (lastMarker) {
        lastPulseIdRef.current = lastMarkerId;
        pulseMarker(lastMarker);
      }
    }
  };

  const rebuildClusters = (map, features) => {
    clusterRef.current = new Supercluster({
      radius: 80,
      maxZoom: 16,
    }).load(features);

    updateMarkers(map);
  };

  const loadTiles = async (map) => {
    if (!map || !map.isStyleLoaded()) return;
    if (isLoadingTilesRef.current) {
      pendingReloadRef.current = true;
      return;
    }

    isLoadingTilesRef.current = true;

    try {
      const bounds = map.getBounds();
      const zoom = Math.floor(map.getZoom());

      const tiles = getVisibleTiles(bounds, zoom);
      const allFeatures = [];

      await Promise.all(
        tiles.map(async ({ x, y, z }) => {
          const key = `${z}_${x}_${y}`;
          const url = `/api/map/tile/${z}/${x}/${y}`;

          const start = performance.now();

          const cached = await getTile(key);

          if (cached) {
            logEvent({
              url,
              status: "cache-hit",
              time: Math.round(performance.now() - start),
            });

            allFeatures.push(...cached.data.features);
            return;
          }

          logEvent({ url, status: "pending" });

          try {
            const res = await fetch(url);
            const data = await res.json();

            allFeatures.push(...data.features);
            await saveTile(key, data);

            logEvent({
              url,
              status: "success",
              time: Math.round(performance.now() - start),
            });
          } catch {
            logEvent({
              url,
              status: "error",
              time: Math.round(performance.now() - start),
            });
          }
        })
      );

      allFeaturesRef.current = allFeatures;
      setAllFeaturesState(allFeatures);
      rebuildClusters(map, allFeatures);
    } finally {
      isLoadingTilesRef.current = false;

      if (pendingReloadRef.current) {
        pendingReloadRef.current = false;
        window.setTimeout(() => {
          if (!mapRef.current || !map.isStyleLoaded()) return;
          void loadTiles(map);
        }, 0);
      }
    }
  };

  useEffect(() => {
    if (mapRef.current || isMounted.current) return;
    isMounted.current = true;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: styleURL,
      center: [77.391, 28.6139],
      zoom: 10,
      transformRequest: (url) => {
        if (url.includes("api.olamaps.io")) {
          return { url: `${url}&api_key=${API_KEY}` };
        }
        return { url };
      },
    });

    mapRef.current = map;
    setZoomLevel(Number(map.getZoom().toFixed(2)));

    const scheduleLoadTiles = () => {
      if (loadTimeoutRef.current) {
        window.clearTimeout(loadTimeoutRef.current);
      }

      loadTimeoutRef.current = window.setTimeout(() => {
        if (!mapRef.current || !map.isStyleLoaded()) return;
        map.once("idle", () => loadTiles(map));
      }, 80);
    };

    map.on("load", () => {
      map.once("idle", async () => {
        await loadTiles(map);
      });
    });

    map.on("moveend", () => {
      scheduleLoadTiles();
    });

    map.on("zoom", () => {
      setZoomLevel(Number(map.getZoom().toFixed(2)));
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      if (loadTimeoutRef.current) {
        window.clearTimeout(loadTimeoutRef.current);
        loadTimeoutRef.current = null;
      }

      if (pulseTimeoutRef.current) {
        window.clearTimeout(pulseTimeoutRef.current);
        pulseTimeoutRef.current = null;
      }

      pendingReloadRef.current = false;
      isLoadingTilesRef.current = false;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      allFeaturesRef.current = [];
      setAllFeaturesState([]);
      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.remove();
        userLocationMarkerRef.current = null;
      }
      clusterRef.current = null;
      popupRef.current = null;
      lastPulseIdRef.current = null;
      styleReadyRef.current = false;
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    searchQueryRef.current = searchQuery;

    setSearchOptions(buildSearchOptions(allFeaturesState, searchQuery));
  }, [searchQuery, allFeaturesState]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!styleReadyRef.current) {
      styleReadyRef.current = true;
      return;
    }

    const map = mapRef.current;
    map.setStyle(styleURL);

    map.once("idle", async () => {
      await loadTiles(map);
    });
  }, [styleURL]);

  useEffect(() => {
    const onDocClick = (event) => {
      if (!searchContainerRef.current) return;

      if (!searchContainerRef.current.contains(event.target)) {
        setShowSearchOptions(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
    };
  }, []);

  const onSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
    setShowSearchOptions(true);
  };

  const onSelectOption = (option) => {
    if (
      !option ||
      !Array.isArray(option.center) ||
      option.center.length < 2 ||
      typeof option.center[0] !== "number" ||
      typeof option.center[1] !== "number"
    ) {
      return;
    }

    setSearchQuery(option.label);
    setShowSearchOptions(false);

    if (!mapRef.current) return;

    const map = mapRef.current;
    const currentZoom = mapRef.current.getZoom();
    const targetZoom =
      option.type === "state" ? 7 : option.type === "city" ? 11 : 16;

    map.once("moveend", () => {
      if (!mapRef.current || !map.isStyleLoaded()) return;
      void loadTiles(map);
    });

    mapRef.current.flyTo({
      center: option.center,
      zoom: Math.max(currentZoom, targetZoom),
      speed: 0.9,
      curve: 1.2,
      essential: true,
    });
  };

  const onSearchClick = async () => {
    const options = buildSearchOptions(allFeaturesRef.current, searchQuery);
    setSearchOptions(options);

    if (options.length) {
      const exact = options.find(
        (option) => normalizeSearch(option.label) === normalizeSearch(searchQuery)
      );

      onSelectOption(exact || options[0]);
      return;
    }

    const geocoded = await geocodeSearchQuery(searchQuery);
    if (!geocoded || !mapRef.current) {
      setShowSearchOptions(false);
      return;
    }

    const map = mapRef.current;
    map.once("moveend", () => {
      if (!mapRef.current || !map.isStyleLoaded()) return;
      void loadTiles(map);
    });

    mapRef.current.flyTo({
      center: geocoded.center,
      zoom: Math.max(10, mapRef.current.getZoom()),
      speed: 0.9,
      curve: 1.2,
      essential: true,
    });

    setShowSearchOptions(false);
  };

  const onSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void onSearchClick();
    }
  };

  const onLocateMe = () => {
    if (!mapRef.current) return;

    if (!("geolocation" in navigator)) {
      logEvent({ url: "gps", status: "error", time: 0 });
      return;
    }

    const start = performance.now();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lng = position.coords.longitude;
        const lat = position.coords.latitude;

        if (!userLocationMarkerRef.current) {
          const userDot = document.createElement("div");
          userDot.style.width = "14px";
          userDot.style.height = "14px";
          userDot.style.borderRadius = "999px";
          userDot.style.background = "#2563eb";
          userDot.style.border = "2px solid white";
          userDot.style.boxShadow = "0 0 0 4px rgba(37,99,235,0.2)";

          userLocationMarkerRef.current = new maplibregl.Marker({
            element: userDot,
          })
            .setLngLat([lng, lat])
            .addTo(mapRef.current);
        } else {
          userLocationMarkerRef.current.setLngLat([lng, lat]);
        }

        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: Math.max(mapRef.current.getZoom(), 14),
          speed: 0.9,
          curve: 1.2,
          essential: true,
        });

        logEvent({
          url: "gps",
          status: "success",
          time: Math.round(performance.now() - start),
        });
      },
      () => {
        logEvent({
          url: "gps",
          status: "error",
          time: Math.round(performance.now() - start),
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const zoomIn = () => {
    if (!mapRef.current) return;
    mapRef.current.zoomIn({ duration: 220 });
  };

  const zoomOut = () => {
    if (!mapRef.current) return;
    mapRef.current.zoomOut({ duration: 220 });
  };

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <>
      <div className="absolute top-2 left-2 right-2 sm:right-auto z-[10020] flex flex-col gap-2 max-w-[95vw] sm:max-w-sm pointer-events-auto overflow-visible">
        <div
          ref={searchContainerRef}
          className={`relative isolate z-[30] rounded-lg border shadow-sm backdrop-blur-md p-2 ${themeMode === "dark"
              ? "bg-black/60 border-white/15"
              : "bg-white/85 border-black/10"
            }`}
        >
          <div className="flex items-center gap-2">
            <input
              value={searchQuery}
              onChange={onSearchInputChange}
              onKeyDown={onSearchKeyDown}
              onFocus={() => setShowSearchOptions(true)}
              placeholder="Search cafe, city, state"
              className={`w-full text-xs sm:text-sm px-2 py-1.5 rounded-md outline-none border ${themeMode === "dark"
                  ? "bg-black/30 border-white/20 text-white placeholder:text-white/60"
                  : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                }`}
            />
            <button
              type="button"
              onClick={onSearchClick}
              className={`text-xs sm:text-sm px-2 py-1.5 rounded-md border font-medium ${themeMode === "dark"
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-gray-100 border-gray-300 text-gray-900"
                }`}
            >
              Search
            </button>
            <button
              type="button"
              onClick={onLocateMe}
              className={`text-xs sm:text-sm px-2 py-1.5 rounded-md border font-medium ${themeMode === "dark"
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-gray-100 border-gray-300 text-gray-900"
                }`}
            >
              GPS
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className={`text-xs sm:text-sm px-2 py-1.5 rounded-md border font-medium ${themeMode === "dark"
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-gray-100 border-gray-300 text-gray-900"
                }`}
            >
              {themeMode === "dark" ? "Light" : "Dark"}
            </button>
          </div>

          {showSearchOptions && searchOptions.length > 0 && (
            <div
              className={`absolute left-2 right-2 top-[calc(100%+6px)] rounded-md border shadow-lg overflow-hidden z-[10040] ${themeMode === "dark"
                  ? "bg-black/90 border-white/15"
                  : "bg-white border-gray-200"
                }`}
            >
              {searchOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelectOption(option)}
                  className={`w-full text-left px-3 py-2 text-xs sm:text-sm border-b last:border-b-0 ${themeMode === "dark"
                      ? "text-white border-white/10 hover:bg-white/10"
                      : "text-gray-900 border-gray-100 hover:bg-gray-50"
                    }`}
                >
                  <span className="font-medium">{option.label}</span>
                  <span className="ml-2 opacity-70 uppercase text-[10px]">{option.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative z-[10] flex flex-row sm:flex-col gap-1 max-w-[95vw] sm:max-w-sm overflow-x-auto sm:overflow-x-hidden sm:max-h-[200px] sm:overflow-y-auto pb-1 sm:pb-0">
          {apiLogs.map((log) => (
            <div
              key={log.id}
              className={`min-w-max whitespace-nowrap flex items-center gap-1 px-2 py-1 rounded-md text-[10px] sm:text-xs font-mono backdrop-blur-md border shadow-sm ${themeMode === "dark"
                  ? "bg-black/60 text-white border-white/10"
                  : "bg-white/85 text-gray-800 border-black/10"
                }`}
            >
              <span
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full
        ${log.status === "pending" && "bg-yellow-500"}
        ${log.status === "success" && "bg-green-500"}
        ${log.status === "error" && "bg-red-500"}
        ${log.status === "cache-hit" && "bg-blue-500"}
        ${log.status === "cache-miss" && "bg-purple-500"}
      `}
              />

              <span className="hidden sm:inline opacity-40">→</span>

              <span
                className={`font-semibold capitalize
        ${log.status === "pending" && "text-yellow-700"}
        ${log.status === "success" && "text-green-700"}
        ${log.status === "error" && "text-red-700"}
        ${log.status === "cache-hit" && "text-blue-700"}
        ${log.status === "cache-miss" && "text-purple-700"}
      `}
              >
                {log.status.replace("-", " ")}
              </span>

              {log.time && (
                <span
                  className={`ml-auto text-[9px] sm:text-[11px] ${themeMode === "dark" ? "text-white/70" : "text-gray-500"
                    }`}
                >
                  {log.time}ms
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-[9999] flex flex-col items-end gap-2">
        <div
          className={`text-xs font-semibold px-2 py-1 rounded-md border shadow-sm ${themeMode === "dark"
              ? "bg-black/60 text-white border-white/10"
              : "bg-white/90 text-gray-900 border-black/10"
            }`}
        >
          Zoom {zoomLevel}
        </div>

        <div
          className={`flex flex-col overflow-hidden rounded-lg border shadow-md ${themeMode === "dark"
              ? "border-white/20 bg-black/60"
              : "border-black/10 bg-white/90"
            }`}
        >
          <button
            type="button"
            onClick={zoomIn}
            className={`w-10 h-10 text-lg leading-none ${themeMode === "dark"
                ? "text-white hover:bg-white/10"
                : "text-gray-900 hover:bg-gray-100"
              }`}
          >
            +
          </button>
          <button
            type="button"
            onClick={zoomOut}
            className={`w-10 h-10 text-lg leading-none border-t ${themeMode === "dark"
                ? "text-white border-white/20 hover:bg-white/10"
                : "text-gray-900 border-black/10 hover:bg-gray-100"
              }`}
          >
            -
          </button>
        </div>
      </div>

      <div ref={mapContainer} className="h-screen w-full" />
    </>
  );
}

function lngLatToTile(lng, lat, zoom) {
  const x = Math.floor(((lng + 180) / 360) * Math.pow(2, zoom));
  const y = Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) +
        1 / Math.cos((lat * Math.PI) / 180)
      ) /
      Math.PI) /
      2) *
    Math.pow(2, zoom)
  );
  return { x, y };
}

function getVisibleTiles(bounds, zoom) {
  const ne = lngLatToTile(bounds.getEast(), bounds.getNorth(), zoom);
  const sw = lngLatToTile(bounds.getWest(), bounds.getSouth(), zoom);

  const tiles = [];

  for (let x = sw.x; x <= ne.x; x++) {
    for (let y = ne.y; y <= sw.y; y++) {
      tiles.push({ x, y, z: zoom });
    }
  }

  return tiles;
}