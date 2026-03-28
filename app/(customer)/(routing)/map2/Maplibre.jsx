"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Maplibre() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // 🚀 Fetch + update GeoJSON
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

      if (map.getSource("cafes")) {
        map.getSource("cafes").setData(geojson);
      } else {
        // 🔥 Add source with clustering
        map.addSource("cafes", {
          type: "geojson",
          data: geojson,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        // 🔵 Cluster circles
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

        // 🔢 Cluster count
        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "cafes",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-size": 13,
            "text-font": ["Open Sans Bold"],
          },
          paint: {
            "text-color": "#ffffff",
          },
        });

        // 🔹 Single points
        map.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "cafes",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#38bdf8",
            "circle-radius": 6,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });

        // 🔍 Click cluster → zoom
        map.on("click", "clusters", (e) => {
          const features = map.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
          });

          if (!features.length) return;

          const clusterId = features[0].properties.cluster_id;

          map.getSource("cafes").getClusterExpansionZoom(
            clusterId,
            (err, zoom) => {
              if (err) return;

              map.easeTo({
                center: features[0].geometry.coordinates,
                zoom,
                duration: 500,
              });
            }
          );
        });

        // 🔥 Popup for single point
        map.on("click", "unclustered-point", (e) => {
          const feature = e.features[0];
          const props = feature.properties;

          new maplibregl.Popup({ offset: 15 })
            .setLngLat(feature.geometry.coordinates)
            .setHTML(`
              <div style="
                width:200px;
                border-radius:12px;
                overflow:hidden;
                font-family:sans-serif;
              ">
                ${
                  props.image
                    ? `<img src="${props.image}" style="width:100%; height:110px; object-fit:cover;" />`
                    : ""
                }
                <div style="padding:10px">
                  <h4 style="margin:0;font-size:14px;font-weight:600">
                    ${props.name}
                  </h4>
                  <p style="font-size:12px;color:#666;margin-top:4px">
                    Cafe · Trending ☕
                  </p>
                </div>
              </div>
            `)
            .addTo(map);
        });

        // 🖱️ Cursor UX
        map.on("mouseenter", "clusters", () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "clusters", () => {
          map.getCanvas().style.cursor = "";
        });

        map.on("mouseenter", "unclustered-point", () => {
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", "unclustered-point", () => {
          map.getCanvas().style.cursor = "";
        });
      }
    } catch (err) {
      console.error("API error:", err);
    }

    setLoading(false);
  };

  // 🗺️ Init map
  useEffect(() => {
    if (mapRef.current) return;

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

        // 🔥 fetch on move (debounced feel)
        map.on("moveend", () => {
          fetchData(map);
        });
      });
    };

    const interval = setInterval(() => {
      if (!mapContainer.current) return;
      const rect = mapContainer.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        clearInterval(interval);
        initMap();
      }
    }, 100);

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
        <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-[#0f0f0f]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
          <input
            className="bg-transparent outline-none text-sm text-white placeholder:text-white/40 w-[180px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city..."
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />

          <button
            onClick={handleSearch}
            className="px-3 py-1.5 rounded-lg text-sm bg-blue-500 hover:bg-blue-600 text-white"
          >
            Go
          </button>
        </div>
      </div>

      {/* 🧊 Loader */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* 🗺️ Map */}
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
}