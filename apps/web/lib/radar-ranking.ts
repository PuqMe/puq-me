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

// ── Enhanced Engagement Scoring ──

export type EngagementSignals = {
  watchTimeMs: number;
  opens: number;
  likes: number;
  skips: number;
  waves: number;
  messages: number;
  mutualEncounters: number;
  sharedInterests: number;
  distanceKm: number;
  recencyHours: number;
};

// Decay function: recent interactions weighted more heavily
function recencyDecay(hoursAgo: number): number {
  if (hoursAgo <= 1) return 1.0;
  if (hoursAgo <= 6) return 0.9;
  if (hoursAgo <= 24) return 0.75;
  if (hoursAgo <= 72) return 0.5;
  if (hoursAgo <= 168) return 0.3;
  return 0.1;
}

// Distance boost: closer users ranked higher
function distanceBoost(km: number): number {
  if (km <= 0.5) return 1.0;
  if (km <= 1) return 0.9;
  if (km <= 3) return 0.75;
  if (km <= 10) return 0.5;
  if (km <= 50) return 0.3;
  return 0.1;
}

// Interest overlap multiplier
function interestMultiplier(sharedCount: number): number {
  return Math.min(1 + sharedCount * 0.15, 2.0);
}

export function calculateEngagementScore(signals: EngagementSignals): number {
  const watchScore = watchTimeScore(signals.watchTimeMs);
  const likeScore = signals.likes * 18;
  const openScore = signals.opens * 6;
  const skipPenalty = signals.skips * 10;
  const waveBonus = signals.waves * 15;
  const messageBonus = signals.messages * 20;
  const encounterBonus = signals.mutualEncounters * 12;

  const rawScore = 22 + watchScore * 0.55 + likeScore + openScore + waveBonus + messageBonus + encounterBonus - skipPenalty;
  const decayed = rawScore * recencyDecay(signals.recencyHours);
  const boosted = decayed * distanceBoost(signals.distanceKm);
  const final = boosted * interestMultiplier(signals.sharedInterests);

  return clamp(Math.round(final));
}

// ── Personalized Feed Algorithm ──

export type FeedItem = {
  id: string;
  type: 'profile' | 'card' | 'group' | 'encounter';
  score: number;
  distanceKm: number;
  isOnline: boolean;
  lastActiveAt: string | null;
  matchPercent?: number;
};

export type FeedConfig = {
  diversityFactor: number;     // 0-1: how much to diversify results (0=pure score, 1=max diversity)
  freshnessBias: number;       // 0-1: bias towards new/unseen profiles
  onlineBoost: number;         // bonus points for online users
  maxItems: number;
};

const defaultFeedConfig: FeedConfig = {
  diversityFactor: 0.3,
  freshnessBias: 0.4,
  onlineBoost: 15,
  maxItems: 50,
};

export function buildPersonalizedFeed<T extends FeedItem>(
  items: T[],
  metricsMap: RadarMetricsMap,
  config: Partial<FeedConfig> = {}
): T[] {
  const cfg = { ...defaultFeedConfig, ...config };

  // Score each item
  const scored = items.map((item) => {
    const metrics = metricsMap[item.id];
    let score = item.score || 50;

    if (metrics) {
      score = metrics.score;
    }

    // Online boost
    if (item.isOnline) {
      score += cfg.onlineBoost;
    }

    // Freshness: boost unseen profiles
    if (!metrics || !metrics.lastSeenAt) {
      score += cfg.freshnessBias * 30;
    } else {
      const hoursSinceSeen = (Date.now() - new Date(metrics.lastSeenAt).getTime()) / 3600000;
      if (hoursSinceSeen > 24) {
        score += cfg.freshnessBias * 15;
      }
    }

    // Distance factor
    score *= distanceBoost(item.distanceKm);

    return { ...item, _feedScore: clamp(Math.round(score)) };
  });

  // Sort by feed score
  scored.sort((a, b) => (b as any)._feedScore - (a as any)._feedScore);

  // Apply diversity: inject variety by shuffling nearby scores
  if (cfg.diversityFactor > 0) {
    for (let i = 1; i < scored.length - 1; i++) {
      if (Math.random() < cfg.diversityFactor) {
        const j = Math.min(i + 1 + Math.floor(Math.random() * 3), scored.length - 1);
        [scored[i], scored[j]] = [scored[j], scored[i]];
      }
    }
  }

  return scored.slice(0, cfg.maxItems);
}

// ── Content Affinity Tracking ──

export type ContentAffinity = {
  categories: Record<string, number>;  // e.g., { coffee: 12, sport: 8 }
  timeSlots: Record<string, number>;   // e.g., { morning: 5, afternoon: 8 }
  distancePreference: number;          // avg preferred distance
};

const AFFINITY_KEY = 'puqme.content.affinity.v1';

export function loadContentAffinity(): ContentAffinity {
  if (typeof window === 'undefined') return { categories: {}, timeSlots: {}, distancePreference: 5 };
  const raw = localStorage.getItem(AFFINITY_KEY);
  try { return raw ? JSON.parse(raw) : { categories: {}, timeSlots: {}, distancePreference: 5 }; }
  catch { return { categories: {}, timeSlots: {}, distancePreference: 5 }; }
}

export function updateContentAffinity(category: string, distanceKm: number) {
  if (typeof window === 'undefined') return;
  const affinity = loadContentAffinity();

  // Update category affinity
  affinity.categories[category] = (affinity.categories[category] || 0) + 1;

  // Update time slot
  const hour = new Date().getHours();
  const slot = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  affinity.timeSlots[slot] = (affinity.timeSlots[slot] || 0) + 1;

  // Running average of distance preference
  affinity.distancePreference = (affinity.distancePreference * 0.8) + (distanceKm * 0.2);

  localStorage.setItem(AFFINITY_KEY, JSON.stringify(affinity));
}
