"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";

interface LocationInfo {
  lat: number;
  lng: number;
  displayName: string;
}

const NEARBY = [
  { id: "u1", emoji: "😊", name: "Alex, 28",   dist: "1.8 km", off: [ 0.012,  0.018] },
  { id: "u2", emoji: "🎵", name: "Jordan, 26", dist: "2.4 km", off: [-0.009,  0.021] },
  { id: "u3", emoji: "🌟", name: "Casey, 30",  dist: "3.1 km", off: [ 0.017, -0.013] },
  { id: "u4", emoji: "🎨", name: "Morgan, 27", dist: "3.8 km", off: [-0.020, -0.016] },
  { id: "u5", emoji: "🎮", name: "Riley, 25",  dist: "4.5 km", off: [ 0.006, -0.024] },
];

export function RadarMap() {
  const mapRef     = useRef<HTMLDivElement>(null);
  const mapObjRef  = useRef<any>(null);
  const [ready,    setReady]    = useState(false);
  const [location, setLocation] = useState<LocationInfo>({ lat: 48.1351, lng: 11.582, displayName: "München" });
  const [selected, setSelected] = useState<string | null>(null);

  /* ── Load Leaflet from CDN ── */
  useEffect(() => {
    if (!document.getElementById("lf-css")) {
      const l = document.createElement("link");
      l.id = "lf-css"; l.rel = "stylesheet";
      l.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(l);
    }
    if (document.getElementById("lf-js")) { setReady(true); return; }
    const s = document.createElement("script");
    s.id = "lf-js";
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);

  /* ── Geolocation + Nominatim ── */
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude: lat, longitude: lng } = coords;
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=de`);
        const d = await r.json();
        const city = d.address?.city || d.address?.town || d.address?.village || d.address?.county || "Hier";
        setLocation({ lat, lng, displayName: city });
      } catch { setLocation(l => ({ ...l, lat, lng })); }
    }, undefined, { timeout: 8000, maximumAge: 60000 });
  }, []);

  /* ── Init map ── */
  useEffect(() => {
    if (!ready || !mapRef.current || mapObjRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [location.lat, location.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19, minZoom: 1, subdomains: "abcd",
    }).addTo(map);

    L.control.attribution({ prefix: false, position: "bottomleft" })
      .addAttribution('© <a href="https://openstreetmap.org/copyright" style="color:#a855f7">OSM</a>')
      .addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    /* Self marker – pulsing ring */
    const selfIcon = L.divIcon({
      html: `<div style="position:relative;width:48px;height:48px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:rgba(168,85,247,.18);animation:rping 2s ease-out infinite;"></div>
        <div style="position:absolute;inset:8px;border-radius:50%;background:rgba(168,85,247,.28);animation:rping 2s ease-out infinite .4s;"></div>
        <div style="position:absolute;inset:16px;border-radius:50%;background:#a855f7;box-shadow:0 0 16px rgba(168,85,247,.9);"></div>
        <style>@keyframes rping{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.2);opacity:0}}</style>
      </div>`,
      className: "", iconSize: [48, 48], iconAnchor: [24, 24],
    });
    L.marker([location.lat, location.lng], { icon: selfIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup('<b style="color:#111">📍 Du bist hier</b>');

    /* Nearby user markers */
    NEARBY.forEach(u => {
      const icon = L.divIcon({
        html: `<div style="width:46px;height:46px;border-radius:50%;background:rgba(10,6,24,.88);border:2.5px solid rgba(168,85,247,.8);box-shadow:0 4px 20px rgba(0,0,0,.5),0 0 0 1px rgba(168,85,247,.15);display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer;">${u.emoji}</div>`,
        className: "", iconSize: [46, 46], iconAnchor: [23, 23],
      });
      L.marker([location.lat + u.off[0]!, location.lng + u.off[1]!], { icon })
        .addTo(map)
        .bindPopup(`<b style="color:#111">${u.name}</b><br><span style="color:#666">${u.dist}</span>`);
    });

    mapObjRef.current = map;
  }, [ready, location]);

  /* Re-center when location updates */
  useEffect(() => {
    if (mapObjRef.current) mapObjRef.current.setView([location.lat, location.lng], 14);
  }, [location]);

  return (
    <AppShell title="Radar" active="/radar">
      {/* Full-bleed map with radar overlay */}
      <div className="relative overflow-hidden rounded-[1.25rem]" style={{ height: "calc(100dvh - 7.5rem)" }}>
        {/* Leaflet map */}
        <div ref={mapRef} className="h-full w-full" />

        {/* Loading */}
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0614]">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#a855f7] border-t-transparent" />
              <p className="mt-2 text-xs text-white/40">Karte lädt…</p>
            </div>
          </div>
        )}

        {/* Radar ring overlay (SVG, pointer-events-none) */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 400 400"
            className="h-full w-full"
            style={{ mixBlendMode: "screen" }}
          >
            {[60, 120, 180, 240].map((r, i) => (
              <circle
                key={r}
                cx="200" cy="200" r={r}
                fill="none"
                stroke="rgba(168,85,247,0.18)"
                strokeWidth="1"
                strokeDasharray={i === 0 ? "none" : "4 6"}
              />
            ))}
            {/* Sweep line */}
            <line
              x1="200" y1="200" x2="200" y2="0"
              stroke="rgba(168,85,247,0.55)"
              strokeWidth="1.5"
              style={{
                transformOrigin: "200px 200px",
                animation: "sweep 4s linear infinite",
              }}
            />
            {/* Sweep gradient arc */}
            <defs>
              <radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(168,85,247,0.18)" />
                <stop offset="100%" stopColor="rgba(168,85,247,0)" />
              </radialGradient>
            </defs>
            <path
              d="M200 200 L200 0 A200 200 0 0 1 370 270 Z"
              fill="url(#sweepGrad)"
              style={{
                transformOrigin: "200px 200px",
                animation: "sweep 4s linear infinite",
              }}
            />
          </svg>
          <style>{`@keyframes sweep{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>

        {/* Bottom pill: location + active count */}
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="glass-card flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-white/80">
            <span className="h-2 w-2 rounded-full bg-[#a855f7]" />
            {location.displayName}
          </div>
          <div className="glass-card rounded-full px-3 py-1.5 text-xs font-semibold text-[#a855f7]">
            👥 5 in der Nähe
          </div>
        </div>

        {/* Right pill: selected user info */}
        {selected && (() => {
          const u = NEARBY.find(x => x.id === selected);
          if (!u) return null;
          return (
            <div className="pointer-events-auto absolute right-3 top-3 flex items-center gap-2 glass-card rounded-[1rem] px-3 py-2 text-sm text-white">
              <span className="text-xl">{u.emoji}</span>
              <div>
                <div className="font-semibold">{u.name}</div>
                <div className="text-[11px] text-white/60">{u.dist}</div>
              </div>
              <button onClick={() => setSelected(null)} className="ml-1 text-white/40 hover:text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          );
        })()}
      </div>
    </AppShell>
  );
}
