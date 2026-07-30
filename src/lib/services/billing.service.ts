import { BaseService } from "./base.service";
import { Result } from "../result";
import { eventDispatcher } from "../events/event-dispatcher";
import { logger } from "../logger";

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: "ACTIVE" | "PAST_DUE" | "CANCELLED" | "TRIAL";
  currentPeriodEnd: Date;
  amount: number;
}

/**
 * Enterprise Billing & Subscription Service.
 * Manages SaaS membership cycles, tax overrides, proration calculations,
 * invoices generation, renewals, and dunning collection recovery alerts.
 */
export class BillingService extends BaseService {
  private static subscriptions = new Map<string, Subscription>();

  /**
   * Initializes a subscription plan for a user.
   */
  public async createSubscription(userId: string, planId: string, amount: number): Promise<Result<Subscription>> {
    logger.info(`[BillingService] Activating plan ${planId} for user ${userId}.`);

    const subscription: Subscription = {
      id: `sub_${Math.random().toString(36).substring(2, 10)}`,
      userId,
      planId,
      status: "ACTIVE",
      currentPeriodEnd: new Date(Date.now() + 30 * 86400 * 1000), // 30 days
      amount
    };

    BillingService.subscriptions.set(userId, subscription);

    // Publish Billing Event
    await eventDispatcher.publish({
      name: "SubscriptionActivated",
      occurredAt: new Date(),
      data: { userId, planId, subscriptionId: subscription.id, amount }
    });

    return this.returnSuccess(subscription);
  }

  /**
   * Calculates regional tax dynamically.
   */
  public calculateTax(amount: number, country: string): number {
    // Abstraction for tax rates: e.g. 18% GST for India, 8.25% Sales tax for US, 20% VAT for EU
    let rate = 0;
    if (country.toUpperCase() === "IN") rate = 0.18;
    else if (country.toUpperCase() === "US") rate = 0.0825;
    else if (["UK", "FR", "DE"].includes(country.toUpperCase())) rate = 0.20;

    const tax = amount * rate;
    logger.debug(`[BillingService] Calculated tax for country ${country}: $${tax.toFixed(2)} (rate: ${rate * 100}%)`);
    return tax;
  }

  /**
   * Calculates proration difference when changing plans.
   */
  public calculateProration(userId: string, targetPlanAmount: number): number {
    const sub = BillingService.subscriptions.get(userId);
    if (!sub || sub.status !== "ACTIVE") {
      return targetPlanAmount;
    }

    const remainingDays = Math.max(0, Math.floor((sub.currentPeriodEnd.getTime() - Date.now()) / (86400 * 1000)));
    const credit = (sub.amount / 30) * remainingDays;
    const debit = targetPlanAmount;
    const finalAmount = Math.max(0, debit - credit);

    logger.info(`[BillingService] Prorated billing for user ${userId}. Credit: $${credit.toFixed(2)}, Final Charge: $${finalAmount.toFixed(2)}.`);
    return finalAmount;
  }

  /**
   * Triggers background subscription renewal charging.
   */
  public async renewSubscription(userId: string): Promise<Result<Subscription>> {
    const sub = BillingService.subscriptions.get(userId);
    if (!sub) return this.returnFailure("No subscription found.", "SUBSCRIPTION_NOT_FOUND");

    logger.info(`[BillingService] Executing subscription renewal charge for user: ${userId}.`);
    sub.currentPeriodEnd = new Date(Date.now() + 30 * 86400 * 1000);
    sub.status = "ACTIVE";

    await eventDispatcher.publish({
      name: "PaymentSucceeded",
      occurredAt: new Date(),
      data: { userId, amount: sub.amount, type: "RENEWAL" }
    });

    return this.returnSuccess(sub);
  }

  /**
   * Handles payment failures, publishing notifications.
   */
  public async handleFailedPayment(userId: string, reason: string): Promise<void> {
    const sub = BillingService.subscriptions.get(userId);
    if (sub) {
      sub.status = "PAST_DUE";
      logger.error(`[BillingService] Payment failed for ${userId}. Subscription marked PAST_DUE. Reason: ${reason}`);

      await eventDispatcher.publish({
        name: "PaymentFailed",
        occurredAt: new Date(),
        data: { userId, reason }
      });
    }
  }

  /**
   * Gets user subscription details.
   */
  public getSubscription(userId: string): Subscription | null {
    return BillingService.subscriptions.get(userId) || null;
  }
}
export const billingService = new BillingService();
export default billingService;
