import type { FastifyInstance } from "fastify";
import { TooManyRequestsError } from "../../common/errors.js";
import { AnalyticsRepository } from "./repository.js";
import type { AnalyticsEventBody } from "./schema.js";

const propertyAllowList: Record<AnalyticsEventBody["eventName"], string[]> = {
  "auth.registered": ["method", "entrypoint"],
  "onboarding.abandoned": ["step", "reason"],
  "profile.completed": ["completionScore"],
  "media.photo_uploaded": ["photoCount", "source"],
  "swipe.created": ["direction", "surface"],
  "match.created": ["surface"],
  "chat.message_sent": ["messageType"],
  "retention.app_opened": ["source"],
  "billing.premium_converted": ["planCode", "provider", "currency", "amountCents"],
  "experiment.exposed": ["experimentKey", "variant", "surface"],
  "feature_flag.evaluated": ["flagKey", "enabled", "surface"]
};

export class AnalyticsService {
  private readonly repository: AnalyticsRepository;

  constructor(private readonly app: FastifyInstance) {
    this.repository = new AnalyticsRepository(app);
  }

  private rateKey(key: string) {
    return `analytics:track:${key}`;
  }

  private sanitizeProperties(eventName: AnalyticsEventBody["eventName"], properties: Record<string, unknown>) {
    const allowedKeys = new Set(propertyAllowList[eventName] ?? []);
    const sanitizedEntries = Object.entries(properties).filter(([key, value]) => {
      if (!allowedKeys.has(key)) {
        return false;
      }

      const valueType = typeof value;
      return value === null || valueType === "string" || valueType === "number" || valueType === "boolean";
    });

    return Object.fromEntries(sanitizedEntries);
  }

  async trackEvent(userId: string | null, body: AnalyticsEventBody, meta?: { ipAddress?: string | null }) {
    const limiterId = userId ?? body.anonymousId ?? "anonymous";
    const key = this.rateKey(limiterId);
    const count = await this.app.redis.incr(key);
    if (count === 1) {
      await this.app.redis.expire(key, 60);
    }
    if (count > 120) {
      throw new TooManyRequestsError("analytics_track_rate_limit_exceeded");
    }

    const sanitizedBody: AnalyticsEventBody = {
      ...body,
      properties: this.sanitizeProperties(body.eventName, body.properties)
    };

    const event = await this.repository.trackEvent(userId, sanitizedBody, meta);

    this.app.log.info(
      {
        event: "analytics.event.tracked",
        eventName: event.eventName,
        userId,
        anonymousId: event.anonymousId,
        platform: event.platform
      },
      "analytics event tracked"
    );

    return { event };
  }

  getOverview(days: number) {
    return this.repository.getOverview(days);
  }
}
