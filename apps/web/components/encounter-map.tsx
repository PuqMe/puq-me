"use client";

import { useEffect, useRef, useState } from "react";

interface EncounterMapProps {
  lat: number;
  lng: number;
}

export default function EncounterMap({ lat, lng }: EncounterMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  /* Load Leaflet CSS + JS via CDN (same pattern as radar-map/circle-map) */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!document.getElementById("lf-css-enc")) {
      const link = document.createElement("link");
      link.id = "lf-css-enc";
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }
    if (document.getElementById("lf-js")) {
      setReady(true);
      return;
    }
    if (document.getElementById("lf-js-enc")) {
      const check = setInterval(() => {
        if ((window as any).L) { setReady(true); clearInterval(check); }
      }, 100);
      return () => clearInterval(check);
    }
    const script = document.createElement("script");
    script.id = "lf-js-enc";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);

  /* Init map when Leaflet is ready */
  useEffect(() => {
    if (!ready || !mapRef.current || mapObjRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);

    // Add blurred encounter zone circle
    L.circle([lat, lng], {
      radius: 200,
      fillColor: "#a855f7",
      color: "#a855f7",
      weight: 1,
      opacity: 0.3,
      fillOpacity: 0.15,
    }).addTo(map);

    // Add center marker
    L.circleMarker([lat, lng], {
      radius: 6,
      fillColor: "#a855f7",
      color: "#fff",
      weight: 2,
      opacity: 0.8,
      fillOpacity: 1,
    }).addTo(map);

    mapObjRef.current = map;

    return () => {
      map.remove();
      mapObjRef.current = null;
    };
  }, [ready, lat, lng]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%", borderRadius: 12 }} />;
}
