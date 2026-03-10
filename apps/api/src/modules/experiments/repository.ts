import type { FastifyInstance } from "fastify";

type FeatureFlagRow = {
  feature_flag_id: string;
  key: string;
  type: "release" | "ops" | "permission";
  enabled: boolean;
  audience_type: "all" | "authenticated" | "premium" | "country";
  audience_value: string | null;
  payload: Record<string, unknown>;
};

type FeatureOverrideRow = {
  feature_flag_id: string;
  enabled: boolean;
  payload: Record<string, unknown>;
};

type ExperimentRow = {
  experiment_id: string;
  key: string;
  status: "draft" | "active" | "paused" | "completed";
  audience_type: "all" | "authenticated" | "premium" | "country";
  audience_value: string | null;
};

type ExperimentVariantRow = {
  experiment_id: string;
  key: string;
  variant_key: string;
  weight: number;
  payload: Record<string, unknown>;
};

type ExperimentAssignmentRow = {
  experiment_key: string;
  variant_key: string;
  exposed_at: string | null;
};

type UserContextRow = {
  country_code: string | null;
};

export class ExperimentsRepository {
  constructor(private readonly app: FastifyInstance) {}

  async getUserContext(userId: string) {
    const result = await this.app.db.query<UserContextRow>(
      `select p.country_code
       from profiles p
       where p.user_id = $1::bigint
       limit 1`,
      [userId]
    );

    return {
      countryCode: result.rows[0]?.country_code ?? null
    };
  }

  async hasActiveSubscription(userId: string) {
    const result = await this.app.db.query<{ has_active_subscription: boolean }>(
      `select exists(
         select 1
         from subscriptions
         where user_id = $1::bigint
           and status in ('trialing', 'active', 'past_due')
       ) as has_active_subscription`,
      [userId]
    );

    return Boolean(result.rows[0]?.has_active_subscription);
  }

  async listActiveFlags() {
    const result = await this.app.db.query<FeatureFlagRow>(
      `select
         id::text as feature_flag_id,
         key,
         type,
         enabled,
         audience_type,
         audience_value,
         payload
       from feature_flags
       where is_active = true`
    );

    return result.rows;
  }

  async listUserFlagOverrides(userId: string) {
    const result = await this.app.db.query<FeatureOverrideRow>(
      `select
         feature_flag_id::text,
         enabled,
         payload
       from feature_flag_user_overrides
       where user_id = $1::bigint
         and (expires_at is null or expires_at > now())`,
      [userId]
    );

    return result.rows;
  }

  async listActiveExperiments() {
    const result = await this.app.db.query<ExperimentRow>(
      `select
         id::text as experiment_id,
         key,
         status,
         audience_type,
         audience_value
       from experiments
       where status = 'active'`
    );

    return result.rows;
  }

  async listExperimentVariants() {
    const result = await this.app.db.query<ExperimentVariantRow>(
      `select
         experiment_id::text,
         key,
         variant_key,
         weight,
         payload
       from experiment_variants
       where is_active = true`
    );

    return result.rows;
  }

  async getAssignments(userId: string) {
    const result = await this.app.db.query<ExperimentAssignmentRow>(
      `select
         e.key as experiment_key,
         a.variant_key,
         a.exposed_at::text
       from experiment_assignments a
       join experiments e on e.id = a.experiment_id
       where a.user_id = $1::bigint`,
      [userId]
    );

    return result.rows;
  }

  async upsertAssignment(input: { userId: string; experimentKey: string; experimentId: string; variant: string }) {
    await this.app.db.query(
      `insert into experiment_assignments (
         experiment_id,
         user_id,
         variant_key,
         assigned_at
       )
       values ($1::bigint, $2::bigint, $3, now())
       on conflict (experiment_id, user_id)
       do update set
         variant_key = excluded.variant_key`,
      [input.experimentId, input.userId, input.variant]
    );
  }

  async markExposed(userId: string, experimentKey: string, variant: string) {
    await this.app.db.query(
      `update experiment_assignments a
       set exposed_at = coalesce(a.exposed_at, now())
       from experiments e
       where a.experiment_id = e.id
         and a.user_id = $1::bigint
         and e.key = $2
         and a.variant_key = $3`,
      [userId, experimentKey, variant]
    );
  }
}
