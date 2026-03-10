import type { FastifyInstance } from "fastify";
import { MatchRepository } from "./repository.js";
import type { MatchItem, ResolveMatchBody } from "./schema.js";

export class MatchService {
  private readonly repository: MatchRepository;

  constructor(private readonly app: FastifyInstance) {
    this.repository = new MatchRepository(app);
  }

  async ensureMatchFromPositiveSwipe(actorUserId: string, targetUserId: ResolveMatchBody["targetUserId"]) {
    const result = await this.repository.ensureMatchFromPositiveSwipe(actorUserId, targetUserId);

    if (result.match) {
      this.app.log.info(
        {
          event: "match.created",
          matchId: result.match.matchId,
          actorUserId,
          targetUserId
        },
        "notification event prepared"
      );
    }

    return {
      ...result,
      notificationEvent: result.match
        ? {
            type: "match.created" as const,
            matchId: result.match.matchId,
            recipientUserIds: [actorUserId, targetUserId]
          }
        : null
    };
  }

  listMatches(userId: string): Promise<MatchItem[]> {
    return this.repository.listForUser(userId);
  }

  getMatch(userId: string, matchId: string): Promise<MatchItem> {
    return this.repository.getForUser(userId, matchId);
  }
}
