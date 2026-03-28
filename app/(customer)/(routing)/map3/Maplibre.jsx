"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import Supercluster from "supercluster";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Maplibre() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);

  const clusterRef = useRef(null);
  const markersRef = useRef(new Map());
  const popupRef = useRef(null);
  const debounceRef = useRef(null);

  const API_KEY = process.env.NEXT_PUBLIC_OLAMAP_API_KEY;

  const styleURL = `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=${API_KEY}`;

  // 🟢 GREEN MARKER
  const createMarkerEl = (image) => {
    const el = document.createElement("div");

    el.innerHTML = `
      <div style="
        width:48px;height:48px;border-radius:50%;
        overflow:hidden;
        border:3px solid #22c55e;
        box-shadow:0 6px 16px rgba(0,0,0,0.25);
        background:white;
      ">
        <img src="${image}" 
             onerror="this.src='/images/not-found.png'"
             style="width:100%;height:100%;object-fit:cover"/>
      </div>
    `;

    return el;
  };

  // 🔵 CLUSTER COLLAGE
  const createClusterEl = (leaves, count) => {
    const el = document.createElement("div");

    const imgs = leaves.slice(0, 4).map((l) => l.properties.image);

    el.innerHTML = `
      <div style="
        width:60px;height:60px;border-radius:50%;
        overflow:hidden;
        border:3px solid #0ea5e9;
        box-shadow:0 8px 20px rgba(0,0,0,0.3);
        display:grid;
        grid-template-columns:1fr 1fr;
        grid-template-rows:1fr 1fr;
        position:relative;
        background:white;
      ">
        ${imgs
          .map(
            (img) =>
              `<img src="${img}" style="width:100%;height:100%;object-fit:cover"/>`
          )
          .join("")}
        ${
          count > 4
            ? `<div style="
                position:absolute;
                bottom:4px;
                right:4px;
                background:#0ea5e9;
                color:white;
                font-size:11px;
                padding:2px 6px;
                border-radius:999px;
                font-weight:600;
              ">
                +${count}
              </div>`
            : ""
        }
      </div>
    `;

    return el;
  };

  // 🔁 UPDATE MARKERS
  const updateMarkers = (map) => {
    if (!clusterRef.current) return;

    const bounds = map.getBounds();
    const zoom = Math.floor(map.getZoom());

    const clusters = clusterRef.current.getClusters(
      [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ],
      zoom
    );

    const newMarkers = new Map();

    clusters.forEach((feature) => {
      const [lng, lat] = feature.geometry.coordinates;
      const props = feature.properties;

      const id = props.cluster
        ? `cluster-${props.cluster_id}`
        : `point-${props.id}`;

      let marker = markersRef.current.get(id);

      if (!marker) {
        let el;

        if (props.cluster) {
          const leaves = clusterRef.current.getLeaves(
            props.cluster_id,
            4
          );

          el = createClusterEl(leaves, props.point_count);

          el.addEventListener("click", (e) => {
            e.stopPropagation();

            const zoom = clusterRef.current.getClusterExpansionZoom(
              props.cluster_id
            );

            map.easeTo({
              center: [lng, lat],
              zoom,
              duration: 600,
            });
          });
        } else {
          el = createMarkerEl(props.image);

          el.addEventListener("click", (e) => {
            e.stopPropagation();

            if (popupRef.current) popupRef.current.remove();

            const popup = new maplibregl.Popup({ offset: 25 })
              .setLngLat([lng, lat])
              .setHTML(`
                <div style="width:200px;border-radius:12px;overflow:hidden">
                  <img src="${props.image}" 
                       style="width:100%;height:120px;object-fit:cover"/>
                  <div style="padding:10px">
                    <h4 style="margin:0;font-size:14px;font-weight:600">
                      ${props.name}
                    </h4>
                  </div>
                </div>
              `)
              .addTo(map);

            popupRef.current = popup;
          });
        }

        marker = new maplibregl.Marker({ element: el }).setLngLat([
          lng,
          lat,
        ]);
      }

      newMarkers.set(id, marker);

      if (!markersRef.current.has(id)) {
        marker.addTo(map);
      }
    });

    markersRef.current.forEach((marker, id) => {
      if (!newMarkers.has(id)) marker.remove();
    });

    markersRef.current = newMarkers;
  };

  // 📡 FETCH DATA
  const fetchData = async (map) => {
    try {
      const bounds = map.getBounds();

      console.log("API CALLED"); // debug

      const res = await fetch(
        `/api/map/get?north=${bounds.getNorth()}&south=${bounds.getSouth()}&east=${bounds.getEast()}&west=${bounds.getWest()}`
      );

      const data = await res.json();

      const points = data.cafes.map((cafe) => ({
        type: "Feature",
        properties: cafe,
        geometry: {
          type: "Point",
          coordinates: [cafe.lng, cafe.lat],
        },
      }));

      clusterRef.current = new Supercluster({
        radius: 80,
        maxZoom: 16,
      }).load(points);

      updateMarkers(map);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  // 🗺️ INIT
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

    map.on("load", () => {
      fetchData(map);

      map.on("moveend", () => {
        clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(() => {
          fetchData(map);
        }, 300);
      });
    });

    return () => {
      map.remove();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
    };
  }, []);

  return <div ref={mapContainer} className="h-screen w-full" />;
}