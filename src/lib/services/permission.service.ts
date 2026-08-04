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
        select: { status: true, user: { select: { isActive: true } } },
      });
      const receiverProfile = await prisma.profile.findUnique({
        where: { userId: receiverId },
        select: { status: true, user: { select: { isActive: true } } },
      });

      if (!senderProfile || senderProfile.status !== "APPROVED" || !senderProfile.user?.isActive) {
        return false;
      }
      if (!receiverProfile || receiverProfile.status !== "APPROVED" || !receiverProfile.user?.isActive) {
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
      });
      if (!interest) return false;
      return interest.receiverId === receiverId && interest.status === "PENDING";
    } catch {
      return false;
    }
  }

  async canChat(senderId: string, receiverId: string): Promise<boolean> {
    try {
      if (senderId === receiverId) return true;

      // Both profiles must be APPROVED
      const senderProfile = await prisma.profile.findUnique({
        where: { userId: senderId },
        select: { status: true },
      });
      const receiverProfile = await prisma.profile.findUnique({
        where: { userId: receiverId },
        select: { status: true },
      });
      if (senderProfile?.status !== "APPROVED" || receiverProfile?.status !== "APPROVED") {
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

      // Must have mutual match (accepted interest either way)
      const match = await prisma.interest.findFirst({
        where: {
          OR: [
            { senderId, receiverId, status: "ACCEPTED" },
            { senderId: receiverId, receiverId: senderId, status: "ACCEPTED" },
          ],
        },
      });
      return !!match;
    } catch {
      return false;
    }
  }

  async canViewProfile(userId: string, targetUserId: string): Promise<boolean> {
    try {
      if (userId === targetUserId) return true;

      const targetProfile = await prisma.profile.findUnique({
        where: { userId: targetUserId },
        select: { status: true, user: { select: { isActive: true } } },
      });
      if (!targetProfile || targetProfile.status !== "APPROVED" || !targetProfile.user?.isActive) {
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
