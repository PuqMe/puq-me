"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import {
  defaultRadarMetrics,
  loadRadarMetrics,
  personalizeRadarFeed,
  saveRadarMetrics,
  updateRadarMetrics
} from "@/lib/radar-ranking";

type RadarProfile = {
  id: string;
  name: string;
  age: number;
  city: string;
  distance: string;
  tagline: string;
  vibe: string;
  availability: string;
  avatar: string;
  accent: string;
};

type RadarPing = {
  id: string;
  orbit: number;
  angle: number;
  size: number;
  color: "pink" | "blue" | "gold" | "star";
};

type GeoState = {
  lat: number;
  lon: number;
  city: string;
};

const profiles: RadarProfile[] = [
  {
    id: "1",
    name: "Lina",
    age: 27,
    city: "Berlin",
    distance: "3 km",
    tagline: "Fruehe Laeufe, starke Meinungen zu Design und Dinner-Spots mit Stil.",
    vibe: "Design dates",
    availability: "Heute Abend",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
    accent: "#f15bb5"
  },
  {
    id: "2",
    name: "Maya",
    age: 29,
    city: "Hamburg",
    distance: "7 km",
    tagline: "Keramikstudio tagsueber, Jazzbars nachts, neugierig auf echte Gespraeche.",
    vibe: "Low-key chats",
    availability: "Wochenende",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=500&q=80",
    accent: "#38bdf8"
  },
  {
    id: "3",
    name: "Noor",
    age: 26,
    city: "Munich",
    distance: "11 km",
    tagline: "Espresso, Museen und spontane Stadtwege mit gutem Tempo.",
    vibe: "Museum walks",
    availability: "Nach Feierabend",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80",
    accent: "#fbbf24"
  }
];

const radarPings: RadarPing[] = [
  { id: "p1", orbit: 124, angle: -20, size: 18, color: "pink" },
  { id: "p2", orbit: 146, angle: 22, size: 18, color: "blue" },
  { id: "p3", orbit: 132, angle: 58, size: 16, color: "gold" },
  { id: "p4", orbit: 118, angle: 94, size: 18, color: "blue" },
  { id: "p5", orbit: 138, angle: 128, size: 18, color: "pink" },
  { id: "p6", orbit: 152, angle: 160, size: 16, color: "gold" },
  { id: "p7", orbit: 120, angle: 196, size: 18, color: "pink" },
  { id: "p8", orbit: 146, angle: 228, size: 18, color: "blue" },
  { id: "p9", orbit: 132, angle: 258, size: 18, color: "pink" },
  { id: "p10", orbit: 148, angle: 292, size: 16, color: "blue" },
  { id: "p11", orbit: 116, angle: 322, size: 18, color: "pink" },
  { id: "p12", orbit: 78, angle: 312, size: 22, color: "star" },
  { id: "p13", orbit: 98, angle: 126, size: 22, color: "star" }
];

const defaultGeo: GeoState = {
  lat: 52.52,
  lon: 13.405,
  city: "Berlin"
};

function polarToStyle(orbit: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  const x = Math.cos(radians) * orbit;
  const y = Math.sin(radians) * orbit;

  return {
    left: `calc(50% + ${x}px)`,
    top: `calc(50% + ${y}px)`
  };
}

function pingClass(color: RadarPing["color"]) {
  if (color === "blue") return "bg-[#38bdf8]";
  if (color === "gold") return "bg-[#fbbf24]";
  if (color === "star") return "bg-transparent";
  return "bg-[#f15bb5]";
}

function lonToTileX(lon: number, zoom: number) {
  return ((lon + 180) / 360) * 2 ** zoom;
}

function latToTileY(lat: number, zoom: number) {
  const latRad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 2 ** zoom;
}

function buildTileGrid(lat: number, lon: number, zoom: number) {
  const tileX = lonToTileX(lon, zoom);
  const tileY = latToTileY(lat, zoom);
  const baseX = Math.floor(tileX);
  const baseY = Math.floor(tileY);
  const offsetX = (tileX - baseX) * 256;
  const offsetY = (tileY - baseY) * 256;
  const worldSize = 2 ** zoom;

  const tiles = [];

  for (let row = -1; row <= 1; row += 1) {
    for (let col = -1; col <= 1; col += 1) {
      const wrappedX = (baseX + col + worldSize) % worldSize;
      const y = Math.min(Math.max(baseY + row, 0), worldSize - 1);

      tiles.push({
        id: `${zoom}-${wrappedX}-${y}`,
        url: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`
      });
    }
  }

  return {
    tiles,
    offsetX,
    offsetY
  };
}

function RadarStar({ size }: { size: number }) {
  return (
    <svg height={size} viewBox="0 0 24 24" width={size}>
      <path
        d="m12 2.8 2.9 5.88 6.5.95-4.7 4.58 1.1 6.49L12 17.6l-5.8 3.1 1.1-6.49-4.7-4.58 6.5-.95Z"
        fill="#fbbf24"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="0.8"
      />
    </svg>
  );
}

export function SwipeExperience() {
  const [orderedProfiles, setOrderedProfiles] = useState(profiles);
  const [index, setIndex] = useState(0);
  const [geo, setGeo] = useState<GeoState>(defaultGeo);
  const [locationState, setLocationState] = useState<"idle" | "locating" | "ready" | "blocked">("idle");
  const [zoom, setZoom] = useState(13);
  const watchStartedAtRef = useRef<number>(Date.now());

  const current = orderedProfiles[index % orderedProfiles.length];
  const next = orderedProfiles[(index + 1) % orderedProfiles.length];
  const currentMetrics = useMemo(() => {
    const metricsMap = loadRadarMetrics();
    return metricsMap[current.id] ?? defaultRadarMetrics();
  }, [current.id, index]);

  const highlightedPings = useMemo(
    () =>
      radarPings.map((ping, pingIndex) => ({
        ...ping,
        active: pingIndex % profiles.length === index % profiles.length
      })),
    [index]
  );

  const mapTiles = useMemo(() => buildTileGrid(geo.lat, geo.lon, zoom), [geo.lat, geo.lon]);

  useEffect(() => {
    const metricsMap = loadRadarMetrics();
    setOrderedProfiles(personalizeRadarFeed(profiles, metricsMap));
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationState("blocked");
      return;
    }

    setLocationState("locating");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=13&accept-language=de`
          );

          if (!response.ok) {
            throw new Error("reverse_geocode_failed");
          }

          const data = (await response.json()) as {
            address?: {
              city?: string;
              town?: string;
              village?: string;
              municipality?: string;
            };
          };

          setGeo({
            lat,
            lon,
            city:
              data.address?.city ??
              data.address?.town ??
              data.address?.village ??
              data.address?.municipality ??
              defaultGeo.city
          });
          setLocationState("ready");
        } catch {
          setGeo({
            lat,
            lon,
            city: defaultGeo.city
          });
          setLocationState("ready");
        }
      },
      () => {
        setLocationState("blocked");
      },
      {
        enableHighAccuracy: false,
        timeout: 6000,
        maximumAge: 300000
      }
    );
  }, []);

  useEffect(() => {
    watchStartedAtRef.current = Date.now();

    return () => {
      const watchedMs = Date.now() - watchStartedAtRef.current;
      const metricsMap = loadRadarMetrics();
      const nextMetrics = updateRadarMetrics(metricsMap, current.id, {
        watchMs: watchedMs,
        opened: true
      });
      saveRadarMetrics(nextMetrics);
    };
  }, [current.id]);

  function cycle(direction: "left" | "right") {
    const watchedMs = Date.now() - watchStartedAtRef.current;
    const metricsMap = loadRadarMetrics();
    const nextMetrics = updateRadarMetrics(metricsMap, current.id, {
      watchMs: watchedMs,
      opened: true,
      liked: direction === "right",
      skipped: direction === "left"
    });

    saveRadarMetrics(nextMetrics);

    const personalizedProfiles = personalizeRadarFeed(profiles, nextMetrics);
    const currentPosition = personalizedProfiles.findIndex((profile) => profile.id === current.id);
    const nextIndex =
      direction === "right"
        ? (currentPosition + 1) % personalizedProfiles.length
        : (currentPosition + personalizedProfiles.length - 1) % personalizedProfiles.length;

    setOrderedProfiles(personalizedProfiles);
    setIndex(nextIndex);
    watchStartedAtRef.current = Date.now();
  }

  return (
    <AppShell active="/discover" title="Radar" subtitle="Sieh Menschen in deiner Naehe direkt auf der Karte und oeffne ihr Profil ohne Umwege">
      <section className="grid gap-4">
        <div className="glass-card rounded-[1.75rem] p-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Live in {geo.city}</div>
              <p className="mt-1 text-sm leading-5 text-white/70">Watch-Time, Likes und Skips formen deinen persoenlichen Radar-Feed in Echtzeit.</p>
            </div>
            <div className="soft-pill rounded-full px-3 py-1.5 text-[11px] font-semibold">{profiles.length} aktiv</div>
          </div>
        </div>

        <div className="glass-card relative overflow-hidden rounded-[2rem] p-4">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute left-1/2 top-1/2 grid h-[768px] w-[768px] grid-cols-3"
              style={{
                transform: `translate(calc(-50% - ${mapTiles.offsetX}px), calc(-50% - ${mapTiles.offsetY}px)) scale(1.25)`
              }}
            >
              {mapTiles.tiles.map((tile) => (
                <img alt="" className="h-64 w-64 object-cover" key={tile.id} src={tile.url} />
              ))}
            </div>
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,113,248,0.12),rgba(91,33,182,0.55))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14),transparent_36%),linear-gradient(180deg,rgba(14,7,30,0.12),rgba(14,7,30,0.48))]" />

          <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
            <div className="absolute inset-0 rounded-full border border-white/12 bg-[rgba(10,7,20,0.24)]" />
            <div className="absolute inset-[14%] rounded-full border border-white/10" />
            <div className="absolute inset-[29%] rounded-full border border-white/10" />
            <div className="absolute inset-[43%] rounded-full border border-white/10" />

            <div className="absolute inset-0">
              <div className="absolute bottom-1/2 left-0 right-0 h-px bg-white/10" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-white/10" />
              <div className="absolute inset-0 rotate-45">
                <div className="absolute bottom-1/2 left-0 right-0 h-px bg-white/8" />
              </div>
              <div className="absolute inset-0 -rotate-45">
                <div className="absolute bottom-1/2 left-0 right-0 h-px bg-white/8" />
              </div>
            </div>

            <div className="absolute inset-0">
              <div className="absolute bottom-0 left-1/2 h-1/2 w-1/2 -translate-x-1/2 rounded-br-[100%] bg-[rgba(236,72,153,0.34)] blur-[1px]" />
            </div>

            {highlightedPings.map((ping) => (
              <div
                key={ping.id}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={polarToStyle(ping.orbit, ping.angle)}
              >
                {ping.color === "star" ? (
                  <div className={`${ping.active ? "scale-110" : "opacity-80"} transition`}>
                    <RadarStar size={ping.size} />
                  </div>
                ) : (
                  <div
                    className={`${pingClass(ping.color)} rounded-full shadow-[0_0_22px_rgba(255,255,255,0.18)] transition ${
                      ping.active ? "scale-110 ring-4 ring-white/12" : "opacity-90"
                    }`}
                    style={{ width: ping.size, height: ping.size }}
                  />
                )}
              </div>
            ))}

            <div className="absolute left-1/2 top-1/2 flex h-[6.5rem] w-[6.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[6px] border-[#f08ad9]/35 bg-[rgba(255,255,255,0.08)] p-1 shadow-[0_0_28px_rgba(168,85,247,0.28)] backdrop-blur-xl">
              <div className="h-full w-full overflow-hidden rounded-full border border-white/40">
                <img alt={current.name} className="h-full w-full object-cover" src={current.avatar} />
              </div>
            </div>

            <div className="absolute bottom-3 left-1/2 flex w-[12rem] -translate-x-1/2 items-center gap-3">
              <span className="h-3 flex-1 rounded-full bg-black/35" />
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/16 bg-black/45">
                <span className="h-4 w-4 rounded-full bg-white/70" />
              </span>
              <span className="h-3 flex-1 rounded-full bg-black/35" />
            </div>
          </div>

          <div className="relative mt-4 px-3">
            <div className="mx-auto flex max-w-[19rem] items-center gap-3">
              <span className="text-[11px] font-semibold text-white/52">weit</span>
              <div className="relative flex-1">
                <div className="absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-black/35" />
                <div
                  className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#f15bb5]/70"
                  style={{ width: `${((zoom - 11) / 5) * 100}%` }}
                />
                <input
                  aria-label="Radar-Zoom"
                  className="relative z-10 h-8 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/60 [&::-webkit-slider-thumb]:bg-white [&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-white/60 [&::-moz-range-thumb]:bg-white"
                  max="16"
                  min="11"
                  onChange={(event) => setZoom(Number(event.target.value))}
                  step="1"
                  type="range"
                  value={zoom}
                />
              </div>
              <span className="text-[11px] font-semibold text-white/52">nah</span>
            </div>
          </div>

          <div className="relative mt-2 flex items-center justify-between text-[11px] text-white/62">
            <span>{locationState === "locating" ? "Standort wird erkannt..." : locationState === "blocked" ? "Standort nicht freigegeben" : `Ort erkannt: ${geo.city}`}</span>
            <span>OSM · Nominatim</span>
          </div>
        </div>

        <div className="mesh-panel glass-card rounded-[2rem] p-4 text-white">
          <div className="flex items-start gap-4">
            <div className="h-20 w-16 overflow-hidden rounded-[1.2rem] border border-white/16">
              <img alt={current.name} className="h-full w-full object-cover" src={current.avatar} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xl font-semibold">{current.name}, {current.age}</div>
                  <div className="mt-1 text-sm text-white/68">{current.city} · {current.distance}</div>
                </div>
                <div className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ backgroundColor: `${current.accent}2E`, color: current.accent }}>
                  {current.availability}
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-white/74">{current.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium">
                <span className="rounded-full bg-white/10 px-3 py-1.5">{current.vibe}</span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">Radar pick</span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">Nahe jetzt</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-medium">
              <div className="rounded-[1rem] bg-white/8 px-3 py-3 text-white/84">
                <div className="text-white/55">Watch-Time</div>
                <div className="mt-1 text-sm font-semibold">{Math.round(currentMetrics.totalWatchMs / 1000)}s</div>
              </div>
              <div className="rounded-[1rem] bg-white/8 px-3 py-3 text-white/84">
                <div className="text-white/55">Score</div>
                <div className="mt-1 text-sm font-semibold">{currentMetrics.score}</div>
              </div>
              <div className="rounded-[1rem] bg-white/8 px-3 py-3 text-white/84">
                <div className="text-white/55">Likes</div>
                <div className="mt-1 text-sm font-semibold">{currentMetrics.likes}</div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-[1.25rem] bg-black/18 px-3 py-3 text-sm text-white/76">
            <span>Naechster Vorschlag: {next.name}</span>
            <span className="text-[#f15bb5]">●</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr,1.3fr] gap-3">
          <button className="glass-card rounded-[1.35rem] px-4 py-4 text-sm font-semibold text-white" onClick={() => cycle("left")}>
            Vorheriger Ping
          </button>
          <button className="glow-button rounded-[1.35rem] px-4 py-4 text-sm font-semibold text-white" onClick={() => cycle("right")}>
            Naechstes Profil
          </button>
        </div>
      </section>
    </AppShell>
  );
}
