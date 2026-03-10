import type { FastifyInstance } from "fastify";
import { MatchService } from "../match/service.js";
import { SwipeRepository } from "./repository.js";
import { rankCandidates } from "./ranking.js";
import type { CreateSwipeBody, DiscoverQuery } from "./schema.js";

export class SwipeService {
  private readonly repository: SwipeRepository;
  private readonly matchService: MatchService;

  constructor(private readonly app: FastifyInstance) {
    this.repository = new SwipeRepository(app);
    this.matchService = new MatchService(app);
  }

  private cacheKey(userId: string) {
    return `discover:deck:${userId}`;
  }

  private calculateAge(birthDate: string) {
    const now = new Date();
    const date = new Date(birthDate);
    let age = now.getUTCFullYear() - date.getUTCFullYear();
    const monthOffset = now.getUTCMonth() - date.getUTCMonth();
    if (monthOffset < 0 || (monthOffset === 0 && now.getUTCDate() < date.getUTCDate())) {
      age -= 1;
    }
    return age;
  }

  private async loadCachedDeck(userId: string) {
    const cached = await this.app.redis.get(this.cacheKey(userId));
    return cached ? (JSON.parse(cached) as string[]) : null;
  }

  private async saveCachedDeck(userId: string, candidateIds: string[]) {
    await this.app.redis.set(this.cacheKey(userId), JSON.stringify(candidateIds), "EX", 600);
  }

  async getDiscoverFeed(userId: string, query: DiscoverQuery) {
    const viewer = await this.repository.getViewerPreferences(userId);
    let cacheHit = false;
    let cachedIds = query.refresh ? null : await this.loadCachedDeck(userId);

    if (!cachedIds || cachedIds.length < query.limit) {
      const retrieved = await this.repository.retrieveCandidates(userId, Math.max(query.limit, 24));
      const ranked = rankCandidates(retrieved, viewer);
      cachedIds = ranked.map((candidate) => candidate.userId);
      await this.saveCachedDeck(userId, cachedIds);
    } else {
      cacheHit = true;
    }

    const requestedIds = cachedIds.slice(0, query.limit);
    const remainingIds = cachedIds.slice(query.limit);
    const hydrated = await this.repository.hydrateCandidatesByIds(userId, requestedIds);
    const ranked = rankCandidates(hydrated, viewer);

    await this.saveCachedDeck(userId, remainingIds);

    return {
      items: ranked.map((candidate) => ({
        userId: candidate.userId,
        displayName: candidate.displayName,
        age: this.calculateAge(candidate.birthDate),
        bio: candidate.bio,
        city: candidate.city,
        countryCode: candidate.countryCode,
        primaryPhotoUrl: candidate.primaryPhotoUrl,
        distanceKm: candidate.distanceKm,
        profileQualityScore: candidate.profileQualityScore,
        activityScore: candidate.activityScore,
        responseProbabilityScore: candidate.responseProbabilityScore,
        freshnessScore: candidate.scoreBreakdown.freshness,
        feedScore: candidate.feedScore,
        scoreBreakdown: candidate.scoreBreakdown
      })),
      cache: {
        hit: cacheHit,
        remaining: remainingIds.length
      }
    };
  }

  async createSwipe(actorUserId: string, targetUserId: string, direction: CreateSwipeBody["direction"]) {
    const swipe = await this.repository.saveSwipe({ actorUserId, targetUserId, direction });
    await this.app.redis.del(this.cacheKey(actorUserId));

    let isMatch = false;
    if (direction !== "left") {
      const matchResult = await this.matchService.ensureMatchFromPositiveSwipe(actorUserId, targetUserId);
      isMatch = Boolean(matchResult.match);
    }

    return {
      swipeId: swipe.id,
      targetUserId,
      direction,
      isMatch
    };
  }
}
