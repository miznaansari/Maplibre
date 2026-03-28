"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Maplibre() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const debounceRef = useRef(null);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const API_KEY = process.env.NEXT_PUBLIC_OLAMAP_API_KEY;

  // ✅ Ola style URL
  const styleURL = `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=${API_KEY}`;

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
        source.setData(geojson); // 🔥 no flicker
      } else {
        // ✅ SOURCE
        map.addSource("cafes", {
          type: "geojson",
          data: geojson,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        // ✅ CLUSTER CIRCLE
        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "cafes",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#0ea5e9",
            "circle-opacity": 0.25, // 🔥 key fix (transparent)
            "circle-stroke-width": 2,
            "circle-stroke-color": "#0ea5e9",
            "circle-radius": [
              "step",
              ["get", "point_count"],
              16,
              10,
              22,
              50,
              28,
            ],
          },
        });

        // ✅ COUNT
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
            "text-color": "#000000",
          },
        });

        // 🔥 CUSTOM PIN (FIXED)
        const svg = `
<svg xmlns="http://www.w3.org/2000/svg" fill="#ef4444" viewBox="0 0 24 24">
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
</svg>
`;

        const img = new Image(40, 40);
        img.src = "data:image/svg+xml;base64," + btoa(svg);

        img.onload = () => {
          if (!map.hasImage("hero-pin")) {
            map.addImage("hero-pin", img);
          }

          map.addLayer({
            id: "unclustered-point",
            type: "symbol",
            source: "cafes",
            filter: ["!", ["has", "point_count"]],
            layout: {
              "icon-image": "hero-pin",
              "icon-size": 1,
              "icon-anchor": "bottom",
              "icon-allow-overlap": true, // 🔥 important fix
            },
          });
        };

        // 🎯 CLICK CLUSTER
        map.on("click", "clusters", (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
          });

          const clusterId = features[0].properties.cluster_id;

          map.getSource("cafes").getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
              if (err) return;
              map.easeTo({
                center: features[0].geometry.coordinates,
                zoom,
              });
            }
          );
        });

        // 🎯 POPUP
        map.on("click", "unclustered-point", (e) => {
          const f = e.features[0];
          const p = f.properties;
          const [lng, lat] = f.geometry.coordinates;

          new maplibregl.Popup()
            .setLngLat([lng, lat])
            .setHTML(`
              <div style="width:200px;border-radius:12px;overflow:hidden">
                ${p.image
                ? `<img src="${p.image}" style="width:100%;height:110px;object-fit:cover"/>`
                : ""
              }
                <div style="padding:10px">
                  <h4 style="margin:0;font-size:14px;font-weight:600">${p.name}</h4>
                  <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank"
                  style="display:block;margin-top:8px;background:#2563eb;color:#fff;padding:6px;border-radius:6px;font-size:12px;text-align:center;">
                  Directions
                  </a>
                </div>
              </div>
            `)
            .addTo(map);
        });

        // 🖱️ CURSOR
        ["clusters", "unclustered-point"].forEach((layer) => {
          map.on("mouseenter", layer, () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", layer, () => {
            map.getCanvas().style.cursor = "";
          });
        });
      }
    } catch (err) {
      console.error(err);
    }

    setTimeout(() => setLoading(false), 200);
  };

  // 🧠 DEBOUNCE
  const debouncedFetch = (map) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchData(map);
    }, 300);
  };

  // 🗺️ MAP INIT
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: styleURL,

      center: [77.391, 28.6139],
      zoom: 10,

      // 🔥 MOST IMPORTANT (OLA FIX)
      transformRequest: (url) => {
        if (url.includes("api.olamaps.io")) {
          const sep = url.includes("?") ? "&" : "?";
          return { url: `${url}${sep}api_key=${API_KEY}` };
        }
        return { url };
      },
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    mapRef.current = map;

    map.on("load", () => {
      fetchData(map);

      map.on("moveend", () => {
        debouncedFetch(map);
      });
    });
  }, []);

  // 🔍 SEARCH
  const handleSearch = async () => {
    if (!query) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
    );
    const data = await res.json();

    if (data[0]) {
      mapRef.current.flyTo({
        center: [parseFloat(data[0].lon), parseFloat(data[0].lat)],
        zoom: 14,
      });
    }
  };

  return (
    <div className="relative h-screen w-full">
      {/* SEARCH */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex gap-2 px-3 py-2 rounded-xl bg-black/70 backdrop-blur border border-white/10">
          <input
            className="bg-transparent outline-none text-sm text-white w-[180px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-3 py-1 rounded bg-blue-500 text-white"
          >
            Go
          </button>
        </div>
      </div>

      {/* LOADING BAR */}
      <div
        className={`absolute top-0 left-0 h-[2px] bg-blue-500 z-20 transition-all ${loading ? "w-full" : "w-0"
          }`}
      />

      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
}