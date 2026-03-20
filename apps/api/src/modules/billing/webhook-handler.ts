import type { FastifyInstance } from "fastify";
import Stripe from "stripe";
import { BadRequestError, ConflictError } from "../../common/errors.js";
import { BillingRepository } from "./repository.js";

type StripeEvent = {
  id: string;
  type: string;
  created: number;
  data: {
    object: Record<string, unknown>;
    previous_attributes?: Record<string, unknown>;
  };
};

export class WebhookHandler {
  private readonly repository: BillingRepository;
  private readonly stripe: Stripe;

  constructor(
    private readonly app: FastifyInstance,
    private readonly stripeSecretKey: string,
    private readonly stripeWebhookSecret: string
  ) {
    this.repository = new BillingRepository(app);
    this.stripe = new Stripe(stripeSecretKey);
  }

  async handleStripeWebhook(signature: string, rawBody: Buffer): Promise<void> {
    let event: StripeEvent;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.stripeWebhookSecret
      ) as StripeEvent;
    } catch (error) {
      this.app.log.warn(
        {
          event: "billing.webhook.stripe_signature_verification_failed",
          error: error instanceof Error ? error.message : String(error)
        },
        "Stripe webhook signature verification failed"
      );
      throw new BadRequestError("invalid_webhook_signature");
    }

    this.app.log.info(
      {
        event: "billing.webhook.stripe_received",
        stripeEventId: event.id,
        eventType: event.type,
        created: new Date(event.created * 1000).toISOString()
      },
      "Stripe webhook received"
    );

    switch (event.type) {
      case "checkout.session.completed":
        await this.handleStripeCheckoutCompleted(event);
        break;

      case "customer.subscription.updated":
        await this.handleStripeSubscriptionUpdated(event);
        break;

      case "customer.subscription.deleted":
        await this.handleStripeSubscriptionDeleted(event);
        break;

      case "invoice.payment_succeeded":
        await this.handleStripeInvoicePaymentSucceeded(event);
        break;

      case "invoice.payment_failed":
        await this.handleStripeInvoicePaymentFailed(event);
        break;

      default:
        this.app.log.debug(
          {
            event: "billing.webhook.stripe_event_unhandled",
            eventType: event.type
          },
          "Unhandled Stripe event type"
        );
    }
  }

  async handleAppStoreWebhook(payload: Record<string, unknown>): Promise<void> {
    const eventType = payload.notificationType as string;
    const bundleId = payload.bundleId as string;
    const originalTransactionId = payload.originalTransactionId as string;

    if (!eventType || !bundleId || !originalTransactionId) {
      throw new BadRequestError("invalid_app_store_payload");
    }

    this.app.log.info(
      {
        event: "billing.webhook.app_store_received",
        eventType,
        bundleId,
        originalTransactionId
      },
      "App Store webhook received"
    );

    switch (eventType) {
      case "INITIAL_BUY":
        await this.handleAppStoreInitialBuy(payload);
        break;

      case "DID_RENEW":
        await this.handleAppStoreRenewal(payload);
        break;

      case "DID_FAIL_TO_RENEW":
        await this.handleAppStoreFailedRenewal(payload);
        break;

      case "CANCEL":
        await this.handleAppStoreCancel(payload);
        break;

      case "REFUND":
        await this.handleAppStoreRefund(payload);
        break;

      default:
        this.app.log.debug(
          {
            event: "billing.webhook.app_store_event_unhandled",
            eventType
          },
          "Unhandled App Store event type"
        );
    }

    await this.repository.storeProviderEvent({
      provider: "app_store",
      eventType,
      externalEventId: originalTransactionId,
      payload
    });
  }

  async handleGooglePlayWebhook(payload: Record<string, unknown>): Promise<void> {
    const packageName = payload.packageName as string;
    const subscriptionId = payload.subscriptionId as string;
    const purchaseToken = payload.purchaseToken as string;
    const notificationType = payload.notificationType as string;

    if (!packageName || !subscriptionId || !purchaseToken || notificationType === undefined) {
      throw new BadRequestError("invalid_google_play_payload");
    }

    this.app.log.info(
      {
        event: "billing.webhook.google_play_received",
        packageName,
        subscriptionId,
        notificationType
      },
      "Google Play webhook received"
    );

    const notificationTypeMap: Record<number, string> = {
      1: "SUBSCRIPTION_RECOVERED",
      2: "SUBSCRIPTION_RENEWED",
      3: "SUBSCRIPTION_CANCELED",
      4: "SUBSCRIPTION_PURCHASED",
      5: "SUBSCRIPTION_PENDING",
      6: "SUBSCRIPTION_PAUSED",
      7: "SUBSCRIPTION_PAUSE_SCHEDULE_CHANGED",
      8: "SUBSCRIPTION_REVOKED",
      9: "SUBSCRIPTION_EXPIRED",
      10: "SUBSCRIPTION_PRICE_CHANGE_CONFIRMED",
      11: "SUBSCRIPTION_PRICE_CHANGE_DEFERRED",
      12: "SUBSCRIPTION_AUTO_RENEWAL_ENABLED",
      13: "SUBSCRIPTION_AUTO_RENEWAL_DISABLED"
    };

    const eventType = notificationTypeMap[Number(notificationType)] || `SUBSCRIPTION_UNKNOWN_${notificationType}`;

    switch (Number(notificationType)) {
      case 4: // SUBSCRIPTION_PURCHASED
        await this.handleGooglePlayPurchased(payload);
        break;

      case 2: // SUBSCRIPTION_RENEWED
        await this.handleGooglePlayRenewed(payload);
        break;

      case 3: // SUBSCRIPTION_CANCELED
        await this.handleGooglePlaySubscriptionCanceled(payload);
        break;

      case 9: // SUBSCRIPTION_EXPIRED
        await this.handleGooglePlaySubscriptionExpired(payload);
        break;

      default:
        this.app.log.debug(
          {
            event: "billing.webhook.google_play_event_unhandled",
            notificationType
          },
          "Unhandled Google Play event type"
        );
    }

    const externalEventId = `${packageName}_${subscriptionId}_${purchaseToken}_${notificationType}`;
    await this.repository.storeProviderEvent({
      provider: "google_play",
      eventType,
      externalEventId,
      payload
    });
  }

  private async handleStripeCheckoutCompleted(event: StripeEvent): Promise<void> {
    const session = event.data.object as Record<string, unknown>;
    const sessionId = session.id as string;
    const customerId = session.customer as string | null;
    const clientReferenceId = session.client_reference_id as string | null;

    this.app.log.info(
      {
        event: "billing.webhook.stripe_checkout_completed",
        sessionId,
        customerId,
        clientReferenceId
      },
      "Stripe checkout completed"
    );

    if (!clientReferenceId) {
      this.app.log.warn(
        {
          event: "billing.webhook.stripe_checkout_no_user_id",
          sessionId
        },
        "Stripe checkout completed without client reference ID"
      );
    }
  }

  private async handleStripeSubscriptionUpdated(event: StripeEvent): Promise<void> {
    const subscription = event.data.object as Record<string, unknown>;
    const subscriptionId = subscription.id as string;
    const customerId = subscription.customer as string;
    const status = subscription.status as string;
    const currentPeriodEnd = subscription.current_period_end as number | null;

    this.app.log.info(
      {
        event: "billing.webhook.stripe_subscription_updated",
        subscriptionId,
        customerId,
        status,
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null
      },
      "Stripe subscription updated"
    );

    const statusMap: Record<string, string> = {
      trialing: "trialing",
      active: "active",
      past_due: "past_due",
      canceled: "canceled",
      incomplete: "incomplete",
      incomplete_expired: "expired"
    };

    const mappedStatus = statusMap[status] || status;

    // Store the provider event for async processing
    await this.repository.storeProviderEvent({
      provider: "stripe",
      eventType: "customer.subscription.updated",
      externalEventId: subscriptionId,
      payload: {
        subscriptionId,
        customerId,
        status: mappedStatus,
        currentPeriodEnd
      }
    });
  }

  private async handleStripeSubscriptionDeleted(event: StripeEvent): Promise<void> {
    const subscription = event.data.object as Record<string, unknown>;
    const subscriptionId = subscription.id as string;
    const customerId = subscription.customer as string;

    this.app.log.info(
      {
        event: "billing.webhook.stripe_subscription_deleted",
        subscriptionId,
        customerId
      },
      "Stripe subscription deleted"
    );

    await this.repository.storeProviderEvent({
      provider: "stripe",
      eventType: "customer.subscription.deleted",
      externalEventId: subscriptionId,
      payload: {
        subscriptionId,
        customerId
      }
    });
  }

  private async handleStripeInvoicePaymentSucceeded(event: StripeEvent): Promise<void> {
    const invoice = event.data.object as Record<string, unknown>;
    const invoiceId = invoice.id as string;
    const subscriptionId = invoice.subscription as string | null;
    const customerId = invoice.customer as string;
    const amountPaid = invoice.amount_paid as number | null;

    this.app.log.info(
      {
        event: "billing.webhook.stripe_invoice_payment_succeeded",
        invoiceId,
        subscriptionId,
        customerId,
        amountPaid
      },
      "Stripe invoice payment succeeded"
    );

    await this.repository.storeProviderEvent({
      provider: "stripe",
      eventType: "invoice.payment_succeeded",
      externalEventId: invoiceId,
      payload: {
        invoiceId,
        subscriptionId,
        customerId,
        amountPaid
      }
    });
  }

  private async handleStripeInvoicePaymentFailed(event: StripeEvent): Promise<void> {
    const invoice = event.data.object as Record<string, unknown>;
    const invoiceId = invoice.id as string;
    const subscriptionId = invoice.subscription as string | null;
    const customerId = invoice.customer as string;

    this.app.log.info(
      {
        event: "billing.webhook.stripe_invoice_payment_failed",
        invoiceId,
        subscriptionId,
        customerId
      },
      "Stripe invoice payment failed"
    );

    await this.repository.storeProviderEvent({
      provider: "stripe",
      eventType: "invoice.payment_failed",
      externalEventId: invoiceId,
      payload: {
        invoiceId,
        subscriptionId,
        customerId
      }
    });
  }

  private async handleAppStoreInitialBuy(payload: Record<string, unknown>): Promise<void> {
    this.app.log.info(
      {
        event: "billing.webhook.app_store_initial_buy",
        originalTransactionId: payload.originalTransactionId
      },
      "App Store initial purchase"
    );
  }

  private async handleAppStoreRenewal(payload: Record<string, unknown>): Promise<void> {
    this.app.log.info(
      {
        event: "billing.webhook.app_store_renewal",
        originalTransactionId: payload.originalTransactionId
      },
      "App Store subscription renewed"
    );
  }

  private async handleAppStoreFailedRenewal(payload: Record<string, unknown>): Promise<void> {
    this.app.log.info(
      {
        event: "billing.webhook.app_store_failed_renewal",
        originalTransactionId: payload.originalTransactionId
      },
      "App Store subscription renewal failed"
    );
  }

  private async handleAppStoreCancel(payload: Record<string, unknown>): Promise<void> {
    this.app.log.info(
      {
        event: "billing.webhook.app_store_cancel",
        originalTransactionId: payload.originalTransactionId
      },
      "App Store subscription canceled"
    );
  }

  private async handleAppStoreRefund(payload: Record<string, unknown>): Promise<void> {
    this.app.log.info(
      {
        event: "billing.webhook.app_store_refund",
        originalTransactionId: payload.originalTransactionId
      },
      "App Store refund issued"
    );
  }

  private async handleGooglePlayPurchased(payload: Record<string, unknown>): Promise<void> {
    this.app.log.info(
      {
        event: "billing.webhook.google_play_purchased",
        subscriptionId: payload.subscriptionId
      },
      "Google Play subscription purchased"
    );
  }

  private async handleGooglePlayRenewed(payload: Record<string, unknown>): Promise<void> {
    this.app.log.info(
      {
        event: "billing.webhook.google_play_renewed",
        subscriptionId: payload.subscriptionId
      },
      "Google Play subscription renewed"
    );
  }

  private async handleGooglePlaySubscriptionCanceled(payload: Record<string, unknown>): Promise<void> {
    this.app.log.info(
      {
        event: "billing.webhook.google_play_subscription_canceled",
        subscriptionId: payload.subscriptionId
      },
      "Google Play subscription canceled"
    );
  }

  private async handleGooglePlaySubscriptionExpired(payload: Record<string, unknown>): Promise<void> {
    this.app.log.info(
      {
        event: "billing.webhook.google_play_subscription_expired",
        subscriptionId: payload.subscriptionId
      },
      "Google Play subscription expired"
    );
  }
}
