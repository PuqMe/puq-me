"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { LogoMark } from "@puqme/ui";
import { BRAND_NAME } from "@puqme/config";

interface LocationInfo {
  lat: number;
  lng: number;
  displayName: string;
}

const TIME_FILTERS = ["24 Std", "3 Tage", "7 Tage", "1 Monat", "3 Monate", "6 Monate", "1 Jahr"];

const NEARBY = [
  { id: "u1", emoji: "😊", name: "Alex, 28",   dist: "1.8 km", off: [ 0.012,  0.018] },
  { id: "u2", emoji: "🎵", name: "Jordan, 26", dist: "2.4 km", off: [-0.009,  0.021] },
  { id: "u3", emoji: "🌟", name: "Casey, 30",  dist: "3.1 km", off: [ 0.017, -0.013] },
  { id: "u4", emoji: "🎨", name: "Morgan, 27", dist: "3.8 km", off: [-0.020, -0.016] },
  { id: "u5", emoji: "🎮", name: "Riley, 25",  dist: "4.5 km", off: [ 0.006, -0.024] },
];

const NAV_ITEMS = [
  { href: "/radar",   icon: "radar" },
  { href: "/circle",  icon: "circle" },
  { href: "/matches", icon: "heart" },
  { href: "/chat",    icon: "chat" },
  { href: "/profile", icon: "user" },
  { href: "/settings",icon: "grid" },
];

function Icon({ type, size = 20 }: { type: string; size?: number }) {
  const s = size;
  if (type === "radar")   return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><line x1="12" y1="12" x2="20" y2="5.5" strokeWidth="1.4"/></svg>;
  if (type === "heart")   return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 20s-6.5-4.2-8.5-8A5 5 0 0 1 12 6a5 5 0 0 1 8.5 6C18.5 15.8 12 20 12 20Z"/></svg>;
  if (type === "chat")    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 6.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"/></svg>;
  if (type === "user")    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>;
  if (type === "grid")    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></svg>;
  if (type === "circle")  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></svg>;
  if (type === "map")     return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>;
  if (type === "eye")     return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><ellipse cx="12" cy="12" rx="8" ry="5.5"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/></svg>;
  if (type === "clock")   return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>;
  if (type === "share")   return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
  if (type === "plus")    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
  if (type === "search")  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>;
  if (type === "bell")    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
  if (type === "menu")    return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
  if (type === "layers")  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
  if (type === "crosshair") return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="7"/><line x1="12" y1="17" x2="12" y2="21"/><line x1="3" y1="12" x2="7" y2="12"/><line x1="17" y1="12" x2="21" y2="12"/></svg>;
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="7"/></svg>;
}

export function RadarMap() {
  const mapRef     = useRef<HTMLDivElement>(null);
  const mapObjRef  = useRef<any>(null);
  const [ready,    setReady]      = useState(false);
  const [location, setLocation]   = useState<LocationInfo>({ lat: 48.1351, lng: 11.582, displayName: "München" });
  const [activeTime, setActiveTime] = useState("24 Std");
  const [menuOpen,   setMenuOpen]   = useState(false);

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

    /* Ultra-dark tile */
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19, minZoom: 1, subdomains: "abcd",
    }).addTo(map);

    L.control.attribution({ prefix: false, position: "bottomright" })
      .addAttribution('© <a href="https://openstreetmap.org/copyright" style="color:#7c3aed;opacity:.5">OSM</a>')
      .addTo(map);

    /* Self marker – pulsing ring */
    const selfIcon = L.divIcon({
      html: `<div style="position:relative;width:48px;height:48px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:rgba(124,58,237,.18);animation:rping 2s ease-out infinite;"></div>
        <div style="position:absolute;inset:8px;border-radius:50%;background:rgba(124,58,237,.28);animation:rping 2s ease-out infinite .4s;"></div>
        <div style="position:absolute;inset:16px;border-radius:50%;background:#7c3aed;box-shadow:0 0 16px rgba(124,58,237,.9);"></div>
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
        html: `<div style="width:40px;height:40px;border-radius:50%;background:rgba(8,5,18,.9);border:2px solid rgba(124,58,237,.7);box-shadow:0 2px 12px rgba(0,0,0,.6),0 0 0 1px rgba(124,58,237,.12);display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;">${u.emoji}</div>`,
        className: "", iconSize: [40, 40], iconAnchor: [20, 20],
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

  function handleLocate() {
    if (mapObjRef.current) mapObjRef.current.setView([location.lat, location.lng], 15);
  }
  function handleZoomIn()  { if (mapObjRef.current) mapObjRef.current.zoomIn(); }
  function handleZoomOut() { if (mapObjRef.current) mapObjRef.current.zoomOut(); }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#060410]">
      {/* ── MAP ── */}
      <div
        ref={mapRef}
        className="absolute inset-0"
        style={{ filter: "brightness(0.75) contrast(1.1)" }}
      />

      {/* Loading */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#060410] z-10">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#7c3aed] border-t-transparent" />
            <p className="mt-2 text-xs text-white/40">Karte lädt…</p>
          </div>
        </div>
      )}

      {/* ── TOP HEADER BAR ── */}
      <div
        className="pointer-events-auto absolute left-0 right-0 top-0 z-20 flex items-center gap-2 px-3 py-2"
        style={{ background: "linear-gradient(180deg, rgba(6,4,16,.92) 0%, rgba(6,4,16,.7) 70%, transparent 100%)", paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
      >
        {/* Logo + title */}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <LogoMark className="h-5 w-5 shrink-0 text-[#7c3aed]" size={20} />
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 leading-none">
              <span className="text-[13px] font-bold text-white tracking-tight">{BRAND_NAME}</span>
              <span className="text-[13px] font-light text-white/80">Circle</span>
            </div>
            <div className="text-[10px] text-white/45 tracking-wide mt-0.5">Deine Begegnungen</div>
          </div>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-0.5 text-white/60">
          {[
            { type: "map",    label: "Karte" },
            { type: "eye",    label: "Sehen" },
            { type: "clock",  label: "Verlauf" },
            { type: "share",  label: "Teilen" },
            { type: "plus",   label: "Neu" },
            { type: "search", label: "Suchen" },
            { type: "bell",   label: "Notifications" },
          ].map(({ type, label }) => (
            <button key={type} aria-label={label}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors">
              <Icon type={type} size={18} />
            </button>
          ))}
          {/* Hamburger / menu */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/70"
          >
            <Icon type="menu" size={18} />
          </button>
        </div>
      </div>

      {/* ── TIME FILTER BAR ── */}
      <div
        className="pointer-events-auto absolute left-0 right-0 z-20 flex items-center gap-2 overflow-x-auto px-3 py-1.5 scrollbar-hide"
        style={{ top: "max(3.6rem, calc(env(safe-area-inset-top) + 3.1rem))" }}
      >
        {/* Map-icon pill (active) */}
        <button className="flex shrink-0 items-center justify-center h-8 w-8 rounded-full bg-[#7c3aed] text-white shadow-lg shadow-purple-900/40">
          <Icon type="map" size={16} />
        </button>

        {TIME_FILTERS.map(t => (
          <button
            key={t}
            onClick={() => setActiveTime(t)}
            className={clsx(
              "shrink-0 rounded-full px-3.5 py-1 text-[12px] font-medium transition-all",
              activeTime === t
                ? "bg-[#7c3aed] text-white shadow-lg shadow-purple-900/40"
                : "bg-white/8 text-white/65 hover:bg-white/15"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── RIGHT CONTROLS ── */}
      <div className="pointer-events-auto absolute right-3 z-20 flex flex-col items-center gap-2"
        style={{ top: "max(8rem, calc(env(safe-area-inset-top) + 7.5rem))" }}
      >
        {/* User count */}
        <button className="flex flex-col items-center justify-center h-11 w-11 rounded-full bg-[#0d0b1a]/80 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-colors shadow-lg">
          <Icon type="user" size={18} />
          <span className="text-[9px] text-white/50 mt-0.5 leading-none">{NEARBY.length}</span>
        </button>

        {/* Crosshair / locate */}
        <button
          onClick={handleLocate}
          className="flex items-center justify-center h-11 w-11 rounded-full bg-[#0d0b1a]/80 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-colors shadow-lg"
        >
          <Icon type="crosshair" size={20} />
        </button>

        {/* Zoom + */}
        <button
          onClick={handleZoomIn}
          className="flex items-center justify-center h-11 w-11 rounded-full bg-[#0d0b1a]/80 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-colors shadow-lg text-xl font-light"
        >
          +
        </button>

        {/* Zoom − */}
        <button
          onClick={handleZoomOut}
          className="flex items-center justify-center h-11 w-11 rounded-full bg-[#0d0b1a]/80 backdrop-blur-md border border-white/10 text-white/70 hover:text-white transition-colors shadow-lg text-xl font-light"
        >
          −
        </button>
      </div>

      {/* ── BOTTOM LEFT: EBENEN ── */}
      <div className="pointer-events-auto absolute left-3 z-20"
        style={{ bottom: "max(5rem, calc(env(safe-area-inset-bottom) + 4.5rem))" }}
      >
        <button className="flex items-center gap-1.5 rounded-full bg-[#0d0b1a]/80 backdrop-blur-md border border-white/10 px-3 py-2 text-[11px] font-semibold tracking-widest text-white/60 hover:text-white uppercase transition-colors shadow-lg">
          <Icon type="layers" size={14} />
          EBENEN
        </button>
      </div>

      {/* ── BOTTOM CENTER: status pill ── */}
      <div className="pointer-events-none absolute left-0 right-0 z-20 flex justify-center"
        style={{ bottom: "max(5rem, calc(env(safe-area-inset-bottom) + 4.5rem))" }}
      >
        <div className="flex items-center gap-2 rounded-full bg-[#0d0b1a]/80 backdrop-blur-md border border-white/10 px-4 py-2 text-[11px] font-semibold tracking-widest text-white/70 uppercase shadow-lg">
          <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed] animate-pulse" />
          INTERAKTIVE KARTE AKTIV
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <nav className="pointer-events-auto absolute bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-white/8 bg-[#08070f]/85 pt-2 backdrop-blur-xl"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex flex-col items-center justify-center p-1.5 transition-all",
              item.href === "/radar" ? "text-[#7c3aed]" : "text-white/35 hover:text-white/70"
            )}
          >
            <Icon type={item.icon} size={22} />
            {item.href === "/radar" && (
              <span className="mt-0.5 h-1 w-1 rounded-full bg-[#7c3aed]" />
            )}
          </Link>
        ))}
      </nav>

      {/* ── Mobile slide-in menu ── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute right-3 top-3 w-52 rounded-[1.5rem] border border-white/10 bg-[#0d0b1a]/95 backdrop-blur-xl p-3 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between px-2">
              <span className="text-[10px] uppercase tracking-widest text-white/40">{BRAND_NAME}</span>
              <button type="button" onClick={() => setMenuOpen(false)} className="text-white/40 hover:text-white">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="grid gap-0.5">
              {NAV_ITEMS.map(item => (
                <Link key={item.href} href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={clsx(
                    "flex items-center gap-3 rounded-[1rem] px-3 py-2.5 text-sm font-medium transition",
                    item.href === "/radar" ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/6 hover:text-white"
                  )}
                >
                  <Icon type={item.icon} size={18} />
                  <span className="capitalize">{item.href.replace("/", "")}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Radar sweep style */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
