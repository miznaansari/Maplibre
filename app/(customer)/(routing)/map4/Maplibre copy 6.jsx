"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import Supercluster from "supercluster";
import "maplibre-gl/dist/maplibre-gl.css";
import { addLog } from "@/lib/map/logDB";
import { getTile, saveTile } from "@/lib/map/tileDB";

export default function MapComponent() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const debounceRef = useRef(null);
  const clusterRef = useRef(null);
  const markersRef = useRef(new Map());
  const isMounted = useRef(false);

  const [apiLogs, setApiLogs] = useState([]);

  const API_KEY = process.env.NEXT_PUBLIC_OLAMAP_API_KEY;

  const styleURL = `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=${API_KEY}`;

  const logEvent = (log) => {
    setApiLogs((prev) => {
      const newLog = {
        id: Date.now() + Math.random(),
        ...log,
      };
      addLog(newLog).catch(() => {});
      return [newLog, ...prev].slice(0, 10);
    });
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

        marker = new maplibregl.Marker({ element: el }).setLngLat([
          lng,
          lat,
        ]);
      }

      marker.setLngLat([lng, lat]);
      newMarkers.set(id, marker);

      if (!markersRef.current.has(id)) {
        marker.addTo(map);
      }
    });

    markersRef.current.forEach((marker, id) => {
      if (!newMarkers.has(id)) marker.remove();
    });

    markersRef.current = newMarkers;
  };

  const loadTiles = async (map) => {
    if (!map || !map.isStyleLoaded()) return;

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

    clusterRef.current = new Supercluster({
      radius: 80,
      maxZoom: 16,
    }).load(allFeatures);

    updateMarkers(map);
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

    map.on("load", () => {
      map.once("idle", async () => {
        await loadTiles(map);
      });
    });

    map.on("moveend", () => {
      if (!map.isStyleLoaded()) return;
      map.once("idle", () => loadTiles(map));
    });

    map.on("zoom", () => {
      if (!map.isStyleLoaded()) return;
      requestAnimationFrame(() => updateMarkers(map));
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      clusterRef.current = null;
      popupRef.current = null;
      isMounted.current = false;
    };
  }, []);

  return (
    <>
      <div className="absolute top-2 left-2 z-[9999] flex flex-col gap-1 max-h-[200px] overflow-y-auto max-w-[85vw] sm:max-w-sm">
        {apiLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] sm:text-xs font-mono bg-white/85 text-gray-800 backdrop-blur-md border border-black/10 shadow-sm"
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
              <span className="ml-auto text-gray-500 text-[9px] sm:text-[11px]">
                {log.time}ms
              </span>
            )}
          </div>
        ))}
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