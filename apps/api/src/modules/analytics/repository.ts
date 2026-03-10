import type { FastifyInstance } from "fastify";
import type { AnalyticsEventBody } from "./schema.js";

type AnalyticsEventRow = {
  event_id: string;
  event_name:
    | "auth.registered"
    | "onboarding.abandoned"
    | "profile.completed"
    | "media.photo_uploaded"
    | "swipe.created"
    | "match.created"
    | "chat.message_sent"
    | "retention.app_opened"
    | "billing.premium_converted";
  platform: "web" | "ios" | "android" | "server";
  occurred_at: string;
  anonymous_id: string | null;
  session_id: string | null;
  country_code: string | null;
  properties: Record<string, unknown>;
};

type OverviewRow = {
  registrations: number;
  onboarding_abandons: number;
  profile_completions: number;
  photo_uploads: number;
  swipes: number;
  matches: number;
  messages: number;
  retention_opens: number;
  premium_conversions: number;
};

export class AnalyticsRepository {
  constructor(private readonly app: FastifyInstance) {}

  async trackEvent(userId: string | null, body: AnalyticsEventBody, requestMeta?: { ipAddress?: string | null }) {
    const result = await this.app.db.query<AnalyticsEventRow>(
      `insert into analytics_events (
         user_id,
         anonymous_id,
         session_id,
         event_name,
         platform,
         country_code,
         occurred_at,
         properties,
         experiment_key,
         experiment_variant,
         ip_hash,
         created_at
       )
       values (
         $1::bigint,
         $2,
         $3,
         $4,
         $5,
         $6,
         coalesce($7::timestamptz, now()),
         $8::jsonb,
         $9,
         $10,
         case when $11 is null then null else md5($11) end,
         now()
       )
       returning
         id::text as event_id,
         event_name,
         platform,
         occurred_at::text,
         anonymous_id,
         session_id,
         country_code,
         properties`,
      [
        userId,
        body.anonymousId ?? null,
        body.sessionId ?? null,
        body.eventName,
        body.platform,
        body.countryCode ?? null,
        body.occurredAt ?? null,
        JSON.stringify(body.properties),
        body.experiment?.key ?? null,
        body.experiment?.variant ?? null,
        requestMeta?.ipAddress ?? null
      ]
    );

    return {
      eventId: result.rows[0].event_id,
      eventName: result.rows[0].event_name,
      platform: result.rows[0].platform,
      occurredAt: result.rows[0].occurred_at,
      anonymousId: result.rows[0].anonymous_id,
      sessionId: result.rows[0].session_id,
      countryCode: result.rows[0].country_code,
      properties: result.rows[0].properties
    };
  }

  async getOverview(days: number) {
    const result = await this.app.db.query<OverviewRow>(
      `select
         count(*) filter (where event_name = 'auth.registered')::int as registrations,
         count(*) filter (where event_name = 'onboarding.abandoned')::int as onboarding_abandons,
         count(*) filter (where event_name = 'profile.completed')::int as profile_completions,
         count(*) filter (where event_name = 'media.photo_uploaded')::int as photo_uploads,
         count(*) filter (where event_name = 'swipe.created')::int as swipes,
         count(*) filter (where event_name = 'match.created')::int as matches,
         count(*) filter (where event_name = 'chat.message_sent')::int as messages,
         count(*) filter (where event_name = 'retention.app_opened')::int as retention_opens,
         count(*) filter (where event_name = 'billing.premium_converted')::int as premium_conversions
       from analytics_events
       where occurred_at >= now() - make_interval(days => $1)`,
      [days]
    );

    const row = result.rows[0];

    return {
      periodDays: days,
      summary: {
        registrations: row?.registrations ?? 0,
        onboardingAbandons: row?.onboarding_abandons ?? 0,
        profileCompletions: row?.profile_completions ?? 0,
        photoUploads: row?.photo_uploads ?? 0,
        swipes: row?.swipes ?? 0,
        matches: row?.matches ?? 0,
        messages: row?.messages ?? 0,
        retentionOpens: row?.retention_opens ?? 0,
        premiumConversions: row?.premium_conversions ?? 0
      }
    };
  }
}
