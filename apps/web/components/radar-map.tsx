"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";

interface NearbyUser {
  id: string;
  name: string;
  age: number;
  emoji: string;
  distance: string;
  lat: number;
  lng: number;
}

interface LocationInfo {
  lat: number;
  lng: number;
  displayName: string;
}

const SIMULATED_USERS: Omit<NearbyUser, "lat" | "lng">[] = [
  { id: "u1", name: "Alex", age: 28, emoji: "😊", distance: "1.8 km" },
  { id: "u2", name: "Jordan", age: 26, emoji: "🎵", distance: "2.4 km" },
  { id: "u3", name: "Casey", age: 30, emoji: "🌟", distance: "3.1 km" },
  { id: "u4", name: "Morgan", age: 27, emoji: "🎨", distance: "3.8 km" },
  { id: "u5", name: "Riley", age: 25, emoji: "🎮", distance: "4.5 km" },
];

export function RadarMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [location, setLocation] = useState<LocationInfo>({
    lat: 48.1351,
    lng: 11.582,
    displayName: "München, Bayern",
  });
  const [selectedUser, setSelectedUser] = useState<NearbyUser | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(true);

  // Load Leaflet from CDN once
  useEffect(() => {
    if (typeof window === "undefined") return;

    const cssId = "leaflet-css";
    const jsId = "leaflet-js";

    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }

    if (document.getElementById(jsId)) {
      setMapReady(true);
      return;
    }

    const script = document.createElement("script");
    script.id = jsId;
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => setMapReady(true);
    document.head.appendChild(script);
  }, []);

  // Detect user geolocation and reverse-geocode
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=de`,
            { headers: { "Accept-Language": "de" } }
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            "Unbekannt";
          const state = data.address?.state || "";
          setLocation({ lat, lng, displayName: `${city}${state ? ", " + state : ""}` });
        } catch {
          setLocation((prev) => ({ ...prev, lat, lng }));
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false),
      { timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  // Initialize map once Leaflet is ready and we have location
  useEffect(() => {
    if (!mapReady || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Create map
    const map = L.map(mapContainerRef.current, {
      center: [location.lat, location.lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark styled OSM tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      minZoom: 1,
      subdomains: "abcd",
    }).addTo(map);

    // Compact attribution
    L.control.attribution({ prefix: false, position: "bottomright" })
      .addAttribution('© <a href="https://www.openstreetmap.org/copyright" style="color:#a855f7">OSM</a>')
      .addTo(map);

    // Zoom control bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Self marker (pulsing purple dot)
    const selfIcon = L.divIcon({
      html: `<div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(168,85,247,0.25);animation:pulse 2s infinite;"></div>
        <div style="width:18px;height:18px;border-radius:50%;background:#a855f7;border:3px solid white;box-shadow:0 0 12px rgba(168,85,247,0.8);z-index:1;"></div>
      </div>
      <style>@keyframes pulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.8);opacity:0}}</style>`,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    L.marker([location.lat, location.lng], { icon: selfIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup('<div style="color:#111;font-weight:600;font-size:12px;">📍 Du bist hier</div>');

    // Simulated nearby users as avatar markers
    const offsets = [
      [0.012, 0.018],
      [-0.009, 0.021],
      [0.017, -0.013],
      [-0.02, -0.016],
      [0.006, -0.024],
    ];

    const nearbyUsers: NearbyUser[] = SIMULATED_USERS.map((u, i) => ({
      ...u,
      lat: location.lat + (offsets[i]?.[0] ?? 0),
      lng: location.lng + (offsets[i]?.[1] ?? 0),
    }));

    nearbyUsers.forEach((u) => {
      const userIcon = L.divIcon({
        html: `<div style="width:44px;height:44px;border-radius:50%;background:rgba(18,12,34,0.88);border:2.5px solid rgba(168,85,247,0.85);box-shadow:0 4px 16px rgba(0,0,0,0.5),0 0 0 1px rgba(168,85,247,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;backdrop-filter:blur(8px);cursor:pointer;transition:transform .15s;"
          onmouseover="this.style.transform='scale(1.15)'"
          onmouseout="this.style.transform='scale(1)'"
        >${u.emoji}</div>`,
        className: "",
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      L.marker([u.lat, u.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(
          `<div style="color:#111;font-size:12px;min-width:120px;">
            <strong style="font-size:13px;">${u.name}, ${u.age}</strong><br>
            <span style="color:#888;">${u.distance} entfernt</span>
          </div>`
        );
    });

    mapInstanceRef.current = map;
  }, [mapReady, location]);

  // Update map center when location changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([location.lat, location.lng], 13);
    }
  }, [location]);

  return (
    <AppShell title="Radar" subtitle="Menschen in deiner Nähe" active="/radar">
    <div className="flex flex-col gap-3">
      {/* Map */}
      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10">
        <div ref={mapContainerRef} style={{ height: "380px", width: "100%" }} />
        {/* Loading overlay */}
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0f0a1e]">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#a855f7] border-t-transparent" />
              <p className="mt-2 text-xs text-white/50">Karte lädt…</p>
            </div>
          </div>
        )}
      </div>

      {/* Info row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="glass-card rounded-[1rem] px-3 py-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-white/50">Position</div>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-white">
            <span>📍</span>
            <span className="truncate">{locating ? "Wird ermittelt…" : location.displayName}</span>
          </div>
        </div>
        <div className="glass-card rounded-[1rem] px-3 py-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-white/50">Aktiv</div>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-white">
            <span>👥</span>
            <span>5 in der Nähe</span>
          </div>
        </div>
        <div className="glass-card rounded-[1rem] px-3 py-2.5">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-white/50">Sichtbar</div>
          <div className="mt-1 flex items-center gap-1 text-xs font-medium text-white">
            <span>🟢</span>
            <span>Online</span>
          </div>
        </div>
      </div>

      {/* Nearby user list */}
      <div className="grid gap-1.5">
        {SIMULATED_USERS.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : { ...u, lat: 0, lng: 0 })}
            className="glass-card flex items-center gap-3 rounded-[1rem] px-3 py-2.5 text-left transition hover:bg-white/8"
          >
            <span className="text-2xl">{u.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white">{u.name}, {u.age}</div>
            </div>
            <div className="text-xs font-semibold text-[#a855f7]">{u.distance}</div>
            <svg className="h-4 w-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        ))}
      </div>
    </div>
    </AppShell>
  );
}
