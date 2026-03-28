"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Mapliber() {
    const mapContainer = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);

    const [query, setQuery] = useState("");

    // 🚀 Fetch cafes from your API
    const fetchData = async (map) => {
        const bounds = map.getBounds();

        const url = `/api/map/get?north=${bounds.getNorth()}&south=${bounds.getSouth()}&east=${bounds.getEast()}&west=${bounds.getWest()}`;

        const res = await fetch(url);
        const data = await res.json();

        // ❌ remove old markers
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        // ✅ add new markers
        data.cafes.forEach((cafe) => {
            const marker = new maplibregl.Marker()
                .setLngLat([cafe.lng, cafe.lat])
                .setPopup(
                    new maplibregl.Popup().setHTML(`
            <div style="width:200px">
              <h4>${cafe.name}</h4>
              ${cafe.image
                            ? `<img src="${cafe.image}" width="100%" />`
                            : ""
                        }
            </div>
          `)
                )
                .addTo(map);

            markersRef.current.push(marker);
        });
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

        // load data initially
        map.on("load", () => {
            fetchData(map);
        });

        // reload on move
        map.on("moveend", () => {
            fetchData(map);
        });

        return () => map.remove();
    }, []);

    // 🔍 Search function (Nominatim)
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
            });
        }
    };

    return (
        <div style={{ position: "relative" }}>
            {/* 🔍 Search box */}
            <div
                style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    zIndex: 1,
                    background: "white",
                    padding: "8px",
                    borderRadius: "6px",
                }}
            >
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search place..."
                />
                <button onClick={handleSearch}>Search</button>
            </div>

            {/* 🗺️ Map */}
            <div
                ref={mapContainer}
                style={{ height: "100vh", width: "100%" }}
            />
        </div>
    );
}