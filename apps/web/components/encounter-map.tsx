"use client";

import { useEffect, useRef } from "react";

interface EncounterMapProps {
  lat: number;
  lng: number;
}

export default function EncounterMap({ lat, lng }: EncounterMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadMap = async () => {
      const L = await import("leaflet" as any);
      const { tileLayer, latLng, map, circleMarker } = L.default;

      if (!mapRef.current) return;

      // Create map if not already created
      if (!mapObjRef.current) {
        mapObjRef.current = map(mapRef.current).setView([lat, lng], 13);

        tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 20,
        }).addTo(mapObjRef.current);
      }

      // Add blurred encounter zone circle
      circleMarker(latLng(lat, lng), {
        radius: 45,
        fillColor: "#a855f7",
        color: "#a855f7",
        weight: 1,
        opacity: 0.3,
        fillOpacity: 0.15,
      }).addTo(mapObjRef.current);

      // Add center marker
      circleMarker(latLng(lat, lng), {
        radius: 6,
        fillColor: "#a855f7",
        color: "#fff",
        weight: 2,
        opacity: 0.8,
        fillOpacity: 1,
      }).addTo(mapObjRef.current);
    };

    loadMap();

    return () => {
      if (mapObjRef.current) {
        mapObjRef.current.remove();
        mapObjRef.current = null;
      }
    };
  }, [lat, lng]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}
