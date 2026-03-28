"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import Supercluster from "supercluster";
import "maplibre-gl/dist/maplibre-gl.css";
import { saveCafes, getCafesInBounds } from "@/lib/indexedDB";
import { useState } from "react";
export default function Maplibre() {
  const mapContainer = useRef(null);
  const [apiLogs, setApiLogs] = useState([]);
  const mapRef = useRef(null);
  const isFetchingRef = useRef(false);
  const abortRef = useRef(null);
  const clusterRef = useRef(null);
  const markersRef = useRef(new Map());
  const popupRef = useRef(null);
  const debounceRef = useRef(null);

  const API_KEY = process.env.NEXT_PUBLIC_OLAMAP_API_KEY;

  const styleURL = `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=${API_KEY}`;

  // ---------------------------
  // 🎯 CLUSTER SIZE LOGIC
  // ---------------------------
  const getClusterSize = (count) => {
    if (count >= 120) return "xl";
    if (count >= 80) return "lg";
    if (count >= 40) return "md";
    return "sm";
  };

  const sizeMap = {
    xl: 90,
    lg: 70,
    md: 55,
    sm: 40,
  };

  // ---------------------------
  // 🟢 SINGLE MARKER
  // ---------------------------
  const createMarkerEl = (image) => {
    const el = document.createElement("div");

    el.innerHTML = `
      <div class="marker">
        <img src="${image}" onerror="this.src='/images/not-found.png'" />
      </div>
    `;

    return el;
  };

  // ---------------------------
  // 🔵 CLUSTER MARKER
  // ---------------------------
  const createClusterEl = (leaves, count) => {
    const el = document.createElement("div");

    const sizeKey = getClusterSize(count);
    const size = sizeMap[sizeKey];

    const imgs = leaves.slice(0, 4).map((l) => l.properties.image);

    el.className = "cluster-marker";
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;

    el.innerHTML = `
      <div class="cluster-inner">
        ${imgs.map((img) => `<img src="${img}" />`).join("")}
        <span class="cluster-count">${count}</span>
      </div>
    `;

    return el;
  };

  // ---------------------------
  // 🔁 UPDATE MARKERS
  // ---------------------------
  const updateMarkers = (map) => {
    if (!clusterRef.current) return;

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

    clusters.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const props = feature.properties;

      const id = props.cluster
        ? `cluster-${props.cluster_id}`
        : `point-${props.id}`;

      let marker = markersRef.current.get(id);

      if (!marker) {
        let el;

        if (props.cluster) {
          const leaves = clusterRef.current.getLeaves(
            props.cluster_id,
            4
          );

          el = createClusterEl(leaves, props.point_count);

          el.addEventListener("click", (e) => {
            e.stopPropagation();

            const zoom =
              clusterRef.current.getClusterExpansionZoom(
                props.cluster_id
              );

            map.easeTo({
              center: [lng, lat],
              zoom,
              duration: 500,
            });
          });
        } else {
          el = createMarkerEl(props.image);

          el.addEventListener("click", (e) => {
            e.stopPropagation();

            if (popupRef.current) popupRef.current.remove();

            const popup = new maplibregl.Popup({ offset: 25 })
              .setLngLat([lng, lat])
              .setHTML(`
                <div style="width:200px;border-radius:12px;overflow:hidden">
                  <img src="${props.image}" style="width:100%;height:120px;object-fit:cover"/>
                  <div style="padding:10px">
                    <h4 style="margin:0;font-size:14px;font-weight:600">
                      ${props.name}
                    </h4>
                  </div>
                </div>
              `)
              .addTo(map);

            popupRef.current = popup;
          });
        }

        marker = new maplibregl.Marker({ element: el }).setLngLat([
          lng,
          lat,
        ]);
      } else {
        // 🔥 UPDATE EXISTING MARKER (smooth animation)
        const el = marker.getElement();

        if (props.cluster) {
          const sizeKey = getClusterSize(props.point_count);
          const size = sizeMap[sizeKey];

          el.style.width = `${size}px`;
          el.style.height = `${size}px`;

          const countEl = el.querySelector(".cluster-count");
          if (countEl) countEl.innerText = props.point_count;
        }
      }

      marker.setLngLat([lng, lat]);

      newMarkers.set(id, marker);

      if (!markersRef.current.has(id)) {
        marker.addTo(map);
      }
    });

    // remove old
    markersRef.current.forEach((marker, id) => {
      if (!newMarkers.has(id)) marker.remove();
    });

    markersRef.current = newMarkers;
  };

  // ---------------------------
  // 📡 FETCH DATA
  // ---------------------------
  const fetchData = async (map) => {
  if (!map) return;

  const bounds = map.getBounds();

  const boundsObj = {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };

  // 🔥 helper to push log (FIFO)
  const pushLog = (log) => {
    setApiLogs((prev) => [
      {
        id: Date.now() + Math.random(), // ✅ always unique
        ...log,
      },
      ...prev.slice(0, 6), // limit logs
    ]);
  };

  // 🔥 1. CACHE CHECK
  const cacheStart = performance.now();
  const cached = await getCafesInBounds(boundsObj);
  const cacheTime = Math.round(performance.now() - cacheStart);

  if (cached.length > 20) {
    pushLog({
      url: "indexedDB",
      status: "cache-hit",
      time: cacheTime,
    });

    const points = cached.map((cafe) => ({
      type: "Feature",
      properties: cafe,
      geometry: {
        type: "Point",
        coordinates: [cafe.lng, cafe.lat],
      },
    }));

    clusterRef.current = new Supercluster({
      radius: 80,
      maxZoom: 16,
    }).load(points);

    updateMarkers(map);
    return;
  }

  // ❌ CACHE MISS
  pushLog({
    url: "indexedDB",
    status: "cache-miss",
    time: cacheTime,
  });

  // 🔥 2. API CALL
  const start = performance.now();

  pushLog({
    url: "api/map/get",
    status: "pending",
    time: null,
  });

  try {
    const res = await fetch(
      `/api/map/get?north=${boundsObj.north}&south=${boundsObj.south}&east=${boundsObj.east}&west=${boundsObj.west}`
    );

    const data = await res.json();

    const duration = Math.round(performance.now() - start);

    // ✅ SUCCESS (NEW ENTRY — NOT UPDATE)
    pushLog({
      url: "api/map/get",
      status: "success",
      time: duration,
    });

    // 🔥 SAVE CACHE
    await saveCafes(data.cafes);

    const points = data.cafes.map((cafe) => ({
      type: "Feature",
      properties: cafe,
      geometry: {
        type: "Point",
        coordinates: [cafe.lng, cafe.lat],
      },
    }));

    clusterRef.current = new Supercluster({
      radius: 80,
      maxZoom: 16,
    }).load(points);

    updateMarkers(map);
  } catch (err) {
    const duration = Math.round(performance.now() - start);

    // ❌ ERROR (NEW ENTRY)
    pushLog({
      url: "api/map/get",
      status: "error",
      time: duration,
    });

    console.error(err);
  }
};
  // ---------------------------
  // 🗺️ INIT MAP
  // ---------------------------
  useEffect(() => {
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

    map.on("load", () => {
      fetchData(map);

      map.on("moveend", () => {
        clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
          fetchData(map);
        }, 600);
      });

      map.on("zoom", () => {
        updateMarkers(map);
      });
    });

    return () => {
      map.remove();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
    };
  }, []);

  return (
    <>
      <div className="absolute top-4 left-4 z-[9999] flex flex-col gap-2 max-h-[300px] overflow-y-auto">
        {apiLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono
        bg-white/90 text-gray-800 backdrop-blur-md
        border border-black/10 shadow-sm"
          >
            {/* 🔹 Status Dot */}
            <span
              className={`w-2 h-2 rounded-full
          ${log.status === "pending" && "bg-yellow-500"}
          ${log.status === "success" && "bg-green-500"}
          ${log.status === "error" && "bg-red-500"}
          ${log.status === "cache-hit" && "bg-blue-500"}
          ${log.status === "cache-miss" && "bg-purple-500"}
        `}
            />

            <span className="opacity-70">{log.url}</span>
            <span className="opacity-40">→</span>

            <span
              className={`font-semibold
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
              <span className="ml-auto text-gray-500 text-[11px]">
                {log.time}ms
              </span>
            )}
          </div>
        ))}
      </div>
      <div ref={mapContainer} className="h-screen w-full" />;

    </>);
}