"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@puqme/ui";
import { BRAND_NAME } from "@puqme/config";

// ── Static data ───────────────────────────────────────────────────────────────
const NEARBY_PEOPLE = [
  { id: "u1", initials: "EM", color: "#e879f9", name: "Emma, 26",   dist: "120 m",  meta: "Online",     off: [ 0.006, -0.010] as [number,number] },
  { id: "u2", initials: "LK", color: "#38bdf8", name: "Lukas, 28",  dist: "200 m",  meta: "Online",     off: [-0.004,  0.012] as [number,number] },
  { id: "u3", initials: "SV", color: "#4ade80", name: "Svenja, 24", dist: "350 m",  meta: "Vor 5 Min",  off: [-0.009, -0.007] as [number,number] },
  { id: "u4", initials: "MG", color: "#fb923c", name: "Morgan, 27", dist: "500 m",  meta: "Vor 12 Min", off: [ 0.011,  0.008] as [number,number] },
];

const ENCOUNTERS = [
  { id: "e1", initials: "AN", color: "#e879f9", name: "Anna, 25",  place: "Alexanderplatz · 20 m", time: "vor 20 Min" },
  { id: "e2", initials: "MX", color: "#38bdf8", name: "Max, 30",   place: "Café Einstein · 2 m",   time: "vor 2 Std" },
  { id: "e3", initials: "MR", color: "#4ade80", name: "Marie, 27", place: "Hauptbahnhof · 5 m",    time: "vor 4 Std" },
];

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

// ── Leaflet avatar HTML ───────────────────────────────────────────────────────
function avatarHtml(initials: string, color: string, size: number, isMe = false) {
  const fs  = Math.round(size * 0.33);
  const dot = Math.round(size * 0.22);
  const off = Math.round(size * 0.04);
  if (isMe) {
    return `<div style="position:relative;width:${size}px;height:${size}px;">
      <div style="position:absolute;inset:0;border-radius:50%;
        background:linear-gradient(135deg,rgba(168,85,247,.55),rgba(124,58,237,.4));
        border:3px solid #a855f7;
        box-shadow:0 0 0 4px rgba(168,85,247,.28),0 0 22px rgba(168,85,247,.55);
        display:flex;align-items:center;justify-content:center;
        font-size:${fs}px;font-weight:800;color:#fff;
        font-family:system-ui,sans-serif;letter-spacing:.04em;">Du</div>
    </div>`;
  }
  return `<div style="position:relative;width:${size}px;height:${size}px;">
    <div style="position:absolute;inset:0;border-radius:50%;
      background:linear-gradient(135deg,${color}66,${color}33);
      border:2.5px solid #7c3aed;
      box-shadow:0 0 0 1px rgba(124,58,237,.35),0 4px 16px rgba(0,0,0,.7);
      display:flex;align-items:center;justify-content:center;
      font-size:${fs}px;font-weight:700;color:#fff;
      font-family:system-ui,sans-serif;letter-spacing:.03em;">${initials}</div>
    <div style="position:absolute;bottom:${off}px;right:${off}px;
      width:${dot}px;height:${dot}px;border-radius:50%;
      background:#22c55e;border:2px solid #06040f;"></div>
  </div>`;
}

// ── SVG icons ─────────────────────────────────────────────────────────────────
function BellSvg() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.85">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

function CircleNavSvg() {
  return (
    <svg width="26" height="24" viewBox="0 0 80 72" fill="white" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="13" r="9"/>
      <path d="M4 36 Q4 27 18 27 Q32 27 32 36"/>
      <circle cx="62" cy="13" r="9"/>
      <path d="M48 36 Q48 27 62 27 Q76 27 76 36"/>
      <path d="M18 4 Q40 -4 62 4" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="40" cy="40" r="8"/>
      <path d="M34 42 Q34 56 40 61 Q46 56 46 42"/>
      <path d="M6 50 Q6 70 40 70 Q74 70 74 50" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export function HomeFeed() {
  const mapRef        = useRef<HTMLDivElement>(null);
  const mapObjRef     = useRef<any>(null);
  const tileRef       = useRef<any>(null);
  const markersRef    = useRef<any[]>([]);
  const selfMarkerRef = useRef<any>(null);
  const ringsRef      = useRef<any[]>([]);

  const [ready,  setReady]  = useState(false);
  const [loc,    setLoc]    = useState({ lat: 48.1351, lng: 11.582 });
  const [clock,  setClock]  = useState("9:41");
  const [toast,  setToast]  = useState(false);

  // Live clock
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setClock(`${n.getHours()}:${String(n.getMinutes()).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  // Load Leaflet CSS + JS
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

  // Geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLoc({ lat: coords.latitude, lng: coords.longitude }),
      undefined,
      { timeout: 8000, maximumAge: 60_000 }
    );
  }, []);

  // Init Leaflet map
  useEffect(() => {
    if (!ready || !mapRef.current || mapObjRef.current) return;
    const L = (window as any).L;
    if (!L) return;
    const map = L.map(mapRef.current, {
      center: [loc.lat, loc.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });
    tileRef.current = L.tileLayer(TILE_URL, { maxZoom: 19, subdomains: "abcd" }).addTo(map);
    mapObjRef.current = map;
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // Place / update markers + radar rings
  useEffect(() => {
    if (!mapObjRef.current) return;
    const L = (window as any).L;
    if (!L) return;
    const map = mapObjRef.current;

    // Clean up previous
    selfMarkerRef.current?.remove();
    markersRef.current.forEach(m => m.remove());
    ringsRef.current.forEach(r => r.remove());
    markersRef.current = [];
    ringsRef.current = [];

    // Radar rings — Leaflet circles so markers appear above them
    [
      { radius: 120,  opacity: 0.50, weight: 1.5 },
      { radius: 280,  opacity: 0.25, weight: 1 },
      { radius: 500,  opacity: 0.12, weight: 1 },
      { radius: 800,  opacity: 0.06, weight: 1 },
    ].forEach(cfg => {
      ringsRef.current.push(
        L.circle([loc.lat, loc.lng], {
          radius: cfg.radius, color: `rgba(168,85,247,${cfg.opacity})`,
          weight: cfg.weight, fill: false, interactive: false,
        }).addTo(map)
      );
    });

    // Self marker — "Du"
    selfMarkerRef.current = L.marker([loc.lat, loc.lng], {
      icon: L.divIcon({ html: avatarHtml("Du", "#a855f7", 58, true), className: "", iconSize: [58,58], iconAnchor: [29,29] }),
      zIndexOffset: 1000,
    }).addTo(map);

    // Nearby people
    NEARBY_PEOPLE.forEach(u => {
      const m = L.marker([loc.lat + u.off[0], loc.lng + u.off[1]], {
        icon: L.divIcon({ html: avatarHtml(u.initials, u.color, 46), className: "", iconSize: [46,46], iconAnchor: [23,23] }),
      }).addTo(map);
      markersRef.current.push(m);
    });

    map.setView([loc.lat, loc.lng], 14);
  }, [loc, ready]);

  return (
    <>
      <style>{`
        .leaflet-tile-pane { filter: brightness(0.68) saturate(0.82) contrast(1.08); }
        .leaflet-attribution-flag { display:none !important; }
        .leaflet-control-attribution {
          font-size:8px !important; border-radius:4px !important;
          background:rgba(6,4,15,.55) !important;
          color:rgba(255,255,255,.18) !important;
          padding:1px 4px !important;
        }
        .hf-scroll::-webkit-scrollbar { display:none; }
        @keyframes hf-spin { to { transform:rotate(360deg); } }
      `}</style>

      {/* ════ OUTER SHELL ════ */}
      <div style={{
        position: "fixed", inset: 0,
        background: "#08070f",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        fontFamily: "'Inter',-apple-system,sans-serif",
      }}>

        {/* ════ MAP SECTION ════ */}
        <div style={{ position: "relative", height: "56vh", flexShrink: 0, overflow: "hidden" }}>

          {/* Leaflet canvas */}
          <div ref={mapRef} style={{ position: "absolute", inset: 0, zIndex: 1 }} />

          {/* Loading */}
          {!ready && (
            <div style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "#08070f" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid #a855f7", borderTopColor: "transparent", animation: "hf-spin .8s linear infinite" }} />
            </div>
          )}

          {/* Radar rings rendered as Leaflet circles — see useEffect above */}

          {/* Bottom gradient fade */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 90,
            background: "linear-gradient(to bottom, transparent, #08070f)",
            zIndex: 6, pointerEvents: "none",
          }} />

          {/* ── HEADER OVERLAY — ONE ROW: Bell | Logo + PuQ.me | Time | Battery ── */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, zIndex: 20,
            display: "flex", alignItems: "center",
            paddingTop: "max(14px, env(safe-area-inset-top, 14px))",
            paddingLeft: 14, paddingRight: 14, paddingBottom: 4,
            gap: 8,
          }}>
            {/* Bell — transparent, no background */}
            <button
              onClick={() => { setToast(true); setTimeout(() => setToast(false), 2500); }}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", flexShrink: 0 }}
            >
              <BellSvg />
            </button>

            {/* Logo + brand name */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none", flex: 1 }}>
              <LogoMark className="shrink-0 text-[#a855f7]" size={22} />
              <span style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", textShadow: "0 1px 8px rgba(0,0,0,.75)" }}>
                {BRAND_NAME}
              </span>
            </Link>

            {/* Time */}
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff", textShadow: "0 1px 8px rgba(0,0,0,.85)", flexShrink: 0 }}>
              {clock}
            </span>

            {/* Signal bars */}
            <svg width="13" height="11" viewBox="0 0 16 12" fill="white" style={{ flexShrink: 0 }}>
              <rect x="0"    y="4"   width="3" height="8"   rx="1" opacity=".4"/>
              <rect x="4.5"  y="2.5" width="3" height="9.5" rx="1" opacity=".65"/>
              <rect x="9"    y="0"   width="3" height="12"  rx="1" opacity=".85"/>
              <rect x="13"   y="0"   width="3" height="12"  rx="1"/>
            </svg>

            {/* Battery */}
            <svg width="21" height="11" viewBox="0 0 26 12" fill="none" style={{ flexShrink: 0 }}>
              <rect x=".5" y=".5" width="22" height="11" rx="3" stroke="white" strokeOpacity=".3"/>
              <rect x="23.5" y="3.5" width="2" height="5" rx="1" fill="white" fillOpacity=".3"/>
              <rect x="2" y="2" width="16" height="8" rx="1.5" fill="#22c55e"/>
            </svg>
          </div>
        </div>

        {/* ════ SCROLLABLE CONTENT ════ */}
        <div className="hf-scroll" style={{
          flex: 1, overflowY: "auto", scrollbarWidth: "none",
          paddingBottom: 78,
        }}>

          {/* ── In der Nähe ── */}
          <div style={{ padding: "10px 14px 0", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>In der Nähe</span>
              <Link href="/nearby" style={{ fontSize: 11, color: "#a855f7", fontWeight: 600, textDecoration: "none" }}>Alle ›</Link>
            </div>
            {NEARBY_PEOPLE.map(p => (
              <Link key={p.id} href={`/profile/${p.id}`} style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "9px 12px",
                background: "rgba(255,255,255,.04)",
                borderRadius: 14, marginBottom: 7,
                border: "1px solid rgba(255,255,255,.055)",
                textDecoration: "none", color: "inherit",
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                  background: `linear-gradient(135deg,${p.color}55,${p.color}22)`,
                  border: "2px solid rgba(168,85,247,.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, color: "#fff", position: "relative",
                }}>
                  {p.initials}
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: "#22c55e", border: "2px solid #08070f" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 1 }}>{p.meta} · {p.dist}</div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,.38)" }}>{p.dist}</span>
                <span style={{ color: "rgba(255,255,255,.18)", fontSize: 15 }}>›</span>
              </Link>
            ))}
          </div>

          {/* ── Begegnungen ── */}
          <div style={{ padding: "0 14px", marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: "#fff" }}>Begegnungen</span>
              <span style={{ fontSize: 11, color: "#a855f7", fontWeight: 600, cursor: "pointer" }}>Alle ›</span>
            </div>

            {/* Summary banner */}
            <div style={{
              display: "flex", alignItems: "center", gap: 11, padding: "11px 14px",
              background: "linear-gradient(135deg,rgba(168,85,247,.12),rgba(99,102,241,.07))",
              borderRadius: 14, marginBottom: 8,
              border: "1px solid rgba(168,85,247,.18)",
            }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(168,85,247,.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="18" height="17" viewBox="0 0 80 72" fill="none">
                  <circle cx="18" cy="13" r="9" fill="#c084fc"/>
                  <path d="M4 36 Q4 27 18 27 Q32 27 32 36" fill="#c084fc"/>
                  <circle cx="62" cy="13" r="9" fill="#c084fc"/>
                  <path d="M48 36 Q48 27 62 27 Q76 27 76 36" fill="#c084fc"/>
                  <path d="M18 4 Q40 -4 62 4" stroke="#c084fc" strokeWidth="4" fill="none" strokeLinecap="round"/>
                  <circle cx="40" cy="40" r="8" fill="#e9d5ff"/>
                  <path d="M34 42 Q34 56 40 61 Q46 56 46 42" fill="#e9d5ff"/>
                  <path d="M6 50 Q6 70 40 70 Q74 70 74 50" stroke="#c084fc" strokeWidth="4" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.72)", flex: 1 }}>
                Heute <strong style={{ color: "#c084fc" }}>3 Begegnungen</strong>
              </div>
              <span style={{ color: "#a855f7", fontSize: 14 }}>›</span>
            </div>

            {ENCOUNTERS.map(e => (
              <Link key={e.id} href={`/profile/${e.id}`} style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "9px 12px",
                background: "rgba(255,255,255,.03)",
                borderRadius: 14, marginBottom: 7,
                border: "1px solid rgba(255,255,255,.04)",
                textDecoration: "none", color: "inherit",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                  background: `linear-gradient(135deg,${e.color}44,${e.color}18)`,
                  border: "2px solid rgba(255,255,255,.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "#fff",
                }}>
                  {e.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{e.name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,.35)", marginTop: 1 }}>{e.place}</div>
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.27)", whiteSpace: "nowrap" }}>{e.time}</span>
              </Link>
            ))}
          </div>

          {/* ── Ad ── */}
          <div style={{
            margin: "0 14px 16px", padding: "12px 14px", borderRadius: 14,
            background: "linear-gradient(135deg,#180430,#2a0d52)",
            border: "1px solid rgba(168,85,247,.18)",
            display: "flex", alignItems: "center", gap: 11,
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 900, color: "#1a0533", flexShrink: 0 }}>
              SWM
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>Stadtwerke München</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.42)", marginTop: 1 }}>Exklusive Angebote in deiner Nähe!</div>
            </div>
            <span style={{ color: "#a855f7", fontSize: 18 }}>›</span>
          </div>

        </div>

        {/* ════ BOTTOM NAV — 5 icons, Circle raised in center ════ */}
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-around",
          background: "rgba(6,5,12,.93)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderTop: "1px solid rgba(255,255,255,.06)",
          paddingTop: 10,
          paddingBottom: "max(14px, env(safe-area-inset-bottom, 14px))",
          paddingLeft: 14, paddingRight: 14,
        }}>
          {/* Nearby */}
          <Link href="/nearby" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 30, color: "rgba(255,255,255,.3)", textDecoration: "none" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65">
              <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
              <line x1="12" y1="12" x2="20" y2="5.5" strokeWidth="1.4"/>
            </svg>
          </Link>

          {/* Matches / Heart */}
          <Link href="/matches" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 30, color: "rgba(255,255,255,.3)", textDecoration: "none" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65">
              <path d="M12 20s-6.5-4.2-8.5-8A5 5 0 0 1 12 6a5 5 0 0 1 8.5 6C18.5 15.8 12 20 12 20Z"/>
            </svg>
          </Link>

          {/* Circle — elevated center button */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: -18 }}>
            <Link href="/circle" style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "linear-gradient(145deg,#b855f7,#7c3aed)",
              display: "flex", alignItems: "center", justifyContent: "center",
              textDecoration: "none",
              boxShadow: "0 8px 22px rgba(168,85,247,.52), 0 0 0 4px rgba(168,85,247,.15)",
            }}>
              <CircleNavSvg />
            </Link>
          </div>

          {/* Chat */}
          <Link href="/chat" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 30, color: "rgba(255,255,255,.3)", textDecoration: "none" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65">
              <path d="M5 6.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"/>
            </svg>
          </Link>

          {/* Profile */}
          <Link href="/profile" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 30, color: "rgba(255,255,255,.3)", textDecoration: "none" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65">
              <circle cx="12" cy="8" r="4"/>
              <path d="M5 20a7 7 0 0 1 14 0"/>
            </svg>
          </Link>
        </nav>

        {/* Notification toast */}
        {toast && (
          <div style={{
            position: "fixed", top: 64, left: "50%", transform: "translateX(-50%)", zIndex: 9999,
            background: "rgba(12,8,28,.95)", border: "1px solid rgba(255,255,255,.12)",
            borderRadius: 16, padding: "11px 20px", fontSize: 13, color: "rgba(255,255,255,.8)",
            backdropFilter: "blur(12px)", whiteSpace: "nowrap",
          }}>
            Keine neuen Benachrichtigungen
          </div>
        )}

      </div>
    </>
  );
}
