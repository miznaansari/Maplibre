"use client";

import MarkerClusterGroup from "react-leaflet-cluster";
import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMapEvents,
    useMap,
} from "react-leaflet";

import L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import { MapPinIcon } from "@heroicons/react/24/outline";

// Fix default marker issue
delete L.Icon.Default.prototype._getIconUrl;

// 🇮🇳 India bounds
const indiaBounds = [
    [6.5, 68],
    [37.5, 97],
];

// 🔥 Cluster UI

// const createClusterCustomIcon = (cluster) => {
//     const count = cluster.getChildCount();

//     return L.divIcon({
//         html: `
//       <div style="display:flex;align-items:center;justify-content:center;">
//         <div style="
//           background: rgba(20,20,20,0.9);
//           border-radius: 14px;
//           padding: 6px;
//           box-shadow: 0 8px 25px rgba(0,0,0,0.6);
//         ">
//           <div style="
//             width: 42px;
//             height: 42px;
//             border-radius: 10px;
//             background: #0ea5e9;
//             display:flex;
//             align-items:center;
//             justify-content:center;
//             font-weight:600;
//             color:white;
//           ">
//             ${count}
//           </div>
//         </div>
//       </div>
//     `,
//         className: "",
//         iconSize: L.point(50, 50, true),
//     });
// };

// 🔥 Track zoom
function ZoomTracker({ setZoom }) {
    useMapEvents({
        zoomend: (e) => {
            setZoom(e.target.getZoom());
        },
    });
    return null;
}

// 🔥 Fly to selected location
function FlyToLocation({ lat, lng }) {
    const map = useMap();

    useEffect(() => {
        if (lat && lng) {
            map.flyTo([lat, lng], 14, {
                duration: 1.5,
            });
        }
    }, [lat, lng]);

    return null;
}

// 🔥 Custom Zoom Control UI
function ZoomControl() {
    const map = useMap();

    return (
        <div className="absolute bottom-6 right-4 z-[1000]">
            <div className="bg-[#111] rounded-xl shadow-lg flex flex-col overflow-hidden">
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
    const [zoom, setZoom] = useState(5);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    useEffect(() => {
        // ❗ Must be HTTPS (important for iOS Safari)
        if (location.protocol !== "https:") {
            setError("Geolocation requires HTTPS");
            setLoading(false);
            return;
        }

        if (!navigator.geolocation) {
            setError("Geolocation not supported");
            setLoading(false);
            return;
        }

        const options = {
            enableHighAccuracy: true, // better GPS (mobile)
            timeout: 10000, // 10 sec
            maximumAge: 0,
        };

        const success = (position) => {
            setUserLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            });
            setLoading(false);
        };

        const failure = (err) => {
            console.log("Location error:", err);

            switch (err.code) {
                case 1:
                    setError("Permission denied");
                    break;
                case 2:
                    setError("Position unavailable");
                    break;
                case 3:
                    setError("Timeout");
                    break;
                default:
                    setError("Unknown error");
            }

            setLoading(false);
        };

        // ✅ iOS Safari requires user interaction sometimes
        navigator.geolocation.getCurrentPosition(success, failure, options);
    }, []);
    // 🔍 Search states
    const [search, setSearch] = useState("");
    const [filtered, setFiltered] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);

    useEffect(() => {
        fetch("/api/map/get")
            .then((res) => res.json())
            .then((data) => setCafes(data.cafes || []))
            .catch(() => setCafes([]));
    }, []);

    // 🔍 Search filter
    useEffect(() => {
        if (!search) {
            setFiltered([]);
            return;
        }

        const result = cafes.filter((cafe) =>
            cafe.name.toLowerCase().includes(search.toLowerCase())
        );

        setFiltered(result.slice(0, 6));
    }, [search, cafes]);

    // 🔥 Dynamic marker
    const getMarkerIcon = (image, zoom) => {
        const size =
            zoom <= 5 ? 60 :
                zoom <= 7 ? 50 :
                    zoom <= 10 ? 40 :
                        32;

        return L.divIcon({
            html: `
        <div style="display:flex;align-items:center;justify-content:center;">
          <div style="
            background: rgba(20,20,20,0.9);
            border-radius: 12px;
            padding: 4px;
            box-shadow: 0 6px 20px rgba(0,0,0,0.6);
          ">
            <img 
              src="${image || "https://cg.a2deats.com/variants/360/gallery_9f70a17b-a215-46d1-85cc-2420fa58db4c.jpeg"}"
              onerror="this.src='https://cg.a2deats.com/variants/360/gallery_9f70a17b-a215-46d1-85cc-2420fa58db4c.jpeg'"
              style="
                width: ${size}px;
                height: ${size}px;
                border-radius: 8px;
                object-fit: cover;
              "
            />
          </div>
        </div>
      `,
            className: "",
            iconSize: [size + 10, size + 15],
            iconAnchor: [(size + 10) / 2, size + 15],
        });
    };

    return (
       <div className="relative w-full h-[100dvh]">

            {/* 🔍 SEARCH BAR */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[320px] ">
                <div className="bg-[#111] rounded-xl  shadow-lg p-0">

                    <input
                        type="text"
                        placeholder="Search cafes..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-transparent outline-none border border-gray-200  text-white px-2 p-2 rounded-xl text-base"
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
                zoomControl={false}   // ✅ ADD THIS LINE
                maxBounds={indiaBounds}
                maxBoundsViscosity={1.0}
                className="h-full w-full"
            >

                {userLocation && (
                    <Marker
                        position={[userLocation.lat, userLocation.lng]}
                        icon={L.divIcon({
                            html: `
        <div style="
          width:18px;
          height:18px;
          background:#0ea5e9;
          border-radius:50%;
          border:3px solid white;
          box-shadow:0 0 10px #0ea5e9;
        "></div>
      `,
                            className: "",
                            iconSize: [18, 18],
                        })}
                    >
                        <Popup>You are here 📍</Popup>
                    </Marker>
                )}

          <TileLayer
  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
  attribution="&copy; OpenStreetMap &copy; Carto"
/>

                {/* 🔥 Zoom tracker */}
                <ZoomTracker setZoom={setZoom} />

                {/* 🔥 Fly */}
                {selectedLocation && (
                    <FlyToLocation
                        lat={selectedLocation.lat}
                        lng={selectedLocation.lng}
                    />
                )}

                {/* 🔥 Zoom buttons */}
                <ZoomControl />

                <MarkerClusterGroup
                    chunkedLoading
                    maxClusterRadius={80}
                    disableClusteringAtZoom={8}
                // iconCreateFunction={createClusterCustomIcon}
                >
                    {cafes.map((cafe) => (
                        <Marker
                            key={cafe.id}
                            position={[cafe.lat, cafe.lng]}
                            icon={getMarkerIcon(cafe.image, zoom)}
                        >
                            <Popup>
                                <div className="w-[220px] bg-[#0b0b0f] text-white rounded-2xl p-3 shadow-2xl">

                                    {/* Title */}
                                    <h3 className="font-semibold text-sm mb-2">
                                        {cafe.name}
                                    </h3>
                                    {cafe.image && (
                                        <img
                                            src={cafe.image}
                                            onError={(e) => {
                                                e.target.src =
                                                    "https://cg.a2deats.com/variants/360/gallery_9f70a17b-a215-46d1-85cc-2420fa58db4c.jpeg";
                                            }}
                                            className="w-full h-[100px] my-4 object-cover mt-2 rounded-lg"
                                        />
                                    )}
                                    {/* 📍 Open in Google Maps */}
                                    <button
                                        onClick={() => {
                                            const destination = `${cafe.lat},${cafe.lng}`;

                                            if (userLocation) {
                                                const origin = `${userLocation.lat},${userLocation.lng}`;

                                                window.open(
                                                    `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
                                                    "_blank"
                                                );
                                            } else {
                                                window.open(
                                                    `https://www.google.com/maps/search/?api=1&query=${destination}`,
                                                    "_blank"
                                                );
                                            }
                                        }}
                                        className="w-full flex items-center justify-center gap-2 bg-yellow-400 text-black font-medium py-2 rounded-xl text-sm hover:bg-yellow-300 transition"
                                    >

                                        <MapPinIcon className="w-4 h-4" />
                                        Open in Google Maps
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