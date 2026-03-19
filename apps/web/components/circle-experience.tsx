"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { apiClient } from "@/lib/api-client";
import { useLanguage } from "@/lib/i18n";

type TimeFilter = "24h" | "3d" | "7d" | "1m" | "3m" | "1y";
type ViewMode = "map" | "list";

type GeoState = {
  lat: number;
  lon: number;
  city: string;
};

type Encounter = {
  id: string;
  name: string;
  age: number;
  area: string;
  timeLabel: string;
  distanceLabel: string;
  frequency: string;
  avatar: string;
  latOffset: number;
  lonOffset: number;
  color: string;
};

const filters: { key: TimeFilter; label: string }[] = [
  { key: "24h", label: "24 Std" },
  { key: "3d", label: "3 Tage" },
  { key: "7d", label: "7 Tage" },
  { key: "1m", label: "1 Monat" },
  { key: "3m", label: "3 Monate" },
  { key: "1y", label: "1 Jahr" }
];

const fallbackEncountersByFilter: Record<TimeFilter, Encounter[]> = {
  "24h": [
    {
      id: "maya",
      name: "Maya",
      age: 29,
      area: "Kreuzberg",
      timeLabel: "vor 2-4 Std",
      distanceLabel: "gleiche Gegend",
      frequency: "1 Begegnung",
      avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=500&q=80",
      latOffset: 0.006,
      lonOffset: 0.005,
      color: "#f15bb5"
    },
    {
      id: "noor",
      name: "Noor",
      age: 26,
      area: "Neukoelln",
      timeLabel: "heute Abend",
      distanceLabel: "nah an dir",
      frequency: "2 Signale",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80",
      latOffset: -0.004,
      lonOffset: 0.007,
      color: "#38bdf8"
    }
  ],
  "3d": [
    {
      id: "maya",
      name: "Maya",
      age: 29,
      area: "Kreuzberg",
      timeLabel: "vor 2-4 Std",
      distanceLabel: "gleiche Gegend",
      frequency: "1 Begegnung",
      avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=500&q=80",
      latOffset: 0.006,
      lonOffset: 0.005,
      color: "#f15bb5"
    },
    {
      id: "noor",
      name: "Noor",
      age: 26,
      area: "Neukoelln",
      timeLabel: "gestern Abend",
      distanceLabel: "nah an dir",
      frequency: "2 Signale",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80",
      latOffset: -0.004,
      lonOffset: 0.007,
      color: "#38bdf8"
    },
    {
      id: "lina",
      name: "Lina",
      age: 27,
      area: "Mitte",
      timeLabel: "vor 2 Tagen",
      distanceLabel: "gleicher Bereich",
      frequency: "3 Signale",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
      latOffset: 0.003,
      lonOffset: -0.005,
      color: "#fbbf24"
    }
  ],
  "7d": [
    {
      id: "lina",
      name: "Lina",
      age: 27,
      area: "Mitte",
      timeLabel: "mehrfach diese Woche",
      distanceLabel: "gleicher Bereich",
      frequency: "4 Signale",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
      latOffset: 0.003,
      lonOffset: -0.005,
      color: "#fbbf24"
    },
    {
      id: "maya",
      name: "Maya",
      age: 29,
      area: "Kreuzberg",
      timeLabel: "mehrfach in 7 Tagen",
      distanceLabel: "gleiche Gegend",
      frequency: "3 Signale",
      avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=500&q=80",
      latOffset: 0.006,
      lonOffset: 0.005,
      color: "#f15bb5"
    },
    {
      id: "noor",
      name: "Noor",
      age: 26,
      area: "Neukoelln",
      timeLabel: "diese Woche",
      distanceLabel: "nah an dir",
      frequency: "2 Signale",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80",
      latOffset: -0.004,
      lonOffset: 0.007,
      color: "#38bdf8"
    }
  ],
  "1m": [],
  "3m": [],
  "1y": []
};

const defaultGeo: GeoState = {
  lat: 52.52,
  lon: 13.405,
  city: "Berlin"
};

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

  return { tiles, offsetX, offsetY };
}

function approximateGeo(base: GeoState, encounter: Encounter) {
  return {
    lat: base.lat + encounter.latOffset,
    lon: base.lon + encounter.lonOffset
  };
}

function markerPosition(base: GeoState, point: { lat: number; lon: number }) {
  const latDelta = point.lat - base.lat;
  const lonDelta = point.lon - base.lon;

  return {
    left: `calc(50% + ${lonDelta * 5600}px)`,
    top: `calc(50% - ${latDelta * 7400}px)`
  };
}

export function CircleExperience() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<TimeFilter>("24h");
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [geo, setGeo] = useState<GeoState>(defaultGeo);
  const [zoom, setZoom] = useState(13);
  const [locationState, setLocationState] = useState<"idle" | "locating" | "ready" | "blocked">("idle");
  const [encounters, setEncounters] = useState<Encounter[]>(fallbackEncountersByFilter["24h"]);
  const [encountersLoading, setEncountersLoading] = useState(false);

  const tiles = useMemo(() => buildTileGrid(geo.lat, geo.lon, zoom), [geo.lat, geo.lon, zoom]);

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

          void apiClient.post("/v1/circle/location-events", {
            lat,
            lon,
            accuracyMeters: Math.round(position.coords.accuracy)
          });
        } catch {
          setGeo({ lat, lon, city: defaultGeo.city });
        }

        setLocationState("ready");
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
    let cancelled = false;

    async function loadEncounters() {
      setEncountersLoading(true);

      try {
        const response = await apiClient.get<{
          items: Encounter[];
          meta: {
            window: string;
            total: number;
            approximateCity: string;
          };
        }>(`/v1/circle/encounters?window=${activeFilter}&lat=${geo.lat}&lon=${geo.lon}`);

        if (!cancelled) {
          setEncounters(response.items);
        }
      } catch {
        if (!cancelled) {
          setEncounters(fallbackEncountersByFilter[activeFilter]);
        }
      } finally {
        if (!cancelled) {
          setEncountersLoading(false);
        }
      }
    }

    void loadEncounters();

    return () => {
      cancelled = true;
    };
  }, [activeFilter, geo.lat, geo.lon]);

  return (
    <AppShell active="/circle" title={t.circle} subtitle={t.circleSubtitle}>
      <section className="grid gap-4">
        <div className="glass-card flex items-center gap-2 rounded-[1.6rem] p-2">
          <button
            className={`flex h-11 w-11 items-center justify-center rounded-[1rem] ${viewMode === "list" ? "bg-white/12" : "bg-transparent"}`}
            onClick={() => setViewMode("list")}
            type="button"
          >
            <svg className="h-5 w-5 stroke-[#A855F7]" fill="none" viewBox="0 0 24 24">
              <path d="M8 7h11M8 12h11M8 17h11M4 7h.01M4 12h.01M4 17h.01" strokeWidth="1.8" />
            </svg>
          </button>
          <button
            className={`flex h-11 w-11 items-center justify-center rounded-[1rem] ${viewMode === "map" ? "bg-white/12" : "bg-transparent"}`}
            onClick={() => setViewMode("map")}
            type="button"
          >
            <svg className="h-5 w-5 stroke-[#A855F7]" fill="none" viewBox="0 0 24 24">
              <path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2V6Zm6-2v14m6-12v14" strokeWidth="1.8" />
            </svg>
          </button>

          <div className="ml-1 flex-1 overflow-x-auto">
            <div className="flex min-w-max gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  className={`rounded-[1rem] px-4 py-3 text-sm font-semibold ${
                    activeFilter === filter.key ? "glow-button text-white" : "glass-card text-white/74"
                  }`}
                  onClick={() => setActiveFilter(filter.key)}
                  type="button"
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {viewMode === "map" ? (
          <div className="glass-card relative overflow-hidden rounded-[2.2rem] p-0">
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute left-1/2 top-1/2 grid h-[768px] w-[768px] grid-cols-3"
                style={{
                  transform: `translate(calc(-50% - ${tiles.offsetX}px), calc(-50% - ${tiles.offsetY}px)) scale(1.35)`
                }}
              >
                {tiles.tiles.map((tile) => (
                  <img alt="" className="h-64 w-64 object-cover" key={tile.id} src={tile.url} />
                ))}
              </div>
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,3,8,0.52),rgba(8,6,18,0.86))]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.18),transparent_36%)]" />

            <div className="relative h-[44rem]">
              {encounters.length > 0 ? (
                <>
                  {encounters.map((encounter) => {
                    const point = approximateGeo(geo, encounter);
                    const style = markerPosition(geo, point);

                    return (
                      <button
                        key={encounter.id}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={style}
                        type="button"
                      >
                        <span
                          className="block h-5 w-5 rounded-full border-4 border-[#0c0716] shadow-[0_0_22px_rgba(168,85,247,0.34)]"
                          style={{ backgroundColor: encounter.color }}
                        />
                      </button>
                    );
                  })}

                  <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[6px] border-[#A855F7]/35 bg-[rgba(13,9,24,0.9)] shadow-[0_0_36px_rgba(168,85,247,0.34)]">
                    <svg className="h-10 w-10 stroke-[#C084FC]" fill="none" viewBox="0 0 24 24">
                      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0" strokeWidth="1.8" />
                    </svg>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center text-white">
                  <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full border border-[#A855F7]/35 bg-[rgba(13,9,24,0.84)] shadow-[0_0_36px_rgba(168,85,247,0.3)]">
                    <svg className="h-12 w-12 stroke-[#C084FC]" fill="none" viewBox="0 0 24 24">
                      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0" strokeWidth="1.8" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-semibold">{t.noEncounters}</h2>
                  <p className="mt-3 max-w-sm text-base leading-7 text-white/72">
                    {t.noEncountersDesc}
                  </p>
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="mx-auto max-w-[18rem]">
                  <input
                    aria-label="Circle Zoom"
                    className="h-8 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-3 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-black/35 [&::-webkit-slider-thumb]:mt-[-6px] [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/60 [&::-webkit-slider-thumb]:bg-white [&::-moz-range-track]:h-3 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-black/35 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-white/60 [&::-moz-range-thumb]:bg-white"
                    max="16"
                    min="11"
                    onChange={(event) => setZoom(Number(event.target.value))}
                    step="1"
                    type="range"
                    value={zoom}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-sm text-white/72">
                  <span>
                    {locationState === "locating"
                      ? t.detectingLocation
                      : locationState === "blocked"
                        ? t.locationBlocked
                        : t.locationDetected.replace("{city}", geo.city)}
                  </span>
                  <span>{encountersLoading ? t.loading : "OSM · Nominatim"}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {encounters.length > 0 ? (
              encounters.map((encounter) => (
                <article key={encounter.id} className="glass-card rounded-[1.8rem] p-4 text-white">
                  <div className="flex items-start gap-4">
                    <img alt={encounter.name} className="h-16 w-16 rounded-[1.1rem] object-cover" src={encounter.avatar} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-lg font-semibold">{encounter.name}, {encounter.age}</div>
                          <div className="mt-1 text-sm text-white/68">{encounter.area} · {encounter.timeLabel}</div>
                        </div>
                        <span
                          className="rounded-full px-3 py-1 text-[11px] font-semibold"
                          style={{ backgroundColor: `${encounter.color}25`, color: encounter.color }}
                        >
                          {encounter.frequency}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-white/74">
                        <div className="rounded-[1rem] bg-white/8 px-3 py-2">{t.seenIn.replace("{area}", encounter.area)}</div>
                        <div className="rounded-[1rem] bg-white/8 px-3 py-2">{t.timeWindow.replace("{time}", encounter.timeLabel)}</div>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-white/72">
                        {t.blurredEncounter}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="glass-card rounded-[2rem] p-6 text-center text-white">
                <h2 className="text-2xl font-semibold">{t.noEncountersPeriod}</h2>
                <p className="mt-3 text-sm leading-6 text-white/72">
                  {t.noEncountersPeriodDesc}
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </AppShell>
  );
}
