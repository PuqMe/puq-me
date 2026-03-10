import type { CandidateRecord, ViewerPreferenceRecord } from "./repository.js";

export type RankedCandidate = CandidateRecord & {
  feedScore: number;
  scoreBreakdown: {
    distance: number;
    ageFit: number;
    activity: number;
    profileQuality: number;
    responseProbability: number;
    freshness: number;
  };
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function calculateAge(birthDate: string) {
  const now = new Date();
  const date = new Date(birthDate);
  let age = now.getUTCFullYear() - date.getUTCFullYear();
  const monthOffset = now.getUTCMonth() - date.getUTCMonth();
  if (monthOffset < 0 || (monthOffset === 0 && now.getUTCDate() < date.getUTCDate())) {
    age -= 1;
  }
  return age;
}

function distanceScore(distanceKm: number, maxDistanceKm: number) {
  if (maxDistanceKm <= 0) {
    return 0;
  }

  return clamp(Math.round((1 - Math.min(distanceKm / maxDistanceKm, 1)) * 100));
}

function ageFitScore(age: number, minAge: number, maxAge: number) {
  if (age < minAge || age > maxAge) {
    return 0;
  }

  const midpoint = (minAge + maxAge) / 2;
  const maxOffset = Math.max((maxAge - minAge) / 2, 1);
  return clamp(Math.round((1 - Math.min(Math.abs(age - midpoint) / maxOffset, 1)) * 100));
}

function freshnessScore(createdAt: string) {
  const created = new Date(createdAt).getTime();
  const ageHours = Math.max(0, (Date.now() - created) / (1000 * 60 * 60));

  if (ageHours <= 24) return 100;
  if (ageHours <= 72) return 80;
  if (ageHours <= 168) return 60;
  if (ageHours <= 720) return 35;
  return 15;
}

export function rankCandidates(candidates: CandidateRecord[], viewer: ViewerPreferenceRecord): RankedCandidate[] {
  return candidates
    .map((candidate) => {
      const age = calculateAge(candidate.birthDate);
      const scoreBreakdown = {
        distance: distanceScore(candidate.distanceKm, viewer.maxDistanceKm),
        ageFit: ageFitScore(age, viewer.minAge, viewer.maxAge),
        activity: clamp(candidate.activityScore),
        profileQuality: clamp(candidate.profileQualityScore),
        responseProbability: clamp(candidate.responseProbabilityScore),
        freshness: freshnessScore(candidate.createdAt)
      };

      const feedScore =
        scoreBreakdown.distance * 0.2 +
        scoreBreakdown.ageFit * 0.12 +
        scoreBreakdown.activity * 0.2 +
        scoreBreakdown.profileQuality * 0.2 +
        scoreBreakdown.responseProbability * 0.18 +
        scoreBreakdown.freshness * 0.1;

      return {
        ...candidate,
        feedScore: Math.round(feedScore * 100) / 100,
        scoreBreakdown
      };
    })
    .sort((left, right) => right.feedScore - left.feedScore);
}
