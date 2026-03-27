"use client";

import MarkerClusterGroup from "react-leaflet-cluster";
import { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import { MapPinIcon } from "@heroicons/react/24/outline";

// Fix marker issue
delete L.Icon.Default.prototype._getIconUrl;

const indiaBounds = [
  [6.5, 68],
  [37.5, 97],
];

// 🔥 FETCH ON MOVE (CORE ENGINE)
function FetchOnMove({ setCafes }) {
  const map = useMap();
  const timeoutRef = useRef(null);

  useEffect(() => {
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

        // 🔥 smooth merge (no flicker)
        setCafes((prev) => {
          const mapData = new Map(prev.map((c) => [c.id, c]));
          data.cafes.forEach((c) => mapData.set(c.id, c));
          return Array.from(mapData.values());
        });
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    const handleMove = () => {
      clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        fetchData();
      }, 400); // debounce
    };

    map.on("moveend", handleMove);
    map.on("zoomend", handleMove);

    // initial load
    fetchData();

    return () => {
      map.off("moveend", handleMove);
      map.off("zoomend", handleMove);
    };
  }, []);

  return null;
}

// 🔥 Fly animation
function FlyToLocation({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 14, { duration: 1.5 });
    }
  }, [lat, lng]);

  return null;
}

// 🔥 Zoom buttons
function ZoomControl() {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const updateZoom = () => setZoom(map.getZoom());

    map.on("zoomend", updateZoom);
    return () => map.off("zoomend", updateZoom);
  }, [map]);

  return (
    <div className="absolute bottom-6 right-4 z-[1000]">
      <div className="bg-[#111] rounded-xl shadow-lg flex flex-col overflow-hidden text-center">

        {/* 🔥 Zoom Level */}
        <div className="text-white text-xs py-1 border-b border-[#222]">
          {zoom}
        </div>

        {/* Buttons */}
        <button
          onClick={() => map.zoomIn()}
          className="px-3 py-2 text-white hover:bg-[#222]"
        >
          +
        </button>
        <button
          onClick={() => map.zoomOut()}
          className="px-3 py-2 text-white hover:bg-[#222]"
        >
          -
        </button>
      </div>
    </div>
  );
}
export default function MapComponent() {
  const [cafes, setCafes] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // 📍 user location
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {}
    );
  }, []);

  // 🔍 search
  useEffect(() => {
    if (!search) return setFiltered([]);

    const result = cafes.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );

    setFiltered(result.slice(0, 6));
  }, [search, cafes]);

  // 🔥 marker UI
  const getMarkerIcon = (image) =>
    L.divIcon({
      html: `<div style="background:#111;padding:4px;border-radius:10px">
        <img src="${image || ""}" style="width:36px;height:36px;border-radius:8px;object-fit:cover"/>
      </div>`,
      className: "",
      iconSize: [46, 50],
      iconAnchor: [23, 50],
    });

  return (
    <div className="relative w-full h-[100dvh]">

      {/* 🔍 SEARCH */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[320px]">
        <div className="bg-[#111] rounded-xl shadow-lg p-2">
          <input
            type="text"
            placeholder="Search cafes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent outline-none text-white px-2 py-2"
          />

          {filtered.length > 0 && (
            <div className="mt-2 max-h-[200px] overflow-y-auto">
              {filtered.map((cafe) => (
                <div
                  key={cafe.id}
                  onClick={() => {
                    setSelectedLocation({ lat: cafe.lat, lng: cafe.lng });
                    setSearch("");
                    setFiltered([]);
                  }}
                  className="px-2 py-2 hover:bg-[#222] rounded cursor-pointer text-sm text-white"
                >
                  {cafe.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <MapContainer
        center={[22.9734, 78.6569]}
        zoom={5}
        minZoom={5}
        zoomControl={false}
        maxBounds={indiaBounds}
        maxBoundsViscosity={1.0}
        className="h-full w-full"
      >
        {/* 🔥 CORE */}
        <FetchOnMove setCafes={setCafes} />

        {/* 📍 user */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {selectedLocation && <FlyToLocation {...selectedLocation} />}

        <ZoomControl />

        <MarkerClusterGroup chunkedLoading disableClusteringAtZoom={16}>
          {cafes.map((cafe) => (
            <Marker
              key={cafe.id}
              position={[cafe.lat, cafe.lng]}
              icon={getMarkerIcon(cafe.image)}
            >
              <Popup>
                <div className="text-white">
                  <p className="font-semibold">{cafe.name}</p>

                  <button
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/search/?api=1&query=${cafe.lat},${cafe.lng}`
                      )
                    }
                    className="mt-2 bg-yellow-400 text-black px-2 py-1 rounded"
                  >
                    Open Map
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}