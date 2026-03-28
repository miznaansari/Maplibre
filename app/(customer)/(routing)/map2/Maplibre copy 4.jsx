"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Maplibre() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const debounceRef = useRef(null);

  const [loading, setLoading] = useState(false);

  // ✅ FALLBACK IMAGE
  const FALLBACK_IMG = "/images/not-found.png";

  // ✅ CREATE MARKER (BULLETPROOF)
  const createMarkerWithImage = (imageUrl) => {
    return new Promise((resolve) => {
      const size = 60;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext("2d");

      // 🔴 pin
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(size / 2, size / 2 - 6, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(size / 2 - 10, size / 2);
      ctx.lineTo(size / 2 + 10, size / 2);
      ctx.lineTo(size / 2, size - 6);
      ctx.closePath();
      ctx.fill();

      // ⚪ white circle
      ctx.beginPath();
      ctx.arc(size / 2, size / 2 - 6, 12, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();

      const img = new Image();
      img.crossOrigin = "anonymous";

      // 🔥 SAFE LOAD FUNCTION
      const loadImage = (src) => {
        img.src = src;
      };

      // ✅ SUCCESS
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(size / 2, size / 2 - 6, 10, 0, Math.PI * 2);
        ctx.clip();

        ctx.drawImage(img, size / 2 - 8, size / 2 - 14, 16, 16);

        ctx.restore();
        resolve(canvas);
      };

      // ❌ ERROR → fallback
      img.onerror = () => {
        if (img.src !== window.location.origin + FALLBACK_IMG) {
          loadImage(FALLBACK_IMG); // retry with fallback
        } else {
          resolve(canvas); // fallback also failed → just pin
        }
      };

      // 🚀 start
      loadImage(imageUrl || FALLBACK_IMG);
    });
  };

  // 🚀 FETCH DATA
  const fetchData = async (map) => {
    if (!map) return;

    const bounds = map.getBounds();
    setLoading(true);

    try {
      const res = await fetch(
        `/api/map/get?north=${bounds.getNorth()}&south=${bounds.getSouth()}&east=${bounds.getEast()}&west=${bounds.getWest()}`
      );

      const data = await res.json();

      const geojson = {
        type: "FeatureCollection",
        features: data.cafes.map((cafe) => ({
          type: "Feature",
          properties: {
            id: cafe.id,
            name: cafe.name,
            image: cafe.image || "",
          },
          geometry: {
            type: "Point",
            coordinates: [cafe.lng, cafe.lat],
          },
        })),
      };

      const source = map.getSource("cafes");

      if (source) {
        source.setData(geojson);
      } else {
        map.addSource("cafes", {
          type: "geojson",
          data: geojson,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "cafes",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#0ea5e9",
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              10,
              30,
              50,
              40,
            ],
            "circle-opacity": 0.85,
          },
        });

        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "cafes",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-size": 13,
          },
          paint: {
            "text-color": "#fff",
          },
        });
      }

      // ✅ CREATE MARKERS SAFELY
      await Promise.all(
        data.cafes.map(async (cafe) => {
          const id = `marker-${cafe.id}`;

          if (!map.hasImage(id)) {
            const canvas = await createMarkerWithImage(cafe.image);
            map.addImage(id, canvas);
          }
        })
      );

      // ✅ ADD LAYER ONCE
      if (!map.getLayer("unclustered-point")) {
        map.addLayer({
          id: "unclustered-point",
          type: "symbol",
          source: "cafes",
          filter: ["!", ["has", "point_count"]],
          layout: {
            "icon-image": ["concat", "marker-", ["get", "id"]],
            "icon-size": 0.8,
            "icon-anchor": "bottom",
          },
        });
      }
    } catch (e) {
      console.error("MAP ERROR:", e);
    }

    setTimeout(() => setLoading(false), 200);
  };

  // 🧠 debounce
  const debouncedFetch = (map) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchData(map);
    }, 300);
  };

  // 🗺️ INIT
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          carto: {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "base",
            type: "raster",
            source: "carto",
          },
        ],
      },
      center: [77.4, 23.25],
      zoom: 5,
    });

    mapRef.current = map;

    map.on("load", () => {
      fetchData(map);

      map.on("moveend", () => {
        debouncedFetch(map);
      });
    });
  }, []);

  return (
    <div className="relative h-screen w-full">
      {/* loading bar */}
      <div
        className={`absolute top-0 left-0 h-[2px] bg-blue-500 z-20 transition-all duration-500 ${
          loading ? "w-full opacity-100" : "w-0 opacity-0"
        }`}
      />

      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
}