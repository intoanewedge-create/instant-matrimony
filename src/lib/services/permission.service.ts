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

  // --- User-to-User Interaction Permission Checks ---
  async canSendInterest(senderId: string, receiverId: string): Promise<boolean> {
    try {
      if (senderId === receiverId) return false;

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
      return interest.receiverId === receiverId && interest.status === "PENDING";
    } catch {
      return false;
    }
  }

  async canChat(senderId: string, receiverId: string): Promise<boolean> {
    try {
      if (senderId === receiverId) return true;

      // 1. Both profiles must be APPROVED, non-deleted, and active
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
        senderProfile.user?.deletedAt !== null ||
        !receiverProfile ||
        receiverProfile.deletedAt !== null ||
        receiverProfile.status !== "APPROVED" ||
        !receiverProfile.user?.isActive ||
        receiverProfile.user?.deletedAt !== null
      ) {
        return false;
      }

      // 2. Check block state
      const blocked = await prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: senderId, blockedId: receiverId },
            { blockerId: receiverId, blockedId: senderId },
          ],
        },
      });
      if (blocked) return false;

      // 3. Must have mutual match (either ACCEPTED interest, or interests sent both ways)
      const acceptedMatch = await prisma.interest.findFirst({
        where: {
          OR: [
            { senderId, receiverId, status: "ACCEPTED" },
            { senderId: receiverId, receiverId: senderId, status: "ACCEPTED" },
          ],
        },
      });

      let isMutual = !!acceptedMatch;
      if (!isMutual) {
        const sentAtoB = await prisma.interest.findFirst({ where: { senderId, receiverId } });
        const sentBtoA = await prisma.interest.findFirst({ where: { senderId: receiverId, receiverId: senderId } });
        if (sentAtoB && sentBtoA) {
          isMutual = true;
        }
      }

      if (!isMutual) return false;

      // 4. Sender MUST have active ₹1,000+ membership
      const activeMembership = await prisma.membership.findFirst({
        where: {
          userId: senderId,
          status: "ACTIVE",
          endDate: { gte: new Date() },
        },
        include: { plan: true },
      });

      if (!activeMembership) return false;

      // Allow if plan price >= 1000 or plan name is concierge/standard or features contain direct messaging
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
