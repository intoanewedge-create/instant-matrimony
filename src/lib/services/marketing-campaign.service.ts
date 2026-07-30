import { BaseService } from "./base.service";
import { Result, returnSuccess, returnFailure } from "../result";
import { prisma } from "../prisma";
import { CampaignDto, CouponDto } from "../domain/admin-contracts";

export class MarketingCampaignService extends BaseService {
  constructor() {
    super();
  }

  // --- Campaign Management ---
  async createCampaign(data: {
    name: string;
    type: "EMAIL" | "SMS" | "PUSH" | "LANDING";
    targetSegment: string;
    content: string;
    scheduledAt?: Date;
  }, adminId: string): Promise<Result<any>> {
    try {
      const campaign = await prisma.campaign.create({
        data: {
          name: data.name,
          type: data.type,
          status: data.scheduledAt ? "SCHEDULED" : "DRAFT",
          targetSegment: data.targetSegment,
          content: data.content,
          scheduledAt: data.scheduledAt || null,
        },
      });

      const { auditService } = await import("../container");
      await auditService.log(adminId, "CAMPAIGN_CREATE", undefined, undefined, `Created campaign: ${data.name}`);
      return returnSuccess(campaign);
    } catch (e: any) {
      return returnFailure(e.message, "CREATE_CAMPAIGN_ERROR");
    }
  }

  async getCampaigns(): Promise<Result<CampaignDto[]>> {
    try {
      const campaigns = await prisma.campaign.findMany({
        orderBy: { createdAt: "desc" },
      });
      return returnSuccess(campaigns as any[]);
    } catch (e: any) {
      return returnFailure(e.message, "GET_CAMPAIGNS_ERROR");
    }
  }

  async triggerScheduledCampaigns(): Promise<Result<number>> {
    try {
      const now = new Date();
      const pending = await prisma.campaign.findMany({
        where: {
          status: "SCHEDULED",
          scheduledAt: { lte: now },
        },
      });

      let count = 0;
      for (const camp of pending) {
        // Mock execution: pretend we send them to users
        await prisma.campaign.update({
          where: { id: camp.id },
          data: {
            status: "COMPLETED",
            sentCount: 150, // mock count
            clickCount: 15,
          },
        });
        count++;
      }
      return returnSuccess(count);
    } catch (e: any) {
      return returnFailure(e.message, "TRIGGER_CAMPAIGNS_ERROR");
    }
  }

  // --- Coupon Management ---
  async createCoupon(data: {
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    startDate: Date;
    endDate: Date;
    maxRedemptions?: number;
  }, adminId: string): Promise<Result<any>> {
    try {
      const coupon = await prisma.coupon.create({
        data: {
          code: data.code.toUpperCase(),
          discountType: data.discountType,
          discountValue: data.discountValue,
          startDate: data.startDate,
          endDate: data.endDate,
          maxRedemptions: data.maxRedemptions || 0,
        },
      });

      const { auditService } = await import("../container");
      await auditService.log(adminId, "COUPON_CREATE", undefined, undefined, `Created coupon: ${data.code}`);
      return returnSuccess(coupon);
    } catch (e: any) {
      return returnFailure(e.message, "CREATE_COUPON_ERROR");
    }
  }

  async validateCoupon(code: string): Promise<Result<any>> {
    try {
      const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (!coupon || !coupon.isActive) {
        return returnFailure("Coupon not found or is inactive", "COUPON_INVALID");
      }

      const now = new Date();
      if (now < coupon.startDate || now > coupon.endDate) {
        return returnFailure("Coupon has expired or is not yet active", "COUPON_EXPIRED");
      }

      if (coupon.maxRedemptions > 0 && coupon.currentRedemptions >= coupon.maxRedemptions) {
        return returnFailure("Coupon redemption limit reached", "COUPON_LIMIT_REACHED");
      }

      return returnSuccess(coupon);
    } catch (e: any) {
      return returnFailure(e.message, "VALIDATE_COUPON_ERROR");
    }
  }

  async redeemCoupon(code: string): Promise<Result<void>> {
    try {
      const validation = await this.validateCoupon(code);
      if (!validation.success) return validation;

      const coupon = validation.data;
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: {
          currentRedemptions: { increment: 1 },
        },
      });
      return returnSuccess(undefined);
    } catch (e: any) {
      return returnFailure(e.message, "REDEEM_COUPON_ERROR");
    }
  }

  // --- Referral Program ---
  async createReferral(referrerId: string, refereeId: string): Promise<Result<any>> {
    try {
      // Ensure no existing referral for this referee
      const existing = await prisma.referral.findUnique({
        where: { refereeId },
      });
      if (existing) {
        return returnFailure("Referee already has an associated referral", "REFERRAL_EXISTS");
      }

      const referral = await prisma.referral.create({
        data: {
          referrerId,
          refereeId,
          status: "PENDING",
          rewardPoints: 100, // standard reward points
        },
      });
      return returnSuccess(referral);
    } catch (e: any) {
      return returnFailure(e.message, "CREATE_REFERRAL_ERROR");
    }
  }

  async completeReferral(refereeId: string): Promise<Result<any>> {
    try {
      const referral = await prisma.referral.findUnique({
        where: { refereeId },
      });

      if (!referral || referral.status === "COMPLETED") {
        return returnSuccess(null);
      }

      const updated = await prisma.referral.update({
        where: { refereeId },
        data: { status: "COMPLETED" },
      });

      // Award points (mock transaction credit)
      await prisma.transaction.create({
        data: {
          userId: referral.referrerId,
          amount: referral.rewardPoints,
          type: "CREDIT",
          description: `Referral award points completed for referee: ${refereeId}`,
        },
      });

      return returnSuccess(updated);
    } catch (e: any) {
      return returnFailure(e.message, "COMPLETE_REFERRAL_ERROR");
    }
  }
}
export const marketingCampaignService = new MarketingCampaignService();
