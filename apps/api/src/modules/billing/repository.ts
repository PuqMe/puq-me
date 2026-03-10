import type { FastifyInstance } from "fastify";
import { ConflictError, NotFoundError } from "../../common/errors.js";
import type {
  CreateCheckoutSessionBody,
  FeatureCode,
  ProviderEventBody
} from "./schema.js";

type ProductRow = {
  product_id: string;
  code: string;
  name: string;
  product_type: "subscription" | "consumable";
  price_id: string | null;
  provider: "stripe" | "app_store" | "google_play" | "manual" | null;
  currency: string | null;
  amount_cents: number | null;
  interval_unit: "week" | "month" | "year" | null;
  interval_count: number | null;
};

type SubscriptionRow = {
  subscription_id: string;
  status: "trialing" | "active" | "past_due" | "canceled" | "expired" | "incomplete";
  provider: "stripe" | "app_store" | "google_play" | "manual";
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  product_code: string | null;
};

type EntitlementRow = {
  feature_code: FeatureCode;
  source_type: "subscription" | "purchase" | "grant";
  expires_at: string | null;
};

type OverrideRow = {
  feature_code: FeatureCode;
  enabled: boolean;
  expires_at: string | null;
};

type WalletRow = {
  boost_credits: number;
  super_like_credits: number;
};

export class BillingRepository {
  constructor(private readonly app: FastifyInstance) {}

  async listProducts() {
    const result = await this.app.db.query<ProductRow>(
      `select
         p.id::text as product_id,
         p.code,
         p.name,
         p.product_type,
         pr.id::text as price_id,
         pr.provider,
         pr.currency,
         pr.amount_cents,
         pr.interval_unit,
         pr.interval_count
       from billing_products p
       left join billing_prices pr
         on pr.product_id = p.id
        and pr.is_active = true
       where p.is_active = true
       order by p.sort_order asc, pr.amount_cents asc nulls last`
    );

    const products = new Map<
      string,
      {
        productId: string;
        code: string;
        name: string;
        productType: "subscription" | "consumable";
        prices: Array<{
          priceId: string;
          provider: "stripe" | "app_store" | "google_play" | "manual";
          currency: string;
          amountCents: number;
          intervalUnit: "week" | "month" | "year" | null;
          intervalCount: number | null;
        }>;
      }
    >();

    for (const row of result.rows) {
      if (!products.has(row.product_id)) {
        products.set(row.product_id, {
          productId: row.product_id,
          code: row.code,
          name: row.name,
          productType: row.product_type,
          prices: []
        });
      }

      if (row.price_id && row.provider && row.currency && row.amount_cents !== null) {
        products.get(row.product_id)?.prices.push({
          priceId: row.price_id,
          provider: row.provider,
          currency: row.currency,
          amountCents: row.amount_cents,
          intervalUnit: row.interval_unit,
          intervalCount: row.interval_count
        });
      }
    }

    return Array.from(products.values());
  }

  async getActiveSubscription(userId: string) {
    const result = await this.app.db.query<SubscriptionRow>(
      `select
         s.id::text as subscription_id,
         s.status,
         s.provider,
         s.current_period_end::text,
         s.cancel_at_period_end,
         p.code as product_code
       from subscriptions s
       join billing_products p on p.id = s.product_id
       where s.user_id = $1::bigint
         and s.status in ('trialing', 'active', 'past_due')
       order by s.current_period_end desc
       limit 1`,
      [userId]
    );

    const row = result.rows[0];
    if (!row) {
      return {
        subscriptionId: null,
        status: null,
        productCode: null,
        provider: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false
      };
    }

    return {
      subscriptionId: row.subscription_id,
      status: row.status,
      productCode: row.product_code,
      provider: row.provider,
      currentPeriodEnd: row.current_period_end,
      cancelAtPeriodEnd: row.cancel_at_period_end
    };
  }

  async listEntitlements(userId: string) {
    const result = await this.app.db.query<EntitlementRow>(
      `select
         feature_code,
         source_type,
         expires_at::text
       from user_entitlements
       where user_id = $1::bigint
         and status = 'active'
         and (expires_at is null or expires_at > now())`,
      [userId]
    );

    return result.rows.map((row) => ({
      featureCode: row.feature_code,
      source: row.source_type === "subscription" ? "subscription" : "override",
      expiresAt: row.expires_at
    }));
  }

  async listFeatureOverrides(userId: string) {
    const result = await this.app.db.query<OverrideRow>(
      `select
         feature_code,
         enabled,
         expires_at::text
       from user_feature_overrides
       where user_id = $1::bigint
         and (expires_at is null or expires_at > now())`,
      [userId]
    );

    return result.rows.map((row) => ({
      featureCode: row.feature_code,
      enabled: row.enabled,
      expiresAt: row.expires_at
    }));
  }

  async getWallet(userId: string) {
    const result = await this.app.db.query<WalletRow>(
      `select
         boost_credits,
         super_like_credits
       from user_credit_wallets
       where user_id = $1::bigint
       limit 1`,
      [userId]
    );

    const row = result.rows[0];

    return {
      boostCredits: row?.boost_credits ?? 0,
      superLikeCredits: row?.super_like_credits ?? 0
    };
  }

  async consumeWalletCredit(userId: string, featureCode: "boost" | "super_likes", amount: number) {
    const column = featureCode === "boost" ? "boost_credits" : "super_like_credits";
    const result = await this.app.db.query<{ remaining_credits: number }>(
      `update user_credit_wallets
       set ${column} = ${column} - $2,
           updated_at = now()
       where user_id = $1::bigint
         and ${column} >= $2
       returning ${column} as remaining_credits`,
      [userId, amount]
    );

    if (result.rowCount === 0) {
      throw new NotFoundError("insufficient_credits");
    }

    return result.rows[0].remaining_credits;
  }

  async createCheckoutSession(userId: string, input: CreateCheckoutSessionBody) {
    const priceResult = await this.app.db.query<{ product_id: string; provider: string }>(
      `select
         id::text as product_id,
         provider
       from billing_prices
       where id = $1::bigint
         and is_active = true
       limit 1`,
      [input.priceId]
    );

    const price = priceResult.rows[0];
    if (!price) {
      throw new NotFoundError("billing_price_not_found");
    }

    if (price.provider !== input.provider) {
      throw new ConflictError("billing_provider_price_mismatch");
    }

    const result = await this.app.db.query<{ checkout_session_id: string }>(
      `insert into billing_checkout_sessions (
         user_id,
         price_id,
         provider,
         status,
         success_url,
         cancel_url,
         created_at,
         updated_at
       )
       values ($1::bigint, $2::bigint, $3, 'pending', $4, $5, now(), now())
       returning id::text as checkout_session_id`,
      [userId, input.priceId, input.provider, input.successUrl, input.cancelUrl]
    );

    return {
      checkoutSessionId: result.rows[0].checkout_session_id,
      provider: input.provider,
      status: "pending" as const,
      clientSecret: null,
      redirectUrl: null
    };
  }

  async storeProviderEvent(input: ProviderEventBody) {
    const result = await this.app.db.query<{ provider_event_id: string }>(
      `insert into billing_provider_events (
         provider,
         event_type,
         external_event_id,
         payload,
         status,
         created_at,
         updated_at
       )
       values ($1, $2, $3, $4::jsonb, 'pending', now(), now())
       on conflict (provider, external_event_id)
       do update set
         payload = excluded.payload,
         updated_at = now()
       returning id::text as provider_event_id`,
      [input.provider, input.eventType, input.externalEventId, JSON.stringify(input.payload)]
    );

    return result.rows[0].provider_event_id;
  }
}
