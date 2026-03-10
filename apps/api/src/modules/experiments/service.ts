import { createHash } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { ExperimentsRepository } from "./repository.js";

type ResolvedFlag = {
  key: string;
  type: "release" | "ops" | "permission";
  enabled: boolean;
  reason: "default" | "targeted" | "override" | "disabled";
  payload: Record<string, unknown>;
};

type ResolvedExperiment = {
  key: string;
  variant: string;
  status: "draft" | "active" | "paused" | "completed";
  payload: Record<string, unknown>;
  exposed: boolean;
};

export class ExperimentsService {
  private readonly repository: ExperimentsRepository;

  constructor(private readonly app: FastifyInstance) {
    this.repository = new ExperimentsRepository(app);
  }

  private bucket(seed: string) {
    const hash = createHash("sha256").update(seed).digest("hex").slice(0, 8);
    return Number.parseInt(hash, 16) % 10_000;
  }

  async listFlagsForUser(userId: string) {
    const [flags, overrides, context] = await Promise.all([
      this.repository.listActiveFlags(),
      this.repository.listUserFlagOverrides(userId),
      this.repository.getUserContext(userId)
    ]);

    const overrideMap = new Map(overrides.map((override) => [override.feature_flag_id, override]));

    const items: ResolvedFlag[] = flags.map((flag) => {
      const override = overrideMap.get(flag.feature_flag_id);
      if (override) {
        return {
          key: flag.key,
          type: flag.type,
          enabled: override.enabled,
          reason: "override",
          payload: override.payload ?? flag.payload
        };
      }

      const targeted = this.matchesAudience(flag.audience_type, flag.audience_value, {
        authenticated: true,
        countryCode: context.countryCode
      });

      return {
        key: flag.key,
        type: flag.type,
        enabled: flag.enabled && targeted,
        reason: flag.enabled ? (targeted ? "targeted" : "disabled") : "disabled",
        payload: flag.payload ?? {}
      };
    });

    return { items };
  }

  async listExperimentsForUser(userId: string) {
    const [experiments, variants, assignments, context, isPremium] = await Promise.all([
      this.repository.listActiveExperiments(),
      this.repository.listExperimentVariants(),
      this.repository.getAssignments(userId),
      this.repository.getUserContext(userId),
      this.repository.hasActiveSubscription(userId)
    ]);

    const assignmentMap = new Map(assignments.map((assignment) => [assignment.experiment_key, assignment]));
    const variantsByExperiment = new Map<string, Array<(typeof variants)[number]>>();

    for (const variant of variants) {
      const existing = variantsByExperiment.get(variant.experiment_id) ?? [];
      existing.push(variant);
      variantsByExperiment.set(variant.experiment_id, existing);
    }

    const resolved: ResolvedExperiment[] = [];

    for (const experiment of experiments) {
      const allowed = this.matchesAudience(experiment.audience_type, experiment.audience_value, {
        authenticated: true,
        isPremium,
        countryCode: context.countryCode
      });
      if (!allowed) {
        continue;
      }

      const existingAssignment = assignmentMap.get(experiment.key);
      const experimentVariants = variantsByExperiment.get(experiment.experiment_id) ?? [];
      if (experimentVariants.length === 0) {
        continue;
      }

      let assignedVariant = existingAssignment?.variant_key;
      if (!assignedVariant) {
        assignedVariant = this.assignVariant(userId, experiment.key, experimentVariants);
        await this.repository.upsertAssignment({
          userId,
          experimentKey: experiment.key,
          experimentId: experiment.experiment_id,
          variant: assignedVariant
        });
      }

      const variantConfig = experimentVariants.find((variant) => variant.variant_key === assignedVariant) ?? experimentVariants[0];

      resolved.push({
        key: experiment.key,
        variant: variantConfig.variant_key,
        status: experiment.status,
        payload: variantConfig.payload ?? {},
        exposed: Boolean(existingAssignment?.exposed_at)
      });
    }

    return { items: resolved };
  }

  async markExposure(userId: string, experimentKey: string, variant: string) {
    await this.repository.markExposed(userId, experimentKey, variant);

    this.app.log.info(
      {
        event: "experiment.exposed",
        userId,
        experimentKey,
        variant
      },
      "experiment exposure recorded"
    );

    return {
      success: true as const,
      experimentKey,
      variant
    };
  }

  private assignVariant(
    userId: string,
    experimentKey: string,
    variants: Array<{ variant_key: string; weight: number }>
  ) {
    const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0);
    const bucket = this.bucket(`${this.app.config.EXPERIMENT_SALT}:${experimentKey}:${userId}`) % totalWeight;

    let cursor = 0;
    for (const variant of variants) {
      cursor += variant.weight;
      if (bucket < cursor) {
        return variant.variant_key;
      }
    }

    return variants[0]?.variant_key ?? "control";
  }

  private matchesAudience(
    audienceType: "all" | "authenticated" | "premium" | "country",
    audienceValue: string | null,
    context: { authenticated: boolean; isPremium?: boolean; countryCode?: string | null }
  ) {
    switch (audienceType) {
      case "all":
        return true;
      case "authenticated":
        return context.authenticated;
      case "premium":
        return Boolean(context.isPremium);
      case "country":
        return Boolean(audienceValue && context.countryCode && audienceValue === context.countryCode);
      default:
        return false;
    }
  }
}
