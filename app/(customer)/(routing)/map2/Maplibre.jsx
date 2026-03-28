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

  // 🚀 Smooth fetch (debounced)
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
        // 🔥 Update WITHOUT flicker
        source.setData(geojson);
      } else {
        // 👉 First time setup
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
        const svg = `
<svg xmlns="http://www.w3.org/2000/svg" fill="#ef4444" viewBox="0 0 24 24">
  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
</svg>
`;

const img = new Image(40, 40);
img.src = "data:image/svg+xml;base64," + btoa(svg);

img.onload = () => {
  map.addImage("hero-pin", img);

  map.addLayer({
    id: "unclustered-point",
    type: "symbol",
    source: "cafes",
    filter: ["!", ["has", "point_count"]],
    layout: {
      "icon-image": "hero-pin",
      "icon-size": 1,
      "icon-anchor": "bottom", // 🔥 important fix
    },
  });
};

//      map.addLayer({
//   id: "unclustered-point",
//   type: "circle",
//   source: "cafes",
//   filter: ["!", ["has", "point_count"]],
//   paint: {
//     "circle-color": "#ef4444", // red marker
//     "circle-radius": 8,
//     "circle-stroke-width": 2,
//     "circle-stroke-color": "#fff",
//   },
// });

        // 🎯 UX interactions
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
                duration: 400,
              });
            }
          );
        });

        map.on("click", "unclustered-point", (e) => {
          const f = e.features[0];
          const p = f.properties;

          new maplibregl.Popup({ offset: 15 })
            .setLngLat(f.geometry.coordinates)
            .setHTML(`
              <div style="width:200px;border-radius:12px;overflow:hidden">
                ${
                  p.image
                    ? `<img src="${p.image}" style="width:100%;height:110px;object-fit:cover"/>`
                    : ""
                }
                <div style="padding:10px">
                  <h4 style="margin:0;font-size:14px;font-weight:600">${p.name}</h4>
                  <p style="font-size:12px;color:#666;margin-top:4px">Cafe ☕</p>
                </div>
              </div>
            `)
            .addTo(map);
        });

        // 🖱️ Cursor smooth
        ["clusters", "unclustered-point"].forEach((layer) => {
          map.on("mouseenter", layer, () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", layer, () => {
            map.getCanvas().style.cursor = "";
          });
        });
      }
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => setLoading(false), 200); // 👈 smooth fade feel
  };

  // 🧠 Debounce wrapper
  const debouncedFetch = (map) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchData(map);
    }, 300); // 🔥 sweet spot
  };

  // 🗺️ Init map
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

  // 🔍 Search
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
        duration: 1200, // 💨 smooth animation
      });
    }
  };

  return (
    <div className="relative h-screen w-full">
      {/* 🔍 Search */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/10 shadow-xl">
          <input
            className="bg-transparent outline-none text-sm text-white placeholder:text-white/40 w-[180px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city..."
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />

          <button
            onClick={handleSearch}
            className="px-3 py-1.5 rounded-lg text-sm bg-blue-500 hover:bg-blue-600 text-white transition"
          >
            Go
          </button>
        </div>
      </div>

      {/* 🚀 TOP LOADING BAR (no blocking UI) */}
      <div
        className={`absolute top-0 left-0 h-[2px] bg-blue-500 z-20 transition-all duration-500 ${
          loading ? "w-full opacity-100" : "w-0 opacity-0"
        }`}
      />

      {/* 🗺️ Map */}
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
}