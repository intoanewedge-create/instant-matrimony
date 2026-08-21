import { BaseService } from "./base.service";
import { Result, returnSuccess, returnFailure } from "../result";
import { prisma } from "../prisma";
import { AdminRole, AdminPermission, ROLE_PERMISSIONS } from "../domain/admin-contracts";

export class PermissionService extends BaseService {
  constructor() {
    super();
  }

  // --- RBAC Admin Controls ---
  hasPermission(role: AdminRole, permission: AdminPermission): boolean {
    const permissions = ROLE_PERMISSIONS[role];
    if (!permissions) return false;
    return permissions.includes(permission);
  }

  async checkPermission(userId: string, permission: AdminPermission): Promise<Result<boolean>> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) {
        return returnFailure("User not found", "USER_NOT_FOUND");
      }

      const role = user.role as AdminRole;
      const allowed = this.hasPermission(role, permission);

      if (!allowed) {
        return returnFailure(`Access denied: Required permission ${permission}`, "ACCESS_DENIED");
      }

      return returnSuccess(true);
    } catch (e: any) {
      return returnFailure(e.message, "PERMISSION_CHECK_ERROR");
    }
  }

  // --- Helper for Strict Gender-Based Matching Isolation ---
  async isGenderOpposite(userId: string, targetUserId: string): Promise<boolean> {
    try {
      if (userId === targetUserId) return true;
      const userProfile = await prisma.profile.findUnique({
        where: { userId },
        select: { gender: true },
      });
      const targetProfile = await prisma.profile.findUnique({
        where: { userId: targetUserId },
        select: { gender: true },
      });

      if (!userProfile?.gender || !targetProfile?.gender) return false;

      const uGender = userProfile.gender.toUpperCase();
      const tGender = targetProfile.gender.toUpperCase();

      if (uGender === "MALE") return tGender === "FEMALE";
      if (uGender === "FEMALE") return tGender === "MALE";
      return false;
    } catch {
      return false;
    }
  }

  // --- User-to-User Interaction Permission Checks ---
  async canSendInterest(senderId: string, receiverId: string): Promise<boolean> {
    try {
      if (senderId === receiverId) return false;

      // 0. Strict Gender Isolation Check
      const isOpposite = await this.isGenderOpposite(senderId, receiverId);
      if (!isOpposite) return false;

      // Check profile approval status for both sender & receiver
      const senderProfile = await prisma.profile.findUnique({
        where: { userId: senderId },
        select: { status: true, deletedAt: true, user: { select: { isActive: true, deletedAt: true } } },
      });
      const receiverProfile = await prisma.profile.findUnique({
        where: { userId: receiverId },
        select: { status: true, deletedAt: true, user: { select: { isActive: true, deletedAt: true } } },
      });

      if (
        !senderProfile ||
        senderProfile.deletedAt !== null ||
        senderProfile.status !== "APPROVED" ||
        !senderProfile.user?.isActive ||
        senderProfile.user?.deletedAt !== null
      ) {
        return false;
      }
      if (
        !receiverProfile ||
        receiverProfile.deletedAt !== null ||
        receiverProfile.status !== "APPROVED" ||
        !receiverProfile.user?.isActive ||
        receiverProfile.user?.deletedAt !== null
      ) {
        return false;
      }

      // Check block state
      const blocked = await prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: senderId, blockedId: receiverId },
            { blockerId: receiverId, blockedId: senderId },
          ],
        },
      });
      if (blocked) return false;

      // Check existing pending/accepted interest
      const existing = await prisma.interest.findFirst({
        where: {
          senderId,
          receiverId,
          status: { in: ["PENDING", "ACCEPTED"] },
        },
      });
      if (existing) return false;

      return true;
    } catch {
      return false;
    }
  }

  async canAcceptInterest(receiverId: string, interestId: string): Promise<boolean> {
    try {
      const interest = await prisma.interest.findUnique({
        where: { id: interestId },
        include: {
          sender: { select: { isActive: true, deletedAt: true } },
          receiver: { select: { isActive: true, deletedAt: true } },
        },
      });
      if (!interest) return false;
      if (!interest.sender?.isActive || interest.sender?.deletedAt !== null) return false;
      if (!interest.receiver?.isActive || interest.receiver?.deletedAt !== null) return false;

      // Enforce gender isolation for accept
      const isOpposite = await this.isGenderOpposite(interest.senderId, interest.receiverId);
      if (!isOpposite) return false;

      return interest.receiverId === receiverId && interest.status === "PENDING";
    } catch {
      return false;
    }
  }

  async canChat(senderId: string, receiverId: string): Promise<boolean> {
    try {
      if (senderId === receiverId) return true;

      const [
        senderProfile,
        receiverProfile,
        blocked,
        acceptedMatch,
        sentAtoB,
        sentBtoA,
        activeMembership,
      ] = await Promise.all([
        prisma.profile.findUnique({
          where: { userId: senderId },
          select: { gender: true, status: true, deletedAt: true, user: { select: { isActive: true, deletedAt: true } } },
        }),
        prisma.profile.findUnique({
          where: { userId: receiverId },
          select: { gender: true, status: true, deletedAt: true, user: { select: { isActive: true, deletedAt: true } } },
        }),
        prisma.block.findFirst({
          where: {
            OR: [
              { blockerId: senderId, blockedId: receiverId },
              { blockerId: receiverId, blockedId: senderId },
            ],
          },
          select: { id: true },
        }),
        prisma.interest.findFirst({
          where: {
            OR: [
              { senderId, receiverId, status: "ACCEPTED" },
              { senderId: receiverId, receiverId: senderId, status: "ACCEPTED" },
            ],
          },
          select: { id: true },
        }),
        prisma.interest.findFirst({
          where: { senderId, receiverId },
          select: { id: true },
        }),
        prisma.interest.findFirst({
          where: { senderId: receiverId, receiverId: senderId },
          select: { id: true },
        }),
        prisma.membership.findFirst({
          where: {
            userId: senderId,
            status: "ACTIVE",
            endDate: { gte: new Date() },
          },
          include: { plan: true },
        }),
      ]);

      // 0. Strict Gender Isolation Check
      if (!senderProfile?.gender || !receiverProfile?.gender) return false;
      const uGender = senderProfile.gender.toUpperCase();
      const tGender = receiverProfile.gender.toUpperCase();
      if ((uGender === "MALE" && tGender !== "FEMALE") || (uGender === "FEMALE" && tGender !== "MALE")) {
        return false;
      }

      // 1. Both profiles must be APPROVED, non-deleted, and active
      if (
        senderProfile.deletedAt !== null ||
        senderProfile.status !== "APPROVED" ||
        !senderProfile.user?.isActive ||
        senderProfile.user?.deletedAt !== null ||
        receiverProfile.deletedAt !== null ||
        receiverProfile.status !== "APPROVED" ||
        !receiverProfile.user?.isActive ||
        receiverProfile.user?.deletedAt !== null
      ) {
        return false;
      }

      // 2. Check block state
      if (blocked) return false;

      // 3. Must have mutual match
      const isMutual = !!acceptedMatch || (!!sentAtoB && !!sentBtoA);
      if (!isMutual) return false;

      // 4. Sender MUST have active ₹1,000+ membership
      if (!activeMembership) return false;

      const planPrice = activeMembership.plan?.price ?? 0;
      const planName = activeMembership.plan?.name?.toLowerCase() || "";
      const planFeatures = (activeMembership.plan?.features as string[]) || [];

      const isEligiblePlan =
        planPrice >= 1000 ||
        planName.includes("standard") ||
        planName.includes("concierge") ||
        planFeatures.some((f) => f.toUpperCase().includes("MESSAGING") || f.toUpperCase().includes("CONTACT"));

      return isEligiblePlan;
    } catch {
      return false;
    }
  }

  async canViewProfile(userId: string, targetUserId: string): Promise<boolean> {
    try {
      if (userId === targetUserId) return true;

      // Enforce Gender Isolation
      const isOpposite = await this.isGenderOpposite(userId, targetUserId);
      if (!isOpposite) return false;

      const targetProfile = await prisma.profile.findUnique({
        where: { userId: targetUserId },
        select: { status: true, deletedAt: true, user: { select: { isActive: true, deletedAt: true } } },
      });
      if (
        !targetProfile ||
        targetProfile.deletedAt !== null ||
        targetProfile.status !== "APPROVED" ||
        !targetProfile.user?.isActive ||
        targetProfile.user?.deletedAt !== null
      ) {
        return false;
      }

      // Check block state
      const blocked = await prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: userId, blockedId: targetUserId },
            { blockerId: targetUserId, blockedId: userId },
          ],
        },
      });
      return !blocked;
    } catch {
      return false;
    }
  }
}
export const permissionService = new PermissionService();
