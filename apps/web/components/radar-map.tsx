"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@puqme/ui";
import { BRAND_NAME } from "@puqme/config";
import { useLanguage } from "@/lib/i18n";

interface LocationInfo {
  lat: number;
  lng: number;
  displayName: string;
}

interface NearbyPerson {
  id: string;
  initials: string;
  color: string;
  name: string;
  dist: string;
  off: [number, number];
  lastSeen: number; // timestamp in milliseconds
}

const NEARBY: NearbyPerson[] = [
  { id: "u1", initials: "AX", color: "#e879f9", name: "Alex, 28",   dist: "1.8 km", off: [ 0.012,  0.018], lastSeen: Date.now() - 2 * 60000 },
  { id: "u2", initials: "JD", color: "#38bdf8", name: "Jordan, 26", dist: "2.4 km", off: [-0.009,  0.021], lastSeen: Date.now() - 4 * 60000 },
  { id: "u3", initials: "CS", color: "#4ade80", name: "Casey, 30",  dist: "3.1 km", off: [ 0.017, -0.013], lastSeen: Date.now() - 8 * 60000 },
  { id: "u4", initials: "MG", color: "#fb923c", name: "Morgan, 27", dist: "3.8 km", off: [-0.020, -0.016], lastSeen: Date.now() - 12 * 60000 },
  { id: "u5", initials: "RI", color: "#f472b6", name: "Riley, 25",  dist: "4.5 km", off: [ 0.006, -0.024], lastSeen: Date.now() - 20 * 60000 },
];

const NAV_ITEMS = [
  { href: "/nearby",  label: "nearby" },
  { href: "/circle",  label: "circle" },
  { href: "/matches", label: "matches" },
  { href: "/chat",    label: "chat" },
  { href: "/profile", label: "profile" },
  { href: "/settings",label: "settings" },
];

/* ── Tile layer configs ── */
const TILE_LAYERS: Record<string, { url: string; label: string }> = {
  dunkel:   { url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",  label: "Dark" },
  standard: { url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", label: "Standard" },
  gebaeude: { url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", label: "Light" },
  oepnv:    { url: "https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38", label: "Transit" },
};

/* ── SVG Icons ── */
function NearbyIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><line x1="12" y1="12" x2="20" y2="5.5" strokeWidth="1.4"/></svg>; }
function CircleIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>; }
function HeartIcon()     { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 20s-6.5-4.2-8.5-8A5 5 0 0 1 12 6a5 5 0 0 1 8.5 6C18.5 15.8 12 20 12 20Z"/></svg>; }
function ChatIcon()      { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 6.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"/></svg>; }
function UserIcon({ size = 22 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>; }
function GridIcon()      { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></svg>; }
function CrosshairIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="3" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="21" y2="12"/></svg>; }
function LayersIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>; }
function SearchIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>; }
function BellIcon()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
function MenuIcon()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
function CloseIcon()     { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function RadarIcon()     { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16" strokeLinecap="round"/></svg>; }
function EyeIcon()       { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 5C7 5 2.73 8.11 1 12.46c1.73 4.35 6 7.54 11 7.54s9.27-3.19 11-7.54C21.27 8.11 17 5 12 5Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"/><circle cx="12" cy="12" r="2.5"/></svg>; }

function NavIcon({ type }: { type: string }) {
  if (type === "nearby")  return <NearbyIcon />;
  if (type === "circle")  return <CircleIcon />;
  if (type === "matches") return <HeartIcon />;
  if (type === "chat")    return <ChatIcon />;
  if (type === "profile") return <UserIcon />;
  if (type === "settings")return <GridIcon />;
  return <NearbyIcon />;
}

/* ── Avatar HTML for Leaflet divIcon ── */
function avatarHtml(initials: string, color: string, size: number, online: boolean, opacity: number = 1) {
  const fs   = Math.round(size * 0.32);
  const dot  = Math.round(size * 0.22);
  const off  = Math.round(size * 0.04);
  const opacityStyle = opacity < 1 ? `opacity:${opacity};` : "";
  return `<div style="position:relative;width:${size}px;height:${size}px;${opacityStyle}">
    <div style="position:absolute;inset:0;border-radius:50%;
      background:linear-gradient(135deg,${color}66,${color}33);
      border:2.5px solid #7c3aed;
      box-shadow:0 0 0 1px rgba(124,58,237,.35),0 4px 16px rgba(0,0,0,.7);
      display:flex;align-items:center;justify-content:center;
      font-size:${fs}px;font-weight:700;color:#fff;
      font-family:system-ui,sans-serif;letter-spacing:.03em;">${initials}</div>
    ${online ? `<div style="position:absolute;bottom:${off}px;right:${off}px;
      width:${dot}px;height:${dot}px;border-radius:50%;
      background:#22c55e;border:2px solid #06040f;"></div>` : ""}
  </div>`;
}

/* ── Component ── */
export function RadarMap() {
  const { t } = useLanguage();
  const mapRef     = useRef<HTMLDivElement>(null);
  const mapObjRef  = useRef<any>(null);
  const tileRef    = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const selfMarkerRef = useRef<any>(null);
  const heatmapRef = useRef<any[]>([]);
  const ringsRef = useRef<any[]>([]);
  const [ready,    setReady]    = useState(false);
  const [location, setLocation] = useState<LocationInfo>({ lat: 48.1351, lng: 11.582, displayName: "München" });
  const [showSearch,  setShowSearch]  = useState(false);
  const [showLayers,  setShowLayers]  = useState(false);
  const [showMenu,    setShowMenu]    = useState(false);
  const [showNotifToast, setShowNotifToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [tileKey, setTileKey] = useState<string>("dunkel");
  const [radarViewsCount, setRadarViewsCount] = useState<number>(Math.floor(Math.random() * 16) + 5);
  const [isScanning, setIsScanning] = useState(false);

  /* Load Leaflet CSS + JS from CDN */
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
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude: lat, longitude: lng } = coords;
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=de`);
        const d = await r.json();
        const city = d.address?.city || d.address?.town || d.address?.village || "Hier";
        setLocation({ lat, lng, displayName: city });
      } catch { setLocation(l => ({ ...l, lat, lng })); }
    }, undefined, { timeout: 8000, maximumAge: 60000 });
  }, []);

  /* Init Leaflet map — only depends on ready */
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

    const tile = L.tileLayer(TILE_LAYERS[tileKey]!.url, {
      maxZoom: 19, subdomains: "abcd",
    }).addTo(map);
    tileRef.current = tile;

    mapObjRef.current = map;
  }, [ready]);

  /* Place / update markers whenever location changes */
  useEffect(() => {
    if (!mapObjRef.current) return;
    const L = (window as any).L;
    if (!L) return;
    const map = mapObjRef.current;

    // Remove old markers
    if (selfMarkerRef.current) { selfMarkerRef.current.remove(); }
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Remove old heatmap zones
    heatmapRef.current.forEach(h => h.remove());
    heatmapRef.current = [];

    // Remove old rings
    ringsRef.current.forEach(r => r.remove());
    ringsRef.current = [];

    // Self marker with radar sweep animation
    const selfIcon = L.divIcon({
      html: `<div style="position:relative;width:64px;height:64px;">
        ${avatarHtml("Du", "#a855f7", 64, true)}
        <div class="radar-sweep" style="width:140px;height:140px;left:-38px;top:-38px;"></div>
      </div>`,
      className: "",
      iconSize: [64,64],
      iconAnchor: [32,32],
    });

    selfMarkerRef.current = L.marker([location.lat, location.lng], {
      icon: selfIcon,
      zIndexOffset: 1000,
    }).addTo(map).bindPopup("<div style='padding:8px;color:#fff;'><b>You are here</b></div>");

    // Add concentric radar rings (500m, 1km, 2km, 4km) — outlines only
    const ringDistances = [500, 1000, 2000, 4000];
    const ringOpacities = [0.25, 0.15, 0.08, 0.04];
    ringDistances.forEach((dist, idx) => {
      const ring = L.circle([location.lat, location.lng], {
        radius: dist,
        color: `rgba(168,85,247,${ringOpacities[idx]})`,
        fill: false,
        weight: 1,
        dashArray: "6,6",
        interactive: false,
      }).addTo(map);
      ringsRef.current.push(ring);
    });

    // Add heatmap zones (activity hotspots) — subtle glow areas
    const heatmapZones = [
      { lat: location.lat + 0.005, lng: location.lng + 0.008, opacity: 0.045 },
      { lat: location.lat - 0.006, lng: location.lng - 0.005, opacity: 0.035 },
      { lat: location.lat + 0.003, lng: location.lng - 0.010, opacity: 0.04 },
    ];

    heatmapZones.forEach(zone => {
      const heatZone = L.circle([zone.lat, zone.lng], {
        radius: 500,
        color: "transparent",
        fillColor: "#a855f7",
        fillOpacity: zone.opacity,
        weight: 0,
      }).addTo(map);
      heatmapRef.current.push(heatZone);
    });

    // Nearby markers
    NEARBY.forEach(u => {
      const minutesAgo = Math.floor((Date.now() - u.lastSeen) / 60000);
      let markerOpacity = 1;
      if (minutesAgo > 15) {
        markerOpacity = 0.3;
      } else if (minutesAgo > 5) {
        markerOpacity = 0.5;
      }

      const isOnline = Math.random() > 0.3;
      const markerIcon = L.divIcon({
        html: avatarHtml(u.initials, u.color, 46, isOnline, markerOpacity),
        className: "",
        iconSize: [46,46],
        iconAnchor: [23,23],
      });

      const marker = L.marker([location.lat + u.off[0]!, location.lng + u.off[1]!], {
        icon: markerIcon,
      }).addTo(map);

      const popupContent = createMiniProfilePopup(u, isOnline);
      marker.bindPopup(popupContent, { maxWidth: 280, className: "custom-popup" });

      markersRef.current.push(marker);
    });

    // Pan map to new location
    map.setView([location.lat, location.lng], 14);
  }, [location, ready]);

  /* Switch tile layer */
  useEffect(() => {
    if (!mapObjRef.current || !tileRef.current) return;
    const L = (window as any).L;
    if (!L) return;
    tileRef.current.remove();
    tileRef.current = L.tileLayer(TILE_LAYERS[tileKey]!.url, {
      maxZoom: 19, subdomains: "abcd",
    }).addTo(mapObjRef.current);
  }, [tileKey]);

  const zoomIn  = () => mapObjRef.current?.zoomIn();
  const zoomOut = () => mapObjRef.current?.zoomOut();
  const locate  = () => mapObjRef.current?.setView([location.lat, location.lng], 15);

  /* Search location via Nominatim */
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&accept-language=de`);
      const d = await r.json();
      if (d[0]) {
        const lat = parseFloat(d[0].lat);
        const lng = parseFloat(d[0].lon);
        const name = d[0].display_name?.split(",")[0] || searchQuery;
        setLocation({ lat, lng, displayName: name });
      }
    } catch { /* noop */ }
    setShowSearch(false);
    setSearchQuery("");
  };

  /* Mini profile popup on marker click */
  const createMiniProfilePopup = (person: NearbyPerson, isOnline: boolean) => {
    const minutesAgo = Math.floor((Date.now() - person.lastSeen) / 60000);
    const onlineText = isOnline ? `<span style="color:#22c55e;font-weight:700;">Online</span>` : `<span style="color:rgba(255,255,255,.5);">Seen ${minutesAgo}m ago</span>`;

    return `
      <div style="
        width:240px;
        background:rgba(12,8,28,.95);
        border:1px solid rgba(168,85,247,.3);
        border-radius:16px;
        padding:16px;
        font-family:system-ui,sans-serif;
        backdrop-filter:blur(12px);
      ">
        <div style="display:flex;gap:12px;margin-bottom:12px;">
          <div style="
            width:48px;
            height:48px;
            border-radius:50%;
            background:linear-gradient(135deg,${person.color}66,${person.color}33);
            border:2px solid #a855f7;
            display:flex;
            align-items:center;
            justify-content:center;
            font-weight:700;
            color:#fff;
            font-size:18px;
            flex-shrink:0;
          ">${person.initials}</div>
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:2px;">${person.name}</div>
            <div style="font-size:12px;margin-bottom:4px;">${onlineText}</div>
            <div style="font-size:12px;color:rgba(255,255,255,.5);">${person.dist}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
          <button style="
            padding:8px;
            border-radius:8px;
            border:1px solid rgba(168,85,247,.3);
            background:rgba(168,85,247,.1);
            color:#c084fc;
            font-size:11px;
            font-weight:600;
            cursor:pointer;
            transition:all 0.2s;
          " onmouseover="this.style.background='rgba(168,85,247,.2)'" onmouseout="this.style.background='rgba(168,85,247,.1)'">
            👋 Wave
          </button>
          <button style="
            padding:8px;
            border-radius:8px;
            border:1px solid rgba(168,85,247,.3);
            background:rgba(168,85,247,.1);
            color:#c084fc;
            font-size:11px;
            font-weight:600;
            cursor:pointer;
            transition:all 0.2s;
          " onmouseover="this.style.background='rgba(168,85,247,.2)'" onmouseout="this.style.background='rgba(168,85,247,.1)'">
            💬 Chat
          </button>
          <button style="
            padding:8px;
            border-radius:8px;
            border:1px solid rgba(255,0,0,.2);
            background:rgba(255,0,0,.05);
            color:#ff6b7a;
            font-size:11px;
            font-weight:600;
            cursor:pointer;
            transition:all 0.2s;
          " onmouseover="this.style.background='rgba(255,0,0,.1)'" onmouseout="this.style.background='rgba(255,0,0,.05)'">
            ♥ Like
          </button>
        </div>
      </div>
    `;
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setRadarViewsCount(Math.floor(Math.random() * 16) + 5);
    }, 1800);
  };

  return (
    <>
      <style>{`
        .leaflet-tile-pane { filter: ${tileKey === "dunkel" ? "brightness(0.72) saturate(0.9) contrast(1.05)" : "none"}; }
        .leaflet-attribution-flag { display:none!important; }
        .leaflet-control-attribution {
          font-size:9px!important; border-radius:4px!important;
          background:rgba(6,4,15,.7)!important; color:rgba(255,255,255,.25)!important;
          padding:2px 6px!important;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes radarPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(168, 85, 247, 0);
          }
          100% {
            box-shadow: 0 0 0 40px rgba(168, 85, 247, 0);
          }
        }

        .radar-sweep {
          position: absolute;
          width: 1px;
          height: 1px;
          background: conic-gradient(from 0deg, rgba(168, 85, 247, 0.4) 0deg, transparent 90deg);
          border-radius: 50%;
          animation: radarSweep 4s linear infinite;
          pointer-events: none;
        }

        .pulse-ring {
          animation: radarPulse 2s infinite;
        }

        .leaflet-popup-content-wrapper {
          background: transparent!important;
          box-shadow: none!important;
          border: none!important;
          padding: 0!important;
        }

        .leaflet-popup {
          margin-bottom: 0!important;
        }

        .leaflet-popup-tip {
          display: none!important;
        }
      `}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 999, overflow: "hidden", background: "#07050f" }}>

        <div ref={mapRef} style={{ position: "absolute", inset: 0, zIndex: 1 }} />

        {!ready && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "#07050f" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #a855f7", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
              <p style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,.4)" }}>Loading map…</p>
            </div>
          </div>
        )}

        {/* ── TOP HEADER ── */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
          background: "transparent",
          paddingTop: "env(safe-area-inset-top, 0px)",
          paddingLeft: 12, paddingRight: 12, paddingBottom: 20,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, textDecoration: "none" }}>
            <LogoMark className="h-5 w-5 shrink-0 text-[#a855f7]" size={20} />
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>{BRAND_NAME}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginTop: 2 }}>{t.nearby}</div>
            </div>
          </Link>

          {/* Right header: Nearby, Circle, Search, Bell, Menu */}
          <div style={{ display: "flex", gap: 2 }}>
            <Link href="/nearby" aria-label="Nearby" style={headerBtn}><NearbyIcon /></Link>
            <Link href="/circle" aria-label="Circle" style={headerBtn}><CircleIcon /></Link>
            <button aria-label="Search" onClick={() => setShowSearch(true)} style={headerBtn}><SearchIcon /></button>
            <button aria-label="Notifications" onClick={() => { setShowNotifToast(true); setTimeout(() => setShowNotifToast(false), 2500); }} style={headerBtn}><BellIcon /></button>
            <button aria-label="Menu" onClick={() => setShowMenu(true)} style={headerBtn}><MenuIcon /></button>
          </div>
        </div>

        {/* ── RADAR VIEWS COUNTER (Glass Morphism) ── */}
        <div style={{
          position: "absolute", top: 50, left: 12, zIndex: 20,
          background: "rgba(12,8,28,.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(168,85,247,.2)",
          borderRadius: 12,
          padding: "8px 12px",
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "rgba(255,255,255,.8)",
        }}>
          <EyeIcon />
          <span style={{ fontSize: 12 }}>
            <span style={{ color: "#a855f7", fontWeight: 700 }}>{radarViewsCount}</span> {t.radarViews}
          </span>
        </div>

        {/* ── RIGHT CONTROLS ── */}
        <div style={{
          position: "absolute", right: 12, zIndex: 20,
          bottom: "max(60px, calc(env(safe-area-inset-bottom) + 52px))",
          display: "flex", flexDirection: "column", gap: 8,
        }}>
          <button style={ctrlBtn}><UserIcon size={16} /><span style={{ fontSize: 8, color: "rgba(255,255,255,.4)", lineHeight: 1 }}>{NEARBY.length}</span></button>
          <button onClick={locate} style={ctrlBtn}><CrosshairIcon /></button>
          <button onClick={zoomIn} style={{ ...ctrlBtn, fontSize: 20, fontWeight: 300, lineHeight: 1 }}>+</button>
          <button onClick={zoomOut} style={{ ...ctrlBtn, fontSize: 20, fontWeight: 300, lineHeight: 1 }}>−</button>
        </div>

        {/* ── EBENEN (bottom-left) ── */}
        <div style={{ position: "absolute", left: 12, zIndex: 20, bottom: "max(60px, calc(env(safe-area-inset-bottom) + 52px))" }}>
          <button style={ctrlBtn} aria-label="Layers" onClick={() => setShowLayers(l => !l)}>
            <LayersIcon />
          </button>
        </div>

        {/* ── EBENEN POPUP ── */}
        {showLayers && (
          <div style={{
            position: "absolute", left: 12, zIndex: 25,
            bottom: "max(108px, calc(env(safe-area-inset-bottom) + 100px))",
            background: "rgba(12,8,28,.95)", borderRadius: 14,
            border: "1px solid rgba(255,255,255,.12)",
            padding: "12px 8px", minWidth: 130,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.45)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 8px 8px" }}>Map Style</div>
            {Object.entries(TILE_LAYERS).map(([key, val]) => (
              <button key={key} onClick={() => { setTileKey(key); setShowLayers(false); }} style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "8px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                background: tileKey === key ? "rgba(168,85,247,.25)" : "transparent",
                color: tileKey === key ? "#c084fc" : "rgba(255,255,255,.7)",
                fontSize: 13, fontWeight: 600,
              }}>
                {val.label}
              </button>
            ))}
          </div>
        )}

        {/* ── NOTIFICATION TOAST ── */}
        {showNotifToast && (
          <div style={{
            position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
            background: "rgba(12,8,28,.95)", border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 16, padding: "12px 20px", fontSize: 13, color: "rgba(255,255,255,.8)",
            backdropFilter: "blur(12px)", whiteSpace: "nowrap",
          }}>
            {t.noNotifications}
          </div>
        )}

        {/* ── SCAN BUTTON (Centered above bottom nav) ── */}
        <div style={{
          position: "absolute", bottom: "calc(max(58px, env(safe-area-inset-bottom)) + 8px)", left: "50%",
          transform: "translateX(-50%)", zIndex: 31,
        }}>
          <button
            onClick={handleScan}
            disabled={isScanning}
            style={{
              width: 48, height: 48,
              borderRadius: "50%",
              border: "none",
              background: isScanning
                ? "linear-gradient(135deg, #a855f7, #7c3aed)"
                : "linear-gradient(135deg, #c084fc, #a855f7)",
              color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: isScanning ? "not-allowed" : "pointer",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
              boxShadow: isScanning ? "0 0 20px rgba(168, 85, 247, 0.6)" : "0 4px 12px rgba(0,0,0,.3)",
            }}
            title={t.scanNow}
          >
            {isScanning && (
              <div className="pulse-ring" style={{
                position: "absolute", inset: 0,
                borderRadius: "50%",
              }} />
            )}
            <div style={{ position: "relative", zIndex: 1 }}>
              <RadarIcon />
            </div>
          </button>
          {isScanning && (
            <div style={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              fontSize: 10, color: "#fff", fontWeight: 700, whiteSpace: "nowrap", opacity: 0.8,
              marginTop: 20,
            }}>
              {t.scanning}
            </div>
          )}
        </div>

        {/* ── BOTTOM NAV ── */}
        <nav style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 30,
          display: "flex", alignItems: "center", justifyContent: "space-around",
          background: "transparent", borderTop: "none",
          paddingTop: 8, paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 2, padding: "4px 8px", textDecoration: "none",
              color: item.href === "/nearby" ? "#a855f7" : "rgba(255,255,255,.70)",
            }}>
              <NavIcon type={item.label} />
            </Link>
          ))}
        </nav>

        {/* ── MENU DRAWER ── */}
        {showMenu && (
          <>
            <div onClick={() => setShowMenu(false)} style={{ position: "absolute", inset: 0, zIndex: 45, background: "rgba(0,0,0,.5)" }} />
            <div style={{
              position: "absolute", top: 0, right: 0, bottom: 0, zIndex: 50,
              width: "min(280px, 80vw)", background: "rgba(12,8,28,.98)",
              borderLeft: "1px solid rgba(255,255,255,.1)",
              padding: "max(20px, env(safe-area-inset-top)) 20px 20px",
              display: "flex", flexDirection: "column", gap: 4,
              overflowY: "auto",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Menu</span>
                <button onClick={() => setShowMenu(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer" }}><CloseIcon /></button>
              </div>
              {NAV_ITEMS.map(item => (
                <Link key={item.href} href={item.href} onClick={() => setShowMenu(false)} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 8px",
                  borderRadius: 10, textDecoration: "none",
                  color: item.href === "/nearby" ? "#a855f7" : "rgba(255,255,255,.7)",
                  background: item.href === "/nearby" ? "rgba(168,85,247,.12)" : "transparent",
                  fontSize: 14, fontWeight: 600,
                }}>
                  <NavIcon type={item.label} />
                  <span style={{ textTransform: "capitalize" }}>{item.label}</span>
                </Link>
              ))}
              {/* Settings already in NAV_ITEMS above */}
            </div>
          </>
        )}

        {/* ── SEARCH BOTTOM SHEET ── */}
        {showSearch && (
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 40,
            background: "rgba(10,6,22,.97)", borderRadius: "20px 20px 0 0",
            border: "1px solid rgba(255,255,255,.1)", borderBottom: "none",
            padding: "20px 20px max(20px, env(safe-area-inset-bottom))",
          }}>
            {/* Handle bar */}
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,.2)", margin: "0 auto 16px" }} />

            {/* Title + close */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#fff" }}>Search</h2>
              <button onClick={() => setShowSearch(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer" }}><CloseIcon /></button>
            </div>

            {/* 1. Search location */}
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", marginBottom: 8 }}>1. Search location</div>
            <div style={{ position: "relative", marginBottom: 20 }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="City, street..."
                style={{
                  width: "100%", padding: "12px 44px 12px 16px", borderRadius: 12,
                  border: "1px solid rgba(255,255,255,.15)", background: "rgba(255,255,255,.06)",
                  color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box",
                }}
              />
              <button onClick={handleSearch} style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: "transparent", border: "none", color: "rgba(255,255,255,.4)", cursor: "pointer",
              }}><SearchIcon /></button>
            </div>

            {/* 2. Who do you want to see? */}
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", marginBottom: 8 }}>2. Filter</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {([
                { value: "all",   label: t.genderAll },
                { value: "women", label: t.genderWomen },
                { value: "men",   label: t.genderMen },
                { value: "other", label: t.genderOther },
              ] as Array<{ value: string; label: string }>).map(({ value, label }) => (
                <button key={value} onClick={() => setGenderFilter(value)} style={{
                  padding: "10px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.12)",
                  cursor: "pointer", fontSize: 14, fontWeight: 600,
                  background: genderFilter === value ? "linear-gradient(135deg, #c084fc, #a855f7)" : "rgba(255,255,255,.06)",
                  color: genderFilter === value ? "#fff" : "rgba(255,255,255,.6)",
                }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Submit */}
            <button onClick={handleSearch} style={{
              width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #c084fc, #a855f7)", color: "#fff",
              fontSize: 15, fontWeight: 700,
            }}>
              Apply
            </button>
          </div>
        )}

      </div>
    </>
  );
}

const headerBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: "50%", border: "none", background: "transparent",
  color: "rgba(255,255,255,.55)", display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", textDecoration: "none",
};

const ctrlBtn: React.CSSProperties = {
  width: 40, height: 40, borderRadius: "50%",
  border: "none", background: "transparent",
  color: "rgba(255,255,255,.70)",
  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
  cursor: "pointer",
};
