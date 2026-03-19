"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@puqme/ui";
import { BRAND_NAME } from "@puqme/config";

interface LocationInfo {
  lat: number;
  lng: number;
  displayName: string;
}

const NEARBY = [
  { id: "u1", initials: "AX", color: "#e879f9", name: "Alex, 28",   dist: "1.8 km", off: [ 0.012,  0.018] },
  { id: "u2", initials: "JD", color: "#38bdf8", name: "Jordan, 26", dist: "2.4 km", off: [-0.009,  0.021] },
  { id: "u3", initials: "CS", color: "#4ade80", name: "Casey, 30",  dist: "3.1 km", off: [ 0.017, -0.013] },
  { id: "u4", initials: "MG", color: "#fb923c", name: "Morgan, 27", dist: "3.8 km", off: [-0.020, -0.016] },
  { id: "u5", initials: "RI", color: "#f472b6", name: "Riley, 25",  dist: "4.5 km", off: [ 0.006, -0.024] },
];

const NAV_ITEMS = [
  { href: "/radar",    label: "nearby" },
  { href: "/circle",  label: "circle" },
  { href: "/matches", label: "matches" },
  { href: "/chat",    label: "chat" },
  { href: "/profile", label: "profile" },
  { href: "/settings",label: "settings" },
];

/* ── Tile layer configs ── */
const TILE_LAYERS: Record<string, { url: string; label: string }> = {
  dunkel:   { url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",  label: "Dunkel" },
  standard: { url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", label: "Standard" },
  gebaeude: { url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", label: "Gebäude" },
  oepnv:    { url: "https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38", label: "ÖPNV" },
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
function avatarHtml(initials: string, color: string, size: number, online: boolean) {
  const fs   = Math.round(size * 0.32);
  const dot  = Math.round(size * 0.22);
  const off  = Math.round(size * 0.04);
  return `<div style="position:relative;width:${size}px;height:${size}px;">
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
  const mapRef     = useRef<HTMLDivElement>(null);
  const mapObjRef  = useRef<any>(null);
  const tileRef    = useRef<any>(null);
  const [ready,    setReady]    = useState(false);
  const [location, setLocation] = useState<LocationInfo>({ lat: 48.1351, lng: 11.582, displayName: "München" });
  const [showSearch,  setShowSearch]  = useState(false);
  const [showLayers,  setShowLayers]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("alle");
  const [tileKey, setTileKey] = useState<string>("dunkel");

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

  /* Init Leaflet map */
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

    L.marker([location.lat, location.lng], {
      icon: L.divIcon({ html: avatarHtml("Du", "#a855f7", 64, true), className: "", iconSize: [64,64], iconAnchor: [32,32] }),
      zIndexOffset: 1000,
    }).addTo(map).bindPopup("<b>Du bist hier</b>");

    NEARBY.forEach(u => {
      L.marker([location.lat + u.off[0]!, location.lng + u.off[1]!], {
        icon: L.divIcon({ html: avatarHtml(u.initials, u.color, 46, Math.random() > 0.3), className: "", iconSize: [46,46], iconAnchor: [23,23] }),
      }).addTo(map).bindPopup(`<b>${u.name}</b><br><small>${u.dist}</small>`);
    });

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

  useEffect(() => {
    if (mapObjRef.current) mapObjRef.current.setView([location.lat, location.lng], 14);
  }, [location]);

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
        mapObjRef.current?.setView([lat, lng], 14);
      }
    } catch { /* noop */ }
    setShowSearch(false);
    setSearchQuery("");
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
      `}</style>

      <div style={{ position: "fixed", inset: 0, zIndex: 999, overflow: "hidden", background: "#07050f" }}>

        <div ref={mapRef} style={{ position: "absolute", inset: 0, zIndex: 1 }} />

        {!ready && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "#07050f" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid #a855f7", borderTopColor: "transparent", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
              <p style={{ marginTop: 8, fontSize: 12, color: "rgba(255,255,255,.4)" }}>Karte lädt…</p>
            </div>
          </div>
        )}

        {/* ── TOP HEADER ── */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
          background: "transparent",
          paddingTop: "max(12px, env(safe-area-inset-top))",
          paddingLeft: 12, paddingRight: 12, paddingBottom: 20,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, textDecoration: "none" }}>
            <LogoMark className="h-5 w-5 shrink-0 text-[#a855f7]" size={20} />
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>{BRAND_NAME}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.5)", marginTop: 2 }}>Nearby</div>
            </div>
          </Link>

          {/* Right header: Nearby, Circle, Search, Bell, Menu */}
          <div style={{ display: "flex", gap: 2 }}>
            <Link href="/radar" aria-label="Nearby" style={headerBtn}><NearbyIcon /></Link>
            <Link href="/circle" aria-label="Circle" style={headerBtn}><CircleIcon /></Link>
            <button aria-label="Search" onClick={() => setShowSearch(true)} style={headerBtn}><SearchIcon /></button>
            <button aria-label="Benachrichtigungen" style={headerBtn}><BellIcon /></button>
            <button aria-label="Menu" style={headerBtn}><MenuIcon /></button>
          </div>
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
          <button style={ctrlBtn} aria-label="Ebenen" onClick={() => setShowLayers(l => !l)}>
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
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.45)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 8px 8px" }}>Kartenstil</div>
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
              gap: 3, padding: "4px 8px", textDecoration: "none",
              color: item.href === "/radar" ? "#a855f7" : "rgba(255,255,255,.70)",
            }}>
              <NavIcon type={item.label} />
              {item.href === "/radar" && (
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#a855f7" }} />
              )}
            </Link>
          ))}
        </nav>

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
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#fff" }}>Nearby Search</h2>
              <button onClick={() => setShowSearch(false)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.5)", cursor: "pointer" }}><CloseIcon /></button>
            </div>

            {/* 1. Ort suchen */}
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", marginBottom: 8 }}>1. Ort suchen</div>
            <div style={{ position: "relative", marginBottom: 20 }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Stadt, Straße..."
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

            {/* 2. Wen möchtest du sehen? */}
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", marginBottom: 8 }}>2. Wen möchtest du sehen?</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {["Alle", "Frauen", "Männer", "Divers"].map(g => (
                <button key={g} onClick={() => setGenderFilter(g.toLowerCase())} style={{
                  padding: "10px 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.12)",
                  cursor: "pointer", fontSize: 14, fontWeight: 600,
                  background: genderFilter === g.toLowerCase() ? "linear-gradient(135deg, #c084fc, #a855f7)" : "rgba(255,255,255,.06)",
                  color: genderFilter === g.toLowerCase() ? "#fff" : "rgba(255,255,255,.6)",
                }}>
                  {g}
                </button>
              ))}
            </div>

            {/* Submit */}
            <button onClick={handleSearch} style={{
              width: "100%", padding: "14px", borderRadius: 14, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #c084fc, #a855f7)", color: "#fff",
              fontSize: 15, fontWeight: 700,
            }}>
              Anwenden &amp; Nearby ansehen
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
