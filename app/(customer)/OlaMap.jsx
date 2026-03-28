"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MoonIcon, SunIcon } from "lucide-react";

export default function OlaMap() {
  const mapRef = useRef(null);
  const mapContainer = useRef(null);

  const API_KEY = process.env.NEXT_PUBLIC_OLAMAP_API_KEY;
  const PROJECT_ID = process.env.NEXT_PUBLIC_OLAMAP_PROJECT_ID;
  const STYLE_ID = "df3386e5-cf43-47a2-b8fd-44fb0279e42d";

  const [theme, setTheme] = useState("dark");
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  // 🌙 Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  // 📍 User location
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition((pos) => {
      setUserLocation([pos.coords.longitude, pos.coords.latitude]);
    });
  }, []);

  // 🗺️ INIT MAP
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.olamaps.io/styleEditor/v1/styleEdit/styles/${STYLE_ID}/${theme}?api_key=${API_KEY}&project_id=${PROJECT_ID}`,
      center: [78.6569, 22.9734],
      zoom: 5,
    });

    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl(), "bottom-right");

    // 🔥 FETCH ON MOVE
    let timeout;
    const fetchData = async () => {
      const bounds = map.getBounds();

      const north = bounds.getNorth();
      const south = bounds.getSouth();
      const east = bounds.getEast();
      const west = bounds.getWest();
      const zoom = map.getZoom();

      try {
        const res = await fetch(
          `/api/map/get?north=${north}&south=${south}&east=${east}&west=${west}&zoom=${zoom}`
        );

        const data = await res.json();

        setCafes(data.cafes || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const handleMove = () => {
      clearTimeout(timeout);
      timeout = setTimeout(fetchData, 400);
    };

    map.on("load", fetchData);
    map.on("moveend", handleMove);
    map.on("zoomend", handleMove);

    return () => map.remove();
  }, []);

  // 🔄 THEME CHANGE (live update)
  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.setStyle(
      `https://api.olamaps.io/styleEditor/v1/styleEdit/styles/${STYLE_ID}/${theme}?api_key=${API_KEY}&project_id=${PROJECT_ID}`
    );
  }, [theme]);

  // 📍 ADD MARKERS
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // clear old markers
    document.querySelectorAll(".custom-marker").forEach((el) => el.remove());

    cafes.forEach((cafe) => {
      const el = document.createElement("div");
      el.className = "custom-marker";
      el.innerHTML = `
        <div style="background:#111;padding:4px;border-radius:10px">
          <img src="${cafe.image || ""}" style="width:36px;height:36px;border-radius:8px;object-fit:cover"/>
        </div>
      `;

      new maplibregl.Marker(el)
        .setLngLat([cafe.lng, cafe.lat])
        .addTo(map);
    });

    // 📍 user marker
    if (userLocation) {
      new maplibregl.Marker({ color: "#0ea5e9" })
        .setLngLat(userLocation)
        .addTo(map);
    }
  }, [cafes, userLocation]);

  return (
    <div className="relative w-full h-[100dvh]">

      {/* 🔥 LOADER */}
      {loading && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-md">
          <div className="w-14 h-14 border-4 border-[#0ea5e9]/30 border-t-[#0ea5e9] rounded-full animate-spin" />
        </div>
      )}

      {/* 🌙 THEME BUTTON */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111]/90 text-white border border-white/10 shadow-lg"
        >
          {theme === "dark" ? (
            <>
              <MoonIcon className="w-5 h-5 text-blue-400" />
              Dark
            </>
          ) : (
            <>
              <SunIcon className="w-5 h-5 text-yellow-400" />
              Light
            </>
          )}
        </button>
      </div>

      {/* 🗺️ MAP */}
      <div ref={mapContainer} className="w-full h-full rounded-xl" />
    </div>
  );
}