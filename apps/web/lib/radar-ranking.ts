export type RadarMetrics = {
  totalWatchMs: number;
  opens: number;
  likes: number;
  skips: number;
  score: number;
  lastSeenAt: string | null;
};

export type RadarMetricsMap = Record<string, RadarMetrics>;

export type RadarCandidate = {
  id: string;
};

const storageKey = "puqme.radar.metrics.v1";

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export function defaultRadarMetrics(): RadarMetrics {
  return {
    totalWatchMs: 0,
    opens: 0,
    likes: 0,
    skips: 0,
    score: 50,
    lastSeenAt: null
  };
}

export function loadRadarMetrics(): RadarMetricsMap {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(storageKey);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as RadarMetricsMap;
  } catch {
    return {};
  }
}

export function saveRadarMetrics(metrics: RadarMetricsMap) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(metrics));
}

function watchTimeScore(totalWatchMs: number) {
  const seconds = totalWatchMs / 1000;

  if (seconds <= 3) return 10;
  if (seconds <= 8) return 30;
  if (seconds <= 15) return 50;
  if (seconds <= 25) return 72;
  if (seconds <= 40) return 86;
  return 95;
}

export function calculateRadarScore(metrics: RadarMetrics) {
  const watchScore = watchTimeScore(metrics.totalWatchMs);
  const likeScore = metrics.likes * 18;
  const openScore = metrics.opens * 6;
  const skipPenalty = metrics.skips * 10;

  return clamp(Math.round(22 + watchScore * 0.55 + likeScore + openScore - skipPenalty));
}

export function updateRadarMetrics(
  metricsMap: RadarMetricsMap,
  profileId: string,
  update: {
    watchMs?: number;
    opened?: boolean;
    liked?: boolean;
    skipped?: boolean;
  }
) {
  const current = metricsMap[profileId] ?? defaultRadarMetrics();
  const next: RadarMetrics = {
    totalWatchMs: current.totalWatchMs + (update.watchMs ?? 0),
    opens: current.opens + (update.opened ? 1 : 0),
    likes: current.likes + (update.liked ? 1 : 0),
    skips: current.skips + (update.skipped ? 1 : 0),
    score: current.score,
    lastSeenAt: new Date().toISOString()
  };

  next.score = calculateRadarScore(next);

  return {
    ...metricsMap,
    [profileId]: next
  };
}

export function personalizeRadarFeed<T extends RadarCandidate>(candidates: T[], metricsMap: RadarMetricsMap) {
  return [...candidates].sort((left, right) => {
    const leftScore = metricsMap[left.id]?.score ?? 50;
    const rightScore = metricsMap[right.id]?.score ?? 50;

    if (leftScore === rightScore) {
      return left.id.localeCompare(right.id);
    }

    return rightScore - leftScore;
  });
}
