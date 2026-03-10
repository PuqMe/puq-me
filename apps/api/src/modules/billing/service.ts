import type { FastifyInstance } from "fastify";
import { PaymentRequiredError } from "../../common/errors.js";
import { BillingRepository } from "./repository.js";
import type { ConsumeCreditBody, CreateCheckoutSessionBody, FeatureCode, ProviderEventBody } from "./schema.js";

type FeatureAccess = {
  featureCode: FeatureCode;
  enabled: boolean;
  source: "free" | "subscription" | "override" | "wallet";
  expiresAt: string | null;
};

const freeFeatureDefaults: Record<FeatureCode, boolean> = {
  unlimited_likes: false,
  boost: false,
  super_likes: false,
  advanced_filters: false,
  passport_mode: false,
  profile_visitors: false
};

export class BillingService {
  private readonly repository: BillingRepository;

  constructor(private readonly app: FastifyInstance) {
    this.repository = new BillingRepository(app);
  }

  async listProducts() {
    return {
      items: await this.repository.listProducts()
    };
  }

  async getBillingOverview(userId: string) {
    const [subscription, entitlements, overrides, wallet] = await Promise.all([
      this.repository.getActiveSubscription(userId),
      this.repository.listEntitlements(userId),
      this.repository.listFeatureOverrides(userId),
      this.repository.getWallet(userId)
    ]);

    const features = this.resolveFeatureAccess(entitlements, overrides, wallet);

    return {
      subscription,
      features,
      wallet
    };
  }

  async listFeatureAccess(userId: string) {
    const [entitlements, overrides, wallet] = await Promise.all([
      this.repository.listEntitlements(userId),
      this.repository.listFeatureOverrides(userId),
      this.repository.getWallet(userId)
    ]);

    return {
      items: this.resolveFeatureAccess(entitlements, overrides, wallet)
    };
  }

  async assertFeatureAccess(userId: string, featureCode: FeatureCode) {
    const access = await this.listFeatureAccess(userId);
    const feature = access.items.find((item) => item.featureCode === featureCode);

    if (!feature?.enabled) {
      throw new PaymentRequiredError("premium_feature_required", { featureCode });
    }

    return feature;
  }

  async consumeCredit(userId: string, body: ConsumeCreditBody) {
    const remainingCredits = await this.repository.consumeWalletCredit(userId, body.featureCode, body.amount);

    this.app.log.info(
      {
        event: "billing.credit.consumed",
        userId,
        featureCode: body.featureCode,
        amount: body.amount,
        remainingCredits
      },
      "billing credit consumed"
    );

    return {
      success: true as const,
      featureCode: body.featureCode,
      remainingCredits
    };
  }

  createCheckoutSession(userId: string, body: CreateCheckoutSessionBody) {
    return this.repository.createCheckoutSession(userId, body);
  }

  async storeProviderEvent(body: ProviderEventBody) {
    const providerEventId = await this.repository.storeProviderEvent(body);

    this.app.log.info(
      {
        event: "billing.provider_event.received",
        provider: body.provider,
        eventType: body.eventType,
        externalEventId: body.externalEventId,
        providerEventId
      },
      "billing provider event stored"
    );

    return {
      success: true as const,
      providerEventId
    };
  }

  private resolveFeatureAccess(
    entitlements: Array<{ featureCode: FeatureCode; source: "subscription" | "override"; expiresAt: string | null }>,
    overrides: Array<{ featureCode: FeatureCode; enabled: boolean; expiresAt: string | null }>,
    wallet: { boostCredits: number; superLikeCredits: number }
  ): FeatureAccess[] {
    const features: FeatureAccess[] = (Object.keys(freeFeatureDefaults) as FeatureCode[]).map((featureCode) => ({
      featureCode,
      enabled: freeFeatureDefaults[featureCode],
      source: "free",
      expiresAt: null
    }));

    const featureMap = new Map(features.map((feature) => [feature.featureCode, feature]));

    for (const entitlement of entitlements) {
      featureMap.set(entitlement.featureCode, {
        featureCode: entitlement.featureCode,
        enabled: true,
        source: entitlement.source === "subscription" ? "subscription" : "override",
        expiresAt: entitlement.expiresAt
      });
    }

    for (const override of overrides) {
      featureMap.set(override.featureCode, {
        featureCode: override.featureCode,
        enabled: override.enabled,
        source: "override",
        expiresAt: override.expiresAt
      });
    }

    if (wallet.boostCredits > 0) {
      featureMap.set("boost", {
        featureCode: "boost",
        enabled: true,
        source: "wallet",
        expiresAt: null
      });
    }

    if (wallet.superLikeCredits > 0) {
      featureMap.set("super_likes", {
        featureCode: "super_likes",
        enabled: true,
        source: "wallet",
        expiresAt: null
      });
    }

    return Array.from(featureMap.values());
  }
}
