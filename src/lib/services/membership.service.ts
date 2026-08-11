import { BaseService } from "./base.service";
import { Result } from "../result";
import { IMembershipRepository } from "../repositories/interfaces/membership.repository";
import { eventDispatcher } from "../events/event-dispatcher";
import { DOMAIN_EVENTS } from "@/constants";
import { prisma } from "../prisma";

export class MembershipService extends BaseService {
  constructor(private membershipRepository: IMembershipRepository) {
    super();
  }

  async getActiveMembership(userId: string): Promise<Result<any>> {
    try {
      const membership = await this.membershipRepository.findActiveByUserId(userId);
      if (!membership) {
        return this.returnFailure("No active membership found", "NO_ACTIVE_MEMBERSHIP");
      }
      return this.returnSuccess(membership);
    } catch (e: any) {
      return this.returnFailure(e.message, "MEMBERSHIP_FETCH_ERROR");
    }
  }

  async checkoutPlan(userId: string, planId: string, gateway: string = "STRIPE"): Promise<Result<any>> {
    try {
      const plan = await this.membershipRepository.findPlanById(planId);
      if (!plan) return this.returnFailure("Membership plan not found", "PLAN_NOT_FOUND");

      const result = await this.membershipRepository.createMembershipTransaction({
        userId,
        planId,
        amount: plan.price,
        durationDays: plan.durationDays,
        gateway,
      });

      await eventDispatcher.publish(DOMAIN_EVENTS.MEMBERSHIP_PURCHASED, {
        userId,
        planId,
        membershipId: result.membership.id,
        amount: plan.price,
      });

      return this.returnSuccess(result);
    } catch (e: any) {
      return this.returnFailure(e.message, "CHECKOUT_ERROR");
    }
  }

  async getSubscriptionTier(userId: string): Promise<Result<any>> {
    try {
      const membership = await this.membershipRepository.findActiveByUserId(userId);
      if (!membership || membership.status !== "ACTIVE" || new Date(membership.endDate) < new Date()) {
        return this.returnSuccess({
          plan: "FREE",
          isPremium: false,
          status: "INACTIVE",
          features: ["SEARCH_PROFILES", "LIMITED_INTERESTS"],
        });
      }
      const activeMem = membership as any;
      return this.returnSuccess({
        plan: activeMem.plan?.name?.toUpperCase() || "GOLD",
        isPremium: true,
        status: "ACTIVE",
        endDate: membership.endDate,
        features: activeMem.plan?.features || [
          "UNLIMITED_INTERESTS",
          "CONTACT_DETAILS",
          "DIRECT_MESSAGING",
          "ADVANCED_FILTERS",
          "PRIORITY_VISIBILITY",
          "WHO_VIEWED_ME",
          "READ_RECEIPTS",
        ],
      });
    } catch (e: any) {
      return this.returnFailure(e.message, "SUBSCRIPTION_TIER_ERROR");
    }
  }

  async canAccessPremiumFeature(userId: string, feature: string): Promise<Result<boolean>> {
    try {
      const tierRes = await this.getSubscriptionTier(userId);
      if (!tierRes.success) return this.returnSuccess(false);

      const { isPremium, features: _features } = tierRes.data;
      if (!isPremium) {
        const freeAllowed = ["SEARCH_PROFILES", "LIMITED_INTERESTS"];
        return this.returnSuccess(freeAllowed.includes(feature.toUpperCase()));
      }

      return this.returnSuccess(true);
    } catch {
      return this.returnSuccess(false);
    }
  }

  async getUserMembershipStatus(userId: string): Promise<Result<{
    plan: string;
    status: string;
    expiresAt: string | null;
    features: string[];
  }>> {
    const tierRes = await this.getSubscriptionTier(userId);
    if (!tierRes.success || !tierRes.data.isPremium) {
      return this.returnSuccess({
        plan: "FREE",
        status: "INACTIVE",
        expiresAt: null,
        features: ["SEARCH_PROFILES", "LIMITED_INTERESTS"],
      });
    }
    return this.returnSuccess({
      plan: tierRes.data.plan,
      status: tierRes.data.status,
      expiresAt: tierRes.data.endDate ? new Date(tierRes.data.endDate).toISOString() : null,
      features: tierRes.data.features,
    });
  }

  async getPlans(): Promise<Result<any>> {
    const defaultPlans = [
      {
        id: "plan-standard-1000",
        name: "Standard Membership",
        description: "Essential contact unlocks and unlimited messaging for verified matchmaking.",
        price: 1000,
        durationDays: 30,
        features: [
          "Unlock up to 5 Contact Numbers",
          "Unlimited Match Express Interests",
          "Direct Messaging with Mutual Matches",
          "Verified Match Badges",
          "Standard Profile Search & Filters",
        ],
        isActive: true,
      },
      {
        id: "plan-concierge-500000",
        name: "VIP Matrimony Concierge",
        description: "Dedicated Relationship Manager, handpicked shortlists, background verification & family introductions.",
        price: 500000,
        durationDays: 180,
        features: [
          "Dedicated Relationship Manager",
          "Handpicked & Vetted Match Shortlists",
          "Direct Family Introduction & Coordination",
          "Kundli & Horoscope Matching by Astrologers",
          "VIP Profile Highlighting & Priority Placement",
          "Confidential & Private Matchmaking Assistance",
        ],
        isActive: true,
      },
    ];

    try {
      const plans = await this.membershipRepository.findAllPlans(true);
      if (plans && plans.length > 0) {
        return this.returnSuccess(plans);
      }
      return this.returnSuccess(defaultPlans);
    } catch {
      return this.returnSuccess(defaultPlans);
    }
  }

  async submitManualPayment(
    userId: string,
    planId: string,
    paymentMethod?: string,
    utrNumber?: string,
    receiptUrl?: string,
    bankName?: string,
    accountHolder?: string
  ): Promise<Result<any>> {
    try {
      const plan = await this.membershipRepository.findPlanById(planId);
      if (!plan) return this.returnFailure("Membership plan not found", "PLAN_NOT_FOUND");

      // 1. Check for pending payment on this plan (Scenario A & D)
      const existingPending = await prisma.payment.findFirst({
        where: {
          userId,
          planId,
          status: "PENDING",
        },
      });

      if (existingPending) {
        return this.returnFailure(
          `Your payment for ${plan.name} is currently under verification. Please wait for validation before making another payment.`,
          "PAYMENT_PENDING_VERIFICATION"
        );
      }

      // 2. Check for active membership on this plan (Scenario B & Renewal)
      const activeMembership = await prisma.membership.findFirst({
        where: {
          userId,
          status: "ACTIVE",
          endDate: { gte: new Date() },
        },
        include: { plan: true },
      });

      if (activeMembership) {
        if (activeMembership.planId === planId) {
          return this.returnFailure(
            "This membership is already active. Please wait until your current membership expires before renewing.",
            "MEMBERSHIP_ALREADY_ACTIVE"
          );
        }
        if (activeMembership.plan && activeMembership.plan.price > plan.price) {
          return this.returnFailure(
            "You already have an active VIP membership with higher tier access.",
            "ACTIVE_HIGHER_TIER"
          );
        }
      }

      // 3. Check for duplicate UTR / Transaction ID across other users
      if (utrNumber && utrNumber.trim()) {
        const duplicateUtr = await prisma.payment.findFirst({
          where: {
            utrNumber: utrNumber.trim(),
            status: { in: ["PENDING", "PAID"] },
            NOT: { userId },
          },
        });

        if (duplicateUtr) {
          return this.returnFailure(
            "This transaction reference has already been submitted for verification.",
            "DUPLICATE_TRANSACTION_ID"
          );
        }
      }

      const payment = await (this.membershipRepository as any).createManualPayment({
        userId,
        planId,
        amount: plan.price,
        paymentMethod: paymentMethod || "MANUAL_UPI",
        utrNumber: utrNumber?.trim() || `TXN-${Date.now().toString(36).toUpperCase()}`,
        receiptUrl,
        bankName,
        accountHolder,
      });

      await eventDispatcher.publish(DOMAIN_EVENTS.PAYMENT_SUBMITTED, {
        paymentId: payment.id,
        userId,
        planId,
        amount: plan.price,
        utrNumber: payment.utrNumber,
      });

      return this.returnSuccess(payment);
    } catch (e: any) {
      return this.returnFailure(e.message || "Failed to submit payment verification request", "PAYMENT_SUBMIT_ERROR");
    }
  }

  async approvePayment(adminUserId: string, paymentId: string): Promise<Result<any>> {
    try {
      const result = await (this.membershipRepository as any).approveManualPayment(adminUserId, paymentId);
      if (!result.success) return this.returnFailure(result.error || "Failed to approve payment", "APPROVE_ERROR");

      await eventDispatcher.publish(DOMAIN_EVENTS.PAYMENT_APPROVED, {
        paymentId,
        userId: result.userId,
        membershipId: result.membership.id,
      });

      await eventDispatcher.publish(DOMAIN_EVENTS.MEMBERSHIP_ACTIVATED, {
        userId: result.userId,
        membershipId: result.membership.id,
        planName: result.planName,
      });

      return this.returnSuccess(result);
    } catch (e: any) {
      return this.returnFailure(e.message, "PAYMENT_APPROVE_ERROR");
    }
  }

  async rejectPayment(adminUserId: string, paymentId: string, reason: string): Promise<Result<any>> {
    try {
      if (!reason || !reason.trim()) {
        return this.returnFailure("Rejection reason is required", "REASON_REQUIRED");
      }

      const result = await (this.membershipRepository as any).rejectManualPayment(adminUserId, paymentId, reason);
      if (!result.success) return this.returnFailure(result.error || "Failed to reject payment", "REJECT_ERROR");

      return this.returnSuccess(result);
    } catch (e: any) {
      return this.returnFailure(e.message, "PAYMENT_REJECT_ERROR");
    }
  }
}
