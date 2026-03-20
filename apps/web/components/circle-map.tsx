"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@puqme/ui";
import { BRAND_NAME } from "@puqme/config";
import { useLanguage } from "@/lib/i18n";
import {
  fetchCircleEncounters, fetchMyCircles, updateCircleSettings,
  postLocationEvent, updateFreeNowStatus, sendWave,
  type CircleEncounter, type FriendCircle, type CircleListResponse
} from "@/lib/social";

/* ── Time filters ── */
type TimeFilter = "24h" | "3d" | "7d" | "1m" | "3m" | "1y";
const TIME_FILTERS: { key: TimeFilter; label: string }[] = [
  { key: "24h", label: "24h" },
  { key: "3d",  label: "3d" },
  { key: "7d",  label: "7d" },
  { key: "1m",  label: "1 month" },
  { key: "3m",  label: "3 months" },
  { key: "1y",  label: "1 year" },
];

/* ── Color palette for encounters ── */
const COLORS = ["#f15bb5", "#38bdf8", "#fbbf24", "#4ade80", "#ec4899", "#06b6d4", "#eab308", "#10b981"];

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

/* ── SVG icons ── */
function NearbyIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><line x1="12" y1="12" x2="20" y2="5.5" strokeWidth="1.4"/></svg>; }
function CircleNavIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>; }
function HeartIcon()     { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 20s-6.5-4.2-8.5-8A5 5 0 0 1 12 6a5 5 0 0 1 8.5 6C18.5 15.8 12 20 12 20Z"/></svg>; }
function ChatIcon()      { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 6.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"/></svg>; }
function UserIcon({ size = 22 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>; }
function GridIcon()      { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></svg>; }
function CrosshairIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="3" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="21" y2="12"/></svg>; }
function LayersIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>; }
function ListIcon()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 7h11M8 12h11M8 17h11M4 7h.01M4 12h.01M4 17h.01" strokeWidth="1.8"/></svg>; }
function MapIcon()       { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2V6Zm6-2v14m6-12v14"/></svg>; }
function SearchIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>; }
function BellIcon()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
function MenuIcon()      { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
function CloseIcon()     { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function ShieldIcon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 22s-8-4-8-10V5l8-3 8 3v7c0 6-8 10-8 10Z"/></svg>; }

function NavIcon({ type }: { type: string }) {
  if (type === "nearby")   return <NearbyIcon />;
  if (type === "circle")   return <CircleNavIcon />;
  if (type === "matches")  return <HeartIcon />;
  if (type === "chat")     return <ChatIcon />;
  if (type === "profile")  return <UserIcon />;
  if (type === "settings") return <GridIcon />;
  return <NearbyIcon />;
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
  const { t } = useLanguage();
  const mapRef     = useRef<HTMLDivElement>(null);
  const mapObjRef  = useRef<any>(null);
  const tileRef    = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const linesRef   = useRef<any[]>([]);
  const [ready,    setReady]    = useState(false);
  const [filter,   setFilter]   = useState<TimeFilter>("24h");
  const [location, setLocation] = useState({ lat: 52.52, lng: 13.405 });
  const [showSearch,  setShowSearch]  = useState(false);
  const [showLayers,  setShowLayers]  = useState(false);
  const [showMenu,    setShowMenu]    = useState(false);
  const [showNotifToast, setShowNotifToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [tileKey, setTileKey] = useState<string>("dunkel");
  const [activeTab, setActiveTab] = useState<"encounters" | "circle">("encounters");
  const [freeNowEnabled, setFreeNowEnabled] = useState(false);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);

  // API state
  const [encounters, setEncounters] = useState<CircleEncounter[]>([]);
  const [circles, setCircles] = useState<FriendCircle[]>([]);
  const [isLoadingEncounters, setIsLoadingEncounters] = useState(true);
  const [isLoadingCircles, setIsLoadingCircles] = useState(true);

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

  /* Fetch encounters when time filter changes */
  useEffect(() => {
    let cancelled = false;
    setIsLoadingEncounters(true);

    fetchCircleEncounters(filter, location.lat, location.lng)
      .then(data => {
        if (!cancelled) {
          setEncounters(data.items || []);
          setIsLoadingEncounters(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoadingEncounters(false);
      });

    return () => { cancelled = true; };
  }, [filter, location.lat, location.lng]);

  /* Fetch circles on mount */
  useEffect(() => {
    let cancelled = false;

    fetchMyCircles()
      .then(data => {
        if (!cancelled) {
          setCircles(data.items || []);
          setIsLoadingCircles(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoadingCircles(false);
      });

    return () => { cancelled = true; };
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

    const tile = L.tileLayer(TILE_LAYERS[tileKey]!.url, {
      maxZoom: 19, subdomains: "abcd",
    }).addTo(map);
    tileRef.current = tile;

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
      .bindPopup("<b>You are here</b>");

    mapObjRef.current = map;
  }, [ready, location]);

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

  /* Update encounter markers and connection lines when encounters change */
  useEffect(() => {
    if (!mapObjRef.current || !ready) return;
    const L = (window as any).L;
    if (!L) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Remove old lines
    linesRef.current.forEach(l => l.remove());
    linesRef.current = [];

    encounters.forEach((enc, idx) => {
      // Compute position from distance using random bearing
      let encLat = location.lat;
      let encLng = location.lng;
      if (enc.distanceKm) {
        // Simple lat/lng offset based on distance
        const bearing = Math.random() * 360;
        const latOffset = (enc.distanceKm / 111) * Math.cos((bearing * Math.PI) / 180);
        const lngOffset = (enc.distanceKm / 111) * Math.sin((bearing * Math.PI) / 180) / Math.cos((location.lat * Math.PI) / 180);
        encLat += latOffset;
        encLng += lngOffset;
      } else {
        // Fallback: random offset
        encLat += (Math.random() - 0.5) * 0.01;
        encLng += (Math.random() - 0.5) * 0.01;
      }

      const color = COLORS[idx % COLORS.length] || "#a855f7";

      const icon = L.divIcon({
        html: dotMarkerHtml(color),
        className: "",
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      const m = L.marker(
        [encLat, encLng],
        { icon }
      ).addTo(mapObjRef.current)
        .bindPopup(`<b>${enc.displayName}, ${enc.age}</b><br><small>${enc.area}</small>`);
      markersRef.current.push(m);

      // Draw dashed connection line from self to encounter
      const polyline = L.polyline(
        [[location.lat, location.lng], [encLat, encLng]],
        {
          color: color,
          weight: 1.5,
          opacity: 0.4,
          dashArray: "5, 5",
          className: "encounter-line"
        }
      ).addTo(mapObjRef.current);
      linesRef.current.push(polyline);
    });
  }, [encounters, ready, location]);

  useEffect(() => {
    if (mapObjRef.current) mapObjRef.current.setView([location.lat, location.lng], 13);
  }, [location]);

  const zoomIn  = () => mapObjRef.current?.zoomIn();
  const zoomOut = () => mapObjRef.current?.zoomOut();
  const locate  = () => mapObjRef.current?.setView([location.lat, location.lng], 14);

  /* Handle Free Now toggle */
  const handleFreeNowToggle = () => {
    const next = !freeNowEnabled;
    setFreeNowEnabled(next);
    updateFreeNowStatus(next).catch(() => {});
  };

  /* Handle circle setting changes */
  const handleCircleSettingChange = (circleId: string, setting: string, value: boolean) => {
    setCircles(prev => prev.map(c =>
      c.circleId === circleId
        ? { ...c, settings: { ...c.settings, [setting]: value } }
        : c
    ));
    updateCircleSettings(circleId, { [setting]: value }).catch(() => {});
  };

  /* Handle wave action */
  const handleWave = async (userId: string) => {
    try {
      await sendWave(userId);
    } catch { /* noop */ }
  };

  /* Search location via Nominatim */
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1&accept-language=de`);
      const d = await r.json();
      if (d[0]) {
        const lat = parseFloat(d[0].lat);
        const lng = parseFloat(d[0].lon);
        setLocation({ lat, lng });
        mapObjRef.current?.setView([lat, lng], 13);
      }
    } catch { /* noop */ }
    setShowSearch(false);
    setSearchQuery("");
  };

  const mapHeight = activeTab === "encounters" ? "45vh" : "0px";
  const timelineHeight = activeTab === "encounters" ? "55vh" : "0";

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
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .timeline-container { animation: slideUp 0.3s ease-out; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 999, overflow: "hidden", background: "#07050f", display: "flex", flexDirection: "column" }}>

        {/* MAP — hidden when circle tab is active */}
        <div ref={mapRef} style={{
          position: "relative",
          height: activeTab === "encounters" ? "45vh" : "0px",
          width: "100%",
          zIndex: 1,
          overflow: "hidden",
          display: activeTab === "circle" ? "none" : "block",
        }} />

        {/* BADGE UNLOCK NOTIFICATION */}
        {showBadgeUnlock && (
          <div style={{
            position: "absolute", top: 120, left: "50%", transform: "translateX(-50%)", zIndex: 9998,
            background: "linear-gradient(135deg, rgba(191,132,255,.96), rgba(168,85,247,.95))",
            border: "1px solid rgba(255,255,255,.2)",
            borderRadius: 16, padding: "12px 24px", fontSize: 14, color: "#fff", fontWeight: 700,
            backdropFilter: "blur(12px)", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 8,
          }}>
            <span>🏆</span> {t.regularBadge} 3× Maya {t.timesThisWeek}
          </div>
        )}

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
          paddingLeft: 12, paddingRight: 12, paddingBottom: 0,
        }}>
          {/* Row 1: Logo + title + icon buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, textDecoration: "none" }}>
              <LogoMark className="h-5 w-5 shrink-0 text-[#a855f7]" size={20} />
              <div style={{ lineHeight: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#a855f7", letterSpacing: "0.01em" }}>{BRAND_NAME}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>Circle</span>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.45)", marginTop: 2 }}>{t.yourEncounters}</div>
              </div>
            </Link>

            {/* Right header: Nearby, Circle, Search, Bell, Menu */}
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Link href="/nearby" aria-label="Nearby" style={headerBtn}><NearbyIcon /></Link>
              <Link href="/circle" aria-label="Circle" style={headerBtn}><CircleNavIcon /></Link>
              <button aria-label="Search" onClick={() => setShowSearch(true)} style={headerBtn}><SearchIcon /></button>
              <button aria-label="Notifications" onClick={() => { setShowNotifToast(true); setTimeout(() => setShowNotifToast(false), 2500); }} style={headerBtn}><BellIcon /></button>
              <button aria-label="Menu" onClick={() => { setShowMenu(true); setShowLayers(false); }} style={headerBtn}><MenuIcon /></button>
            </div>
          </div>

          {/* Row 2: Time filter bar — only on encounters tab */}
          {activeTab === "encounters" && <div style={{
            display: "flex", alignItems: "center", gap: 6,
            paddingBottom: 10, overflowX: "auto",
            scrollbarWidth: "none", msOverflowStyle: "none",
          }}>
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
          </div>}

          {/* Row 3: Tab bar (Begegnungen / Mein Kreis) */}
          <div style={{
            display: "flex", gap: 8, paddingBottom: 12,
            borderBottom: "1px solid rgba(255,255,255,.08)"
          }}>
            <button
              onClick={() => setActiveTab("encounters")}
              style={{
                flex: 1, padding: "10px 16px", borderRadius: 12, border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 600,
                background: activeTab === "encounters"
                  ? "linear-gradient(135deg, rgba(191,132,255,.96), rgba(168,85,247,.95))"
                  : "rgba(255,255,255,.08)",
                color: activeTab === "encounters" ? "#fff" : "rgba(255,255,255,.6)",
              }}
            >
              {t.encounters}
            </button>
            <button
              onClick={() => setActiveTab("circle")}
              style={{
                flex: 1, padding: "10px 16px", borderRadius: 12, border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 600,
                background: activeTab === "circle"
                  ? "linear-gradient(135deg, rgba(191,132,255,.96), rgba(168,85,247,.95))"
                  : "rgba(255,255,255,.08)",
                color: activeTab === "circle" ? "#fff" : "rgba(255,255,255,.6)",
              }}
            >
              {t.myCircle}
            </button>
          </div>
        </div>

        {/* ── ENCOUNTERS TAB: Timeline Below Map ── */}
        {activeTab === "encounters" && (
          <div style={{
            position: "relative", height: timelineHeight, overflowY: "auto", background: "#07050f",
            borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 12, paddingBottom: 80,
          }} className="timeline-container">
            {isLoadingEncounters ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #a855f7", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
                  <p style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,.4)" }}>Loading encounters…</p>
                </div>
              </div>
            ) : encounters.length > 0 ? (
              <div style={{ padding: "0 16px" }}>
                {encounters.map((enc, idx) => (
                  <div key={enc.userId} style={{
                    display: "flex", gap: 12, marginBottom: 16, position: "relative",
                  }}>
                    {/* Timeline line */}
                    {idx < encounters.length - 1 && (
                      <div style={{
                        position: "absolute", left: 19, top: 48, width: 2, height: "calc(100% + 16px)",
                        borderLeft: "1px dashed rgba(255,255,255,.2)",
                      }} />
                    )}

                    {/* Avatar */}
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%", background: COLORS[idx % COLORS.length],
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0, position: "relative", zIndex: 2,
                    }}>
                      {enc.displayName[0]}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                            {enc.displayName}, {enc.age}
                          </div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)", marginTop: 2 }}>
                            {enc.area} • {enc.distanceKm?.toFixed(1) || "?"} km
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", textAlign: "right" }}>
                          {enc.timestamp}
                        </div>
                      </div>

                      {/* Story-framing text */}
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)", marginBottom: 8, lineHeight: 1.4 }}>
                        {enc.mutual ? (
                          <>Du hast <b>{enc.displayName}</b> zum 2. Mal diese Woche gekreuzt</>
                        ) : (
                          <>Erste Begegnung in der Nähe vom Café</>
                        )}
                      </div>

                      {/* Mutual badge */}
                      {enc.mutual && (
                        <div style={{
                          display: "inline-block", background: "rgba(168,85,247,.3)", color: "#c084fc",
                          padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, marginBottom: 8,
                        }}>
                          ⚡ {t.mutualSignal}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => handleWave(enc.userId)} style={{
                          padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,.15)",
                          background: "transparent", color: "rgba(255,255,255,.7)", fontSize: 12, cursor: "pointer",
                          fontWeight: 600,
                        }}>
                          👋 {t.waveBtn}
                        </button>
                        <button style={{
                          padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,.15)",
                          background: "transparent", color: "rgba(255,255,255,.7)", fontSize: 12, cursor: "pointer",
                        }}>
                          💬
                        </button>
                        <button style={{
                          padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,.15)",
                          background: "transparent", color: "rgba(255,255,255,.7)", fontSize: 12, cursor: "pointer",
                        }}>
                          ♥
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "rgba(255,255,255,.5)" }}>
                <p style={{ fontSize: 14, marginBottom: 8 }}>{t.noEncounters}</p>
                <p style={{ fontSize: 12 }}>{t.noEncountersPeriodDesc}</p>
              </div>
            )}
          </div>
        )}

        {/* ── MEIN KREIS TAB ── */}
        {activeTab === "circle" && (
          <div style={{
            position: "relative", flex: 1, overflowY: "auto", background: "#07050f",
            borderTop: "1px solid rgba(255,255,255,.08)", padding: "16px",
            paddingTop: 96, paddingBottom: 80,
          }}>
            {/* Free Now Toggle */}
            <div style={{
              background: "rgba(168,85,247,.15)", border: "1px solid rgba(168,85,247,.3)",
              borderRadius: 12, padding: 16, marginBottom: 20, display: "flex", alignItems: "center", gap: 12,
            }}>
              <input
                type="checkbox"
                checked={freeNowEnabled}
                onChange={handleFreeNowToggle}
                style={{ width: 20, height: 20, cursor: "pointer", accentColor: "#a855f7" }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
                  {t.freeNow}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>
                  {t.freeNowDesc}
                </div>
              </div>
            </div>

            {/* Circles List */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.45)", textTransform: "uppercase", marginBottom: 12, letterSpacing: "0.08em" }}>
                {t.myCircle}
              </div>
              {isLoadingCircles ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #a855f7", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
                    <p style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,.4)" }}>Loading circles…</p>
                  </div>
                </div>
              ) : (
                <>
                  {circles.map(circle => (
                    <div key={circle.circleId} style={{
                      background: "rgba(255,255,255,.06)", borderRadius: 12, padding: 16, marginBottom: 12,
                      border: "1px solid rgba(255,255,255,.08)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                        <span style={{ fontSize: 20 }}>{circle.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                            {circle.name}
                          </div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>
                            {circle.members.length} {t.members}
                          </div>
                        </div>
                        <button style={{
                          padding: "6px 12px", borderRadius: 8, border: "none",
                          background: "rgba(168,85,247,.2)", color: "#c084fc", fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}>
                          {t.invite}
                        </button>
                      </div>

                      {/* Member avatars */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        {circle.members.slice(0, 4).map((member, i) => (
                          <div key={i} style={{
                            width: 32, height: 32, borderRadius: "50%", background: "rgba(168,85,247,.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#c084fc", fontSize: 12, fontWeight: 700,
                          }}>
                            {member.displayName[0]}
                          </div>
                        ))}
                        {circle.members.length > 4 && (
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%", background: "rgba(168,85,247,.2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#c084fc", fontSize: 12, fontWeight: 700,
                          }}>
                            +{circle.members.length - 4}
                          </div>
                        )}
                        <button style={{
                          width: 32, height: 32, borderRadius: "50%", border: "1px dashed rgba(168,85,247,.4)",
                          background: "transparent", color: "#a855f7", fontSize: 16, cursor: "pointer",
                        }}>
                          +
                        </button>
                      </div>

                      {/* Privacy toggles */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={circle.settings?.locationSharing ?? false}
                            onChange={(e) => handleCircleSettingChange(circle.circleId, "locationSharing", e.target.checked)}
                            style={{ width: 16, height: 16, accentColor: "#a855f7" }}
                          />
                          <span style={{ color: "rgba(255,255,255,.7)" }}>📍 {t.locationSharing}</span>
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={circle.settings?.presenceSharing ?? false}
                            onChange={(e) => handleCircleSettingChange(circle.circleId, "presenceSharing", e.target.checked)}
                            style={{ width: 16, height: 16, accentColor: "#a855f7" }}
                          />
                          <span style={{ color: "rgba(255,255,255,.7)" }}>👁 {t.presenceSharing}</span>
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12 }}>
                          <input
                            type="checkbox"
                            checked={circle.settings?.availabilitySharing ?? false}
                            onChange={(e) => handleCircleSettingChange(circle.circleId, "availabilitySharing", e.target.checked)}
                            style={{ width: 16, height: 16, accentColor: "#a855f7" }}
                          />
                          <span style={{ color: "rgba(255,255,255,.7)" }}>📅 {t.availabilitySharing}</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Create Circle Button */}
            <button style={{
              width: "100%", padding: "12px 16px", borderRadius: 12,
              border: "1px dashed rgba(168,85,247,.4)", background: "transparent",
              color: "#a855f7", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 20,
            }}>
              ＋ {t.createCircle}
            </button>

            {/* SOS Alert */}
            <div style={{
              background: "linear-gradient(135deg, rgba(239,68,68,.15), rgba(220,38,38,.1))",
              border: "1px solid rgba(239,68,68,.3)", borderRadius: 12, padding: 16,
              display: "flex", alignItems: "flex-start", gap: 12,
            }}>
              <ShieldIcon />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fca5a5", marginBottom: 2 }}>
                  {t.sosAlert}
                </div>
                <div style={{ fontSize: 12, color: "rgba(252,165,165,.7)" }}>
                  {t.sosDesc}
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.45)", textTransform: "uppercase", marginBottom: 12, letterSpacing: "0.08em" }}>
                {t.circleActivities}
              </div>
              <div style={{
                background: "rgba(255,255,255,.04)", borderRadius: 12, padding: 12,
                fontSize: 13, color: "rgba(255,255,255,.7)", lineHeight: 1.6,
              }}>
                <div style={{ marginBottom: 8 }}>🟢 Emma ist jetzt in Kreuzberg</div>
                <div>📍 Lukas hat Bin frei aktiviert</div>
              </div>
            </div>
          </div>
        )}

        {/* ── RIGHT CONTROLS (only on encounters tab) ── */}
        {activeTab === "encounters" && (
          <div style={{
            position: "absolute", right: 12, zIndex: 20,
            bottom: "max(60px, calc(env(safe-area-inset-bottom) + 52px))",
            display: "flex", flexDirection: "column", gap: 8,
          }}>
            <button style={ctrlBtn}><UserIcon size={16} /><span style={{ fontSize: 8, color: "rgba(255,255,255,.4)", lineHeight: 1 }}>{encounters.length}</span></button>
            <button onClick={locate} style={ctrlBtn}><CrosshairIcon /></button>
            <button onClick={zoomIn}  style={{ ...ctrlBtn, fontSize: 20, fontWeight: 300, lineHeight: 1 }}>+</button>
            <button onClick={zoomOut} style={{ ...ctrlBtn, fontSize: 20, fontWeight: 300, lineHeight: 1 }}>−</button>
          </div>
        )}

        {/* ── EBENEN (bottom-left, only on encounters tab) ── */}
        {activeTab === "encounters" && (
          <div style={{ position: "absolute", left: 12, zIndex: 20, bottom: "max(60px, calc(env(safe-area-inset-bottom) + 52px))" }}>
            <button style={ctrlBtn} aria-label="Layers" onClick={() => { setShowLayers(l => !l); setShowMenu(false); }}>
              <LayersIcon />
            </button>
          </div>
        )}

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
              color: item.href === "/circle" ? "#a855f7" : "rgba(255,255,255,.70)",
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
                  color: item.href === "/circle" ? "#a855f7" : "rgba(255,255,255,.7)",
                  background: item.href === "/circle" ? "rgba(168,85,247,.12)" : "transparent",
                  fontSize: 14, fontWeight: 600,
                }}>
                  <NavIcon type={item.label} />
                  <span style={{ textTransform: "capitalize" }}>{item.label}</span>
                </Link>
              ))}
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
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,.2)", margin: "0 auto 16px" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#fff" }}>Search</h2>
              <button onClick={() => setShowSearch(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer" }}><CloseIcon /></button>
            </div>
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
