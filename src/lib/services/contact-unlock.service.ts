import { BaseService } from "./base.service";
import { Result } from "../result";
import { prisma } from "../prisma";
import { eventDispatcher } from "../events/event-dispatcher";
import { DOMAIN_EVENTS } from "@/constants";

export class ContactUnlockService extends BaseService {
  async unlockContact(userId: string, targetUserId: string): Promise<Result<any>> {
    try {
      if (userId === targetUserId) {
        return this.returnFailure("You cannot unlock your own contact", "INVALID_TARGET");
      }

      // Check target user is active and not deleted
      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { id: true, isActive: true, deletedAt: true },
      });
      if (!targetUser || !targetUser.isActive || targetUser.deletedAt !== null) {
        return this.returnFailure("Target profile is no longer available.", "TARGET_USER_NOT_AVAILABLE");
      }

      // 1. Check active membership
      const activeMembership = await prisma.membership.findFirst({
        where: {
          userId,
          status: "ACTIVE",
          endDate: { gte: new Date() },
        },
        include: { plan: true },
      });

      if (!activeMembership) {
        return this.returnFailure(
          "An active membership is required to unlock contact details. Please upgrade your plan.",
          "MEMBERSHIP_REQUIRED"
        );
      }

      // 2. Check interest ACCEPTED status between both members
      const interest = await prisma.interest.findFirst({
        where: {
          OR: [
            { senderId: userId, receiverId: targetUserId, status: "ACCEPTED" },
            { senderId: targetUserId, receiverId: userId, status: "ACCEPTED" },
          ],
        },
      });

      if (!interest) {
        return this.returnFailure(
          "Contact details can only be unlocked after a match interest request has been ACCEPTED by both members.",
          "INTEREST_NOT_ACCEPTED"
        );
      }

      // 3. Check if already unlocked
      const existingUnlock = await prisma.contactUnlock.findFirst({
        where: { userId, targetUserId },
      });

      if (existingUnlock) {
        return this.returnSuccess({ unlock: existingUnlock, isAlreadyUnlocked: true });
      }

      // 4. Check quota limits (Max 5 unlocks per active membership)
      const unlocksCount = await prisma.contactUnlock.count({
        where: {
          userId,
          membershipId: activeMembership.id,
        },
      });

      if (unlocksCount >= 5) {
        return this.returnFailure(
          "You have reached the maximum 5 contact unlocks quota for your current membership plan.",
          "UNLOCK_LIMIT_REACHED"
        );
      }

      // 5. Create permanent ContactUnlock record
      const unlock = await prisma.contactUnlock.create({
        data: {
          userId,
          targetUserId,
          membershipId: activeMembership.id,
          interestId: interest.id,
          unlockReason: `Unlocked via ${activeMembership.plan?.name || "Standard Plan"}`,
        },
      });

      await eventDispatcher.publish(DOMAIN_EVENTS.CONTACT_UNLOCKED, {
        userId,
        targetUserId,
        unlockId: unlock.id,
      });

      return this.returnSuccess({ unlock, isAlreadyUnlocked: false });
    } catch (e: any) {
      return this.returnFailure(e.message, "CONTACT_UNLOCK_ERROR");
    }
  }

  async getUnlockQuota(userId: string): Promise<Result<{ remainingUnlocks: number; totalUnlocksUsed: number; isUnlimited: boolean }>> {
    try {
      const activeMembership = await prisma.membership.findFirst({
        where: {
          userId,
          status: "ACTIVE",
          endDate: { gte: new Date() },
        },
        include: { plan: true },
      });

      if (!activeMembership) {
        return this.returnSuccess({ remainingUnlocks: 0, totalUnlocksUsed: 0, isUnlimited: false });
      }

      const usedInCurrentPlan = await prisma.contactUnlock.count({
        where: {
          userId,
          membershipId: activeMembership.id,
        },
      });

      const remaining = Math.max(0, 5 - usedInCurrentPlan);
      return this.returnSuccess({ remainingUnlocks: remaining, totalUnlocksUsed: usedInCurrentPlan, isUnlimited: false });
    } catch (e: any) {
      return this.returnFailure(e.message, "QUOTA_FETCH_ERROR");
    }
  }
}
export const contactUnlockService = new ContactUnlockService();
