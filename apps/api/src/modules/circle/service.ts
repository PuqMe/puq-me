import type { ListEncountersQuery, LocationEventBody } from "./schema.js";

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
  encounterScore: number;
  lastSeenAt: string;
};

type Persona = {
  id: string;
  name: string;
  age: number;
  area: string;
  avatar: string;
  lat: number;
  lon: number;
  color: string;
  encounterBase: number;
};

const demoCirclePersonas: Persona[] = [
  {
    id: "maya",
    name: "Maya",
    age: 29,
    area: "Kreuzberg",
    avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=500&q=80",
    lat: 52.5055,
    lon: 13.403,
    color: "#f15bb5",
    encounterBase: 86
  },
  {
    id: "noor",
    name: "Noor",
    age: 26,
    area: "Neukoelln",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=500&q=80",
    lat: 52.476,
    lon: 13.435,
    color: "#38bdf8",
    encounterBase: 78
  },
  {
    id: "lina",
    name: "Lina",
    age: 27,
    area: "Mitte",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
    lat: 52.5217,
    lon: 13.3862,
    color: "#fbbf24",
    encounterBase: 92
  },
  {
    id: "sara",
    name: "Sara",
    age: 31,
    area: "Prenzlauer Berg",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
    lat: 52.5421,
    lon: 13.4248,
    color: "#22c55e",
    encounterBase: 69
  }
];

const locationEvents: Array<{ lat: number; lon: number; accuracyMeters: number; capturedAt: string }> = [];

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusKm = 6371;
  const latDelta = toRadians(lat2 - lat1);
  const lonDelta = toRadians(lon2 - lon1);
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(lonDelta / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getWindowHours(windowKey: ListEncountersQuery["window"]) {
  if (windowKey === "24h") return 24;
  if (windowKey === "3d") return 72;
  if (windowKey === "7d") return 24 * 7;
  if (windowKey === "1m") return 24 * 30;
  if (windowKey === "3m") return 24 * 90;
  return 24 * 365;
}

function buildTimeLabel(hoursAgo: number) {
  if (hoursAgo <= 4) return "vor 2-4 Std";
  if (hoursAgo <= 12) return "heute Abend";
  if (hoursAgo <= 24) return "heute";
  if (hoursAgo <= 48) return "gestern Abend";
  if (hoursAgo <= 24 * 7) return "diese Woche";
  if (hoursAgo <= 24 * 30) return "diesen Monat";
  return "vor einiger Zeit";
}

function buildFrequencyLabel(score: number) {
  if (score >= 90) return "4 Signale";
  if (score >= 80) return "3 Signale";
  if (score >= 70) return "2 Signale";
  return "1 Begegnung";
}

function buildDistanceLabel(distanceKm: number) {
  if (distanceKm <= 0.8) return "gleiche Gegend";
  if (distanceKm <= 1.8) return "nah an dir";
  if (distanceKm <= 3) return "gleicher Bereich";
  return "im weiteren Umfeld";
}

export class CircleService {
  listEncounters(query: ListEncountersQuery) {
    const now = Date.now();
    const windowHours = getWindowHours(query.window);

    const items = demoCirclePersonas
      .map((persona, index) => {
        const distanceKm = haversineDistanceKm(query.lat, query.lon, persona.lat, persona.lon);
        const hoursAgo = Math.min(windowHours, 2 + index * (windowHours / 5 || 1));
        const encounterScore = Math.max(0, Math.round(persona.encounterBase - distanceKm * 8));

        if (distanceKm > Math.max(4.5, windowHours / 24 + 2.5)) {
          return null;
        }

        const encounter: Encounter = {
          id: persona.id,
          name: persona.name,
          age: persona.age,
          area: persona.area,
          timeLabel: buildTimeLabel(hoursAgo),
          distanceLabel: buildDistanceLabel(distanceKm),
          frequency: buildFrequencyLabel(encounterScore),
          avatar: persona.avatar,
          latOffset: persona.lat - query.lat,
          lonOffset: persona.lon - query.lon,
          color: persona.color,
          encounterScore,
          lastSeenAt: new Date(now - hoursAgo * 60 * 60 * 1000).toISOString()
        };

        return encounter;
      })
      .filter((item): item is Encounter => Boolean(item))
      .sort((left, right) => right.encounterScore - left.encounterScore);

    return {
      items,
      meta: {
        window: query.window,
        total: items.length,
        approximateCity: "Aktuelle Umgebung",
        source: locationEvents.length > 0 ? "location-events" : "seeded-zones"
      }
    };
  }

  storeLocationEvent(payload: LocationEventBody) {
    locationEvents.push({
      lat: payload.lat,
      lon: payload.lon,
      accuracyMeters: payload.accuracyMeters,
      capturedAt: new Date().toISOString()
    });

    return {
      stored: true,
      zoneLabel: "Grobe Begegnungszone gespeichert",
      totalEvents: locationEvents.length
    };
  }
}
