"use client";

// ── KI-gestützte Prozesse ──
// Smart ranking, content suggestions, auto-tagging, and behavior learning

import {
  loadRadarMetrics,
  type RadarMetricsMap,
  type RadarMetrics,
} from "./radar-ranking";
import { loadContentAffinity, type ContentAffinity } from "./radar-ranking";

// ── Auto-Tag System ──
// Automatically categorizes user interests based on interaction patterns

const INTEREST_CLUSTERS: Record<string, string[]> = {
  sport: ["fitness", "yoga", "laufen", "gym", "fußball", "basketball", "schwimmen", "wandern", "klettern", "radfahren"],
  kultur: ["museum", "theater", "kunst", "galerie", "oper", "kino", "konzert", "musik", "literatur"],
  outdoor: ["natur", "park", "strand", "berge", "camping", "garten", "see", "wald"],
  food: ["kochen", "restaurant", "kaffee", "wein", "cocktails", "backen", "vegan", "brunch"],
  tech: ["coding", "gaming", "startups", "ai", "design", "fotografie", "apps"],
  social: ["tanzen", "party", "karaoke", "reisen", "sprachen", "ehrenamt", "networking"],
  wellness: ["meditation", "spa", "achtsamkeit", "selbstfürsorge", "therapie"],
  kreativ: ["malen", "schreiben", "diy", "handwerk", "musik machen", "podcasts"],
};

export function autoTagInterests(currentInterests: string[]): string[] {
  const normalized = currentInterests.map((i) => i.toLowerCase().trim());
  const suggestedTags = new Set<string>();

  for (const [cluster, keywords] of Object.entries(INTEREST_CLUSTERS)) {
    const matchCount = normalized.filter((interest) =>
      keywords.some((kw) => interest.includes(kw) || kw.includes(interest))
    ).length;

    if (matchCount >= 1) {
      suggestedTags.add(cluster);
    }
  }

  return Array.from(suggestedTags);
}

// ── Smart Suggestion Engine ──
// Suggests interests based on affinity patterns and engagement

export function suggestInterests(
  currentInterests: string[],
  affinity: ContentAffinity
): string[] {
  const topCategories = Object.entries(affinity.categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat);

  const suggestions: string[] = [];

  for (const category of topCategories) {
    const clusterKeywords = INTEREST_CLUSTERS[category];
    if (!clusterKeywords) continue;

    for (const keyword of clusterKeywords) {
      if (
        !currentInterests.some((i) => i.toLowerCase().includes(keyword)) &&
        suggestions.length < 5
      ) {
        suggestions.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    }
  }

  return suggestions;
}

// ── Behavioral Learning ──
// Learns user patterns and adjusts recommendations

export type UserBehaviorProfile = {
  activeTimeSlot: string;
  preferredDistance: number;
  engagementStyle: "explorer" | "selective" | "social" | "cautious";
  topInterestClusters: string[];
  avgSessionMinutes: number;
  lastUpdated: string;
};

const BEHAVIOR_KEY = "puqme.ai.behavior.v1";

export function loadBehaviorProfile(): UserBehaviorProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(BEHAVIOR_KEY);
  try {
    return raw ? (JSON.parse(raw) as UserBehaviorProfile) : null;
  } catch {
    return null;
  }
}

export function analyzeBehavior(
  metrics: RadarMetricsMap,
  affinity: ContentAffinity
): UserBehaviorProfile {
  // Determine active time slot
  const timeSlots = affinity.timeSlots;
  const activeTimeSlot = Object.entries(timeSlots)
    .sort(([, a], [, b]) => b - a)[0]?.[0] ?? "afternoon";

  // Determine engagement style
  const allMetrics = Object.values(metrics);
  const totalLikes = allMetrics.reduce((s, m) => s + m.likes, 0);
  const totalSkips = allMetrics.reduce((s, m) => s + m.skips, 0);
  const totalOpens = allMetrics.reduce((s, m) => s + m.opens, 0);
  const total = totalLikes + totalSkips + totalOpens;

  let engagementStyle: UserBehaviorProfile["engagementStyle"] = "explorer";
  if (total > 0) {
    const likeRatio = totalLikes / total;
    const skipRatio = totalSkips / total;

    if (likeRatio > 0.5) engagementStyle = "social";
    else if (skipRatio > 0.6) engagementStyle = "selective";
    else if (totalOpens > totalLikes * 3) engagementStyle = "cautious";
    else engagementStyle = "explorer";
  }

  // Top interest clusters
  const topInterestClusters = Object.entries(affinity.categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat);

  // Average session length estimate
  const totalWatchMs = allMetrics.reduce((s, m) => s + m.totalWatchMs, 0);
  const sessionCount = Math.max(1, allMetrics.filter((m) => m.opens > 0).length);
  const avgSessionMinutes = Math.round(totalWatchMs / sessionCount / 60000);

  const profile: UserBehaviorProfile = {
    activeTimeSlot,
    preferredDistance: affinity.distancePreference,
    engagementStyle,
    topInterestClusters,
    avgSessionMinutes,
    lastUpdated: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(BEHAVIOR_KEY, JSON.stringify(profile));
  }

  return profile;
}

// ── Smart Feed Ranking ──
// Applies behavioral profile to feed ordering

export function applySmartRanking<T extends { id: string; score?: number }>(
  items: T[],
  behaviorProfile: UserBehaviorProfile | null,
  metricsMap: RadarMetricsMap
): T[] {
  if (!behaviorProfile) return items;

  return [...items].sort((a, b) => {
    let scoreA = a.score ?? 50;
    let scoreB = b.score ?? 50;

    const metricsA = metricsMap[a.id];
    const metricsB = metricsMap[b.id];

    // Boost based on engagement style
    if (behaviorProfile.engagementStyle === "social") {
      // Social users prefer profiles with mutual interaction
      if (metricsA && metricsA.likes > 0) scoreA += 10;
      if (metricsB && metricsB.likes > 0) scoreB += 10;
    } else if (behaviorProfile.engagementStyle === "selective") {
      // Selective users prefer high-quality unseen profiles
      if (!metricsA) scoreA += 15;
      if (!metricsB) scoreB += 15;
    } else if (behaviorProfile.engagementStyle === "cautious") {
      // Cautious users prefer familiar, opened profiles
      if (metricsA && metricsA.opens > 1) scoreA += 8;
      if (metricsB && metricsB.opens > 1) scoreB += 8;
    }

    return scoreB - scoreA;
  });
}

// ── Content Recommendation ──
// Recommends content types based on time-of-day patterns

export function getTimeBasedRecommendation(behaviorProfile: UserBehaviorProfile | null): {
  type: "explore" | "social" | "calm" | "active";
  message: string;
} {
  const hour = new Date().getHours();
  const style = behaviorProfile?.engagementStyle ?? "explorer";

  if (hour >= 6 && hour < 12) {
    return {
      type: "active",
      message: style === "social"
        ? "Guten Morgen! Neue Matches warten auf dich."
        : "Guten Morgen! Schau dir neue Profile in deiner Nähe an.",
    };
  }

  if (hour >= 12 && hour < 18) {
    return {
      type: "explore",
      message: style === "selective"
        ? "Neue handverlesene Vorschläge für dich."
        : "Entdecke wer gerade in deiner Stadt unterwegs ist.",
    };
  }

  if (hour >= 18 && hour < 22) {
    return {
      type: "social",
      message: "Abendstimmung — perfekte Zeit für Begegnungen.",
    };
  }

  return {
    type: "calm",
    message: "Ruhige Stunden — vielleicht morgen weiter?",
  };
}
