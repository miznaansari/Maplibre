"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapComponent() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const API_KEY = process.env.NEXT_PUBLIC_OLAMAP_API_KEY;

  const styleURL = `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=${API_KEY}`;

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

    map.on("load", async () => {
      ////////////////////////////////////////////////////////////
      // 🔥 LOAD MARKER IMAGE FIRST (IMPORTANT FIX)
      ////////////////////////////////////////////////////////////
      map.loadImage(
        "https://cdn-icons-png.flaticon.com/512/684/684908.png",
        (error, image) => {
          if (error) throw error;
          if (!map.hasImage("marker-icon")) {
            map.addImage("marker-icon", image);
          }
        }
      );

      ////////////////////////////////////////////////////////////
      // 🔥 SOURCE
      ////////////////////////////////////////////////////////////
      map.addSource("cafes", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
        cluster: true,
        clusterRadius: 80,
        clusterMaxZoom: 16,
      });

      ////////////////////////////////////////////////////////////
      // 🔵 CLUSTERS
      ////////////////////////////////////////////////////////////
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "cafes",
        filter: ["has", "point_count"],
        paint: {
          "circle-radius": 18,
          "circle-color": "#3b82f6",
        },
      });

      ////////////////////////////////////////////////////////////
      // 🔢 CLUSTER COUNT
      ////////////////////////////////////////////////////////////
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "cafes",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": 12,
        },
      });

      ////////////////////////////////////////////////////////////
      // 🟢 MARKER ICON (UNCLUSTERED)
      ////////////////////////////////////////////////////////////
      map.addLayer({
        id: "unclustered-point",
        type: "symbol",
        source: "cafes",
        filter: ["!", ["has", "point_count"]],
        layout: {
          "icon-image": "marker-icon",
          "icon-size": 0.6,
          "icon-anchor": "bottom",
        },
      });

      ////////////////////////////////////////////////////////////
      // 🔥 TILE LOADER
      ////////////////////////////////////////////////////////////
      const loadTiles = async () => {
        const bounds = map.getBounds();
        const zoom = Math.floor(map.getZoom());

        const tiles = getVisibleTiles(bounds, zoom);

        const allFeatures = [];

        await Promise.all(
          tiles.map(async ({ x, y, z }) => {
            try {
              const res = await fetch(`/api/map/tile/${z}/${x}/${y}`);
              const data = await res.json();

              if (data?.features) {
                allFeatures.push(...data.features);
              }
            } catch (err) {
              console.error("Tile fetch error:", err);
            }
          })
        );

        map.getSource("cafes").setData({
          type: "FeatureCollection",
          features: allFeatures,
        });
      };

      map.on("moveend", loadTiles);
      loadTiles();

      ////////////////////////////////////////////////////////////
      // 🔥 CLICK POPUP
      ////////////////////////////////////////////////////////////
      map.on("click", "unclustered-point", (e) => {
        const feature = e.features[0];
        const [lng, lat] = feature.geometry.coordinates;

        const name = feature.properties.name;
        const image = feature.properties.image;

        const directionUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

        new maplibregl.Popup()
          .setLngLat([lng, lat])
          .setHTML(`
            <div style="width:220px;font-family:sans-serif">
              <img 
                src="${image}" 
                style="width:100%;height:120px;object-fit:cover;border-radius:8px"
              />
              <h4 style="margin:8px 0;font-size:14px">${name}</h4>
              
              <a 
                href="${directionUrl}" 
                target="_blank"
                style="
                  display:block;
                  text-align:center;
                  padding:8px;
                  background:#3b82f6;
                  color:white;
                  border-radius:8px;
                  text-decoration:none;
                  font-size:13px;
                "
              >
                📍 Get Directions
              </a>
            </div>
          `)
          .addTo(map);
      });

      ////////////////////////////////////////////////////////////
      // 🖱️ CURSOR POINTER
      ////////////////////////////////////////////////////////////
      map.on("mouseenter", "unclustered-point", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "unclustered-point", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} className="h-screen w-full" />;
}

//////////////////////////////////////////////////////////////
// 🔥 TILE UTILS
//////////////////////////////////////////////////////////////

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