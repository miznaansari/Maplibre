"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const OlaLibre = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  const API_KEY = process.env.NEXT_PUBLIC_OLAMAP_API_KEY;

  useEffect(() => {
    if (mapRef.current) return;

    const styleURL = `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=${API_KEY}`;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleURL,
      center: [77.3910, 28.6139],
      zoom: 10,

      // 🔥 CRITICAL FIX
      transformRequest: (url, resourceType) => {
        // attach API key to ALL Ola requests
        if (url.includes("api.olamaps.io")) {
          const separator = url.includes("?") ? "&" : "?";
          return {
            url: `${url}${separator}api_key=${API_KEY}`,
          };
        }
        return { url };
      },
    });

    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => mapRef.current?.remove();
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
};

export default OlaLibre;