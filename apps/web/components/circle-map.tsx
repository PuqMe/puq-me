"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@puqme/ui";
import { BRAND_NAME } from "@puqme/config";

/* ── Time filters ── */
type TimeFilter = "24h" | "3d" | "7d" | "1m" | "3m" | "1y";
const TIME_FILTERS: { key: TimeFilter; label: string }[] = [
  { key: "24h", label: "24 Std" },
  { key: "3d",  label: "3 Tage" },
  { key: "7d",  label: "7 Tage" },
  { key: "1m",  label: "1 Monat" },
  { key: "3m",  label: "3 Monate" },
  { key: "1y",  label: "1 Jahr" },
];

/* ── Mock encounters ── */
type Encounter = {
  id: string; name: string; age: number; area: string;
  color: string; off: [number, number];
};
const ENCOUNTERS: Record<TimeFilter, Encounter[]> = {
  "24h": [
    { id: "u1", name: "Maya",  age: 29, area: "Kreuzberg",  color: "#f15bb5", off: [ 0.006,  0.005] },
    { id: "u2", name: "Noor",  age: 26, area: "Neuköln",    color: "#38bdf8", off: [-0.004,  0.007] },
  ],
  "3d": [
    { id: "u1", name: "Maya",  age: 29, area: "Kreuzberg",  color: "#f15bb5", off: [ 0.006,  0.005] },
    { id: "u2", name: "Noor",  age: 26, area: "Neuköln",    color: "#38bdf8", off: [-0.004,  0.007] },
    { id: "u3", name: "Lina",  age: 27, area: "Mitte",      color: "#fbbf24", off: [ 0.003, -0.005] },
  ],
  "7d": [
    { id: "u1", name: "Maya",  age: 29, area: "Kreuzberg",  color: "#f15bb5", off: [ 0.006,  0.005] },
    { id: "u2", name: "Noor",  age: 26, area: "Neuköln",    color: "#38bdf8", off: [-0.004,  0.007] },
    { id: "u3", name: "Lina",  age: 27, area: "Mitte",      color: "#fbbf24", off: [ 0.003, -0.005] },
    { id: "u4", name: "Alex",  age: 31, area: "Prenzlberg", color: "#4ade80", off: [-0.008, -0.003] },
  ],
  "1m": [],
  "3m": [],
  "1y": [],
};

const NAV_ITEMS = [
  { href: "/radar",   label: "radar" },
  { href: "/circle",  label: "circle" },
  { href: "/matches", label: "matches" },
  { href: "/chat",    label: "chat" },
  { href: "/profile", label: "profile" },
  { href: "/settings",label: "settings" },
];

/* ── SVG icons ── */
function RadarIcon()     { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><line x1="12" y1="12" x2="20" y2="5.5" strokeWidth="1.4"/></svg>; }
function CircleNavIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>; }
function HeartIcon()     { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 20s-6.5-4.2-8.5-8A5 5 0 0 1 12 6a5 5 0 0 1 8.5 6C18.5 15.8 12 20 12 20Z"/></svg>; }
function ChatIcon()      { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 6.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"/></svg>; }
function UserIcon({ size = 22 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>; }
function GridIcon()      { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></svg>; }
function CrosshairIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="3" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="21" y2="12"/></svg>; }
function LayersIcon()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>; }
function MapIcon()       { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2V6Zm6-2v14m6-12v14"/></svg>; }
function ListIcon()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 7h11M8 12h11M8 17h11M4 7h.01M4 12h.01M4 17h.01" strokeWidth="1.8"/></svg>; }
function EyeIcon()       { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><ellipse cx="12" cy="12" rx="8" ry="5.5"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/></svg>; }
function ClockIcon()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>; }
function ShareIcon()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>; }
function PlusIcon()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }
function SearchIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>; }
function BellIcon()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
function MenuIcon()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }

function NavIcon({ type }: { type: string }) {
  if (type === "radar")    return <RadarIcon />;
  if (type === "circle")   return <CircleNavIcon />;
  if (type === "matches")  return <HeartIcon />;
  if (type === "chat")     return <ChatIcon />;
  if (type === "profile")  return <UserIcon />;
  if (type === "settings") return <GridIcon />;
  return <RadarIcon />;
}

/* ── Dot marker HTML for Leaflet ── */
function dotMarkerHtml(color: string) {
  return `<div style="
    width:18px;height:18px;border-radius:50%;
    background:${color};
    box-shadow:0 0 14px ${color}99,0 0 24px ${color}44;
    border:2.5px solid rgba(255,255,255,.18);
  "></div>`;
}

/* ── Component ── */
export function CircleMap() {
  const mapRef    = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [ready,    setReady]    = useState(false);
  const [filter,   setFilter]   = useState<TimeFilter>("24h");
  const [location, setLocation] = useState({ lat: 52.52, lng: 13.405 });

  /* Load Leaflet CSS + JS */
  useEffect(() => {
    if (!document.getElementById("lf-css")) {
      const link = document.createElement("link");
      link.id = "lf-css"; link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
    }
    if (document.getElementById("lf-js")) { setReady(true); return; }
    const script = document.createElement("script");
    script.id  = "lf-js";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);

  /* Geolocation */
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setLocation({ lat: coords.latitude, lng: coords.longitude });
    }, undefined, { timeout: 8000, maximumAge: 60000 });
  }, []);

  /* Init Leaflet */
  useEffect(() => {
    if (!ready || !mapRef.current || mapObjRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [location.lat, location.lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19, subdomains: "abcd",
    }).addTo(map);

    /* Self marker: purple circle with user icon */
    const selfIcon = L.divIcon({
      html: `<div style="
        width:52px;height:52px;border-radius:50%;
        background:rgba(13,9,24,0.9);
        border:5px solid rgba(168,85,247,.45);
        box-shadow:0 0 28px rgba(168,85,247,.38),0 0 8px rgba(0,0,0,.7);
        display:flex;align-items:center;justify-content:center;
      "><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="1.8">
        <circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/>
      </svg></div>`,
      className: "",
      iconSize: [52, 52],
      iconAnchor: [26, 26],
    });
    L.marker([location.lat, location.lng], { icon: selfIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup("<b>📍 Du bist hier</b>");

    mapObjRef.current = map;
  }, [ready, location]);

  /* Update encounter markers when filter changes */
  useEffect(() => {
    if (!mapObjRef.current || !ready) return;
    const L = (window as any).L;
    if (!L) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const encounters = ENCOUNTERS[filter] || [];
    encounters.forEach(enc => {
      const icon = L.divIcon({
        html: dotMarkerHtml(enc.color),
        className: "",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const m = L.marker(
        [location.lat + enc.off[0], location.lng + enc.off[1]],
        { icon }
      ).addTo(mapObjRef.current)
        .bindPopup(`<b>${enc.name}, ${enc.age}</b><br><small>${enc.area}</small>`);
      markersRef.current.push(m);
    });
  }, [filter, ready, location]);

  /* Re-center on location change */
  useEffect(() => {
    if (mapObjRef.current) mapObjRef.current.setView([location.lat, location.lng], 13);
  }, [location]);

  const zoomIn  = () => mapObjRef.current?.zoomIn();
  const zoomOut = () => mapObjRef.current?.zoomOut();
  const locate  = () => mapObjRef.current?.setView([location.lat, location.lng], 14);

  const currentEncounters = ENCOUNTERS[filter] || [];

  /* ─────────────────────────────────────────────── */
  return (
    <>
      <style>{`
        .leaflet-tile-pane { filter: brightness(0.72) saturate(0.9) contrast(1.05); }
        .leaflet-attribution-flag { display:none!important; }
        .leaflet-control-attribution {
          font-size:9px!important; border-radius:4px!important;
          background:rgba(6,4,15,.7)!important; color:rgba(255,255,255,.25)!important;
          padding:2px 6px!important;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Full-screen container */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 999,
        overflow: "hidden", background: "#07050f",
      }}>

        {/* MAP – zIndex:1 creates a stacking context so Leaflet's internal
             panes (z-index:200–700) don't leak above our overlays (z-20/30) */}
        <div ref={mapRef} style={{ position: "absolute", inset: 0, zIndex: 1 }} />

        {/* Loading */}
        {!ready && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#07050f",
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                border: "2px solid #a855f7", borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite", margin: "0 auto",
              }} />
              <p style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,.4)" }}>Karte lädt…</p>
            </div>
          </div>
        )}

        {/* ── TOP HEADER ── */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
          background: "linear-gradient(180deg, rgba(20,12,42,.98) 0%, rgba(20,12,42,.85) 70%, rgba(20,12,42,0) 100%)",
          paddingTop: "max(10px, env(safe-area-inset-top))",
          paddingLeft: 12, paddingRight: 12, paddingBottom: 0,
        }}>
          {/* Row 1: Logo + title + icon buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8 }}>

            {/* Logo + title */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
              <LogoMark className="h-5 w-5 shrink-0 text-[#a855f7]" size={20} />
              <div style={{ lineHeight: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#a855f7", letterSpacing: "0.01em" }}>{BRAND_NAME}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>Circle</span>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)", marginTop: 2 }}>Deine Begegnungen</div>
              </div>
            </div>

            {/* Right icons */}
            <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
              {[
                <MapIcon key="map" />,
                /* Eye with green online dot */
                <div key="eye" style={{ position: "relative", display: "flex" }}>
                  <EyeIcon />
                  <span style={{ position: "absolute", top: -1, right: -1, width: 6, height: 6, borderRadius: "50%", background: "#22c55e", border: "1px solid #06040f" }} />
                </div>,
                <ClockIcon key="clock" />,
                <ShareIcon key="share" />,
                <PlusIcon key="plus" />,
                <SearchIcon key="search" />,
                <BellIcon key="bell" />,
                <MenuIcon key="menu" />,
              ].map((icon, i) => (
                <button key={i} style={{
                  width: 34, height: 34, borderRadius: "50%", border: "none",
                  background: "transparent", color: "rgba(255,255,255,.55)",
                  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Time filter bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            paddingBottom: 10, overflowX: "auto",
            scrollbarWidth: "none", msOverflowStyle: "none",
          }}>
            {/* List / Map view toggle */}
            <button style={{
              width: 34, height: 34, borderRadius: 10, border: "none",
              background: "transparent", color: "rgba(255,255,255,.5)",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
            }}>
              <ListIcon />
            </button>
            <button style={{
              width: 34, height: 34, borderRadius: 10, border: "none",
              background: "rgba(168,85,247,.25)", color: "#a855f7",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0,
            }}>
              <MapIcon />
            </button>

            {/* Time filters */}
            {TIME_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  borderRadius: 20, border: "none", cursor: "pointer", flexShrink: 0,
                  padding: "6px 14px", fontSize: 12, fontWeight: 600,
                  background: filter === f.key
                    ? "linear-gradient(135deg, rgba(191,132,255,.96), rgba(168,85,247,.95))"
                    : "rgba(255,255,255,.08)",
                  color: filter === f.key ? "#ffffff" : "rgba(255,255,255,.6)",
                  boxShadow: filter === f.key ? "0 4px 14px rgba(112,33,193,.4)" : "none",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── RIGHT CONTROLS ── */}
        <div style={{
          position: "absolute", right: 12, zIndex: 20,
          top: "max(110px, calc(env(safe-area-inset-top) + 100px))",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <button style={ctrlBtn}>
            <UserIcon size={16} />
            <span style={{ fontSize: 8, color: "rgba(255,255,255,.4)", lineHeight: 1 }}>{currentEncounters.length}</span>
          </button>
          <button onClick={locate} style={ctrlBtn}><CrosshairIcon /></button>
          <button onClick={zoomIn}  style={{ ...ctrlBtn, fontSize: 20, fontWeight: 300, lineHeight: 1 }}>+</button>
          <button onClick={zoomOut} style={{ ...ctrlBtn, fontSize: 20, fontWeight: 300, lineHeight: 1 }}>−</button>
        </div>

        {/* ── EBENEN (bottom-left, above nav) ── */}
        <div style={{
          position: "absolute", left: 12, zIndex: 20,
          bottom: "max(72px, calc(env(safe-area-inset-bottom) + 64px))",
        }}>
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            borderRadius: 999, border: "1px solid rgba(255,255,255,.22)",
            background: "rgba(20,12,42,.92)",
            color: "rgba(255,255,255,.80)", padding: "7px 14px",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase",
            cursor: "pointer",
          }}>
            <LayersIcon />
            EBENEN
          </button>
        </div>

        {/* ── INTERAKTIVE KARTE AKTIV (bottom-center, above nav) ── */}
        <div style={{
          position: "absolute", left: 0, right: 0, zIndex: 20,
          bottom: "max(72px, calc(env(safe-area-inset-bottom) + 64px))",
          display: "flex", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            borderRadius: 999,
            border: "1px solid rgba(168,85,247,.35)",
            background: "rgba(20,12,42,.92)",
            color: "rgba(255,255,255,.90)", padding: "7px 18px",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 8px rgba(168,85,247,.8)" }} />
            INTERAKTIVE KARTE AKTIV
          </div>
        </div>

        {/* ── BOTTOM NAV ── */}
        <nav style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 30,
          display: "flex", alignItems: "center", justifyContent: "space-around",
          background: "rgba(20,12,42,.97)",
          borderTop: "1px solid rgba(255,255,255,.22)",
          paddingTop: 8,
          paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, padding: "4px 8px", textDecoration: "none",
              color: item.href === "/circle" ? "#a855f7" : "rgba(255,255,255,.70)",
            }}>
              <NavIcon type={item.label} />
              {item.href === "/circle" && (
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#a855f7" }} />
              )}
            </Link>
          ))}
        </nav>

      </div>
    </>
  );
}

const ctrlBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: "50%",
  border: "1px solid rgba(255,255,255,.22)",
  background: "rgba(20,12,42,.92)",
  color: "rgba(255,255,255,.80)",
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  cursor: "pointer", boxShadow: "0 2px 12px rgba(0,0,0,.5)",
};
