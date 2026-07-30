import { BaseService } from "./base.service";
import { Result, returnSuccess, returnFailure } from "../result";
import { VerificationStatus, ModerationAction } from "@prisma/client";
import { IVerificationRepository } from "../repositories/interfaces/verification.repository";
import { IPhotoRepository } from "../repositories/interfaces/photo.repository";
import { IModerationRepository } from "../repositories/interfaces/moderation.repository";
import { eventDispatcher } from "../events/event-dispatcher";
import { prisma } from "../prisma";

export class ModerationService extends BaseService {
  constructor(
    private verificationRepository: IVerificationRepository,
    private photoRepository: IPhotoRepository,
    private moderationRepository: IModerationRepository
  ) {
    super();
  }

  private async getServices() {
    const { auditService, notificationService } = await import("../container");
    return { auditService, notificationService };
  }

  async approvePhoto(photoId: string, moderatorId: string): Promise<Result<void>> {
    try {
      const photo = await this.photoRepository.findById(photoId);
      if (!photo) {
        return this.returnFailure("Photo not found", "PHOTO_NOT_FOUND");
      }

      await this.photoRepository.update(photoId, {
        isApproved: true,
      });

      await this.moderationRepository.create({
        targetUserId: photo.profileId,
        moderatorId,
        action: ModerationAction.PHOTO_APPROVE,
        targetId: photoId,
        reason: "Photo approved",
      });

      const { auditService } = await this.getServices();
      await auditService.log(moderatorId, "PHOTO_APPROVE", undefined, undefined, `Approved photo ${photoId}`);
      
      await eventDispatcher.publish("PhotoApproved", {
        photoId,
        profileId: photo.profileId,
        moderatorId,
      });

      return this.returnSuccess(undefined);
    } catch (e: any) {
      return this.returnFailure(`Failed to approve photo: ${e.message}`);
    }
  }

  async rejectPhoto(photoId: string, moderatorId: string, reason: string): Promise<Result<void>> {
    try {
      const photo = await this.photoRepository.findById(photoId);
      if (!photo) {
        return this.returnFailure("Photo not found", "PHOTO_NOT_FOUND");
      }

      await this.photoRepository.softDelete(photoId);

      await this.moderationRepository.create({
        targetUserId: photo.profileId,
        moderatorId,
        action: ModerationAction.PHOTO_REJECT,
        targetId: photoId,
        reason,
      });

      const { auditService } = await this.getServices();
      await auditService.log(moderatorId, "PHOTO_REJECT", undefined, undefined, `Rejected photo ${photoId}. Reason: ${reason}`);

      await eventDispatcher.publish("PhotoRejected", {
        photoId,
        profileId: photo.profileId,
        moderatorId,
        reason,
      });

      return this.returnSuccess(undefined);
    } catch (e: any) {
      return this.returnFailure(`Failed to reject photo: ${e.message}`);
    }
  }

  async approveVerification(verificationId: string, moderatorId: string): Promise<Result<void>> {
    try {
      const verif = await this.verificationRepository.findById(verificationId);
      if (!verif) {
        return this.returnFailure("Verification request not found", "VERIFICATION_NOT_FOUND");
      }

      await this.verificationRepository.update(verificationId, {
        status: VerificationStatus.APPROVED,
        verifiedAt: new Date(),
        verifiedById: moderatorId,
      });

      await this.moderationRepository.create({
        targetUserId: verif.userId,
        moderatorId,
        action: ModerationAction.VERIFICATION_APPROVE,
        targetId: verificationId,
        reason: "Government ID and Selfie verification approved",
      });

      const { auditService, notificationService } = await this.getServices();
      await auditService.log(moderatorId, "VERIFICATION_APPROVED", undefined, undefined, `Approved user verification ${verif.userId}`);
      
      await notificationService.enqueue(
        verif.userId,
        "Identity Verification Approved!",
        "Your government ID and selfie verification request has been successfully approved. A verification badge has been added to your profile!"
      );

      await eventDispatcher.publish("VerificationApproved", {
        verificationId,
        userId: verif.userId,
        moderatorId,
      });

      return this.returnSuccess(undefined);
    } catch (e: any) {
      return this.returnFailure(`Failed to approve verification: ${e.message}`);
    }
  }

  async rejectVerification(verificationId: string, moderatorId: string, reason: string): Promise<Result<void>> {
    try {
      const verif = await this.verificationRepository.findById(verificationId);
      if (!verif) {
        return this.returnFailure("Verification request not found", "VERIFICATION_NOT_FOUND");
      }

      await this.verificationRepository.update(verificationId, {
        status: VerificationStatus.REJECTED,
        rejectionReason: reason,
      });

      await this.moderationRepository.create({
        targetUserId: verif.userId,
        moderatorId,
        action: ModerationAction.VERIFICATION_REJECT,
        targetId: verificationId,
        reason,
      });

      const { auditService, notificationService } = await this.getServices();
      await auditService.log(moderatorId, "VERIFICATION_REJECTED", undefined, undefined, `Rejected user verification ${verif.userId}. Reason: ${reason}`);

      await notificationService.enqueue(
        verif.userId,
        "Identity Verification Rejected",
        `Your verification request has been rejected. Reason: ${reason}. Please submit valid documents.`
      );

      await eventDispatcher.publish("VerificationRejected", {
        verificationId,
        userId: verif.userId,
        moderatorId,
        reason,
      });

      return this.returnSuccess(undefined);
    } catch (e: any) {
      return this.returnFailure(`Failed to reject verification: ${e.message}`);
    }
  }

  async requestReUploadVerification(verificationId: string, moderatorId: string, reason: string): Promise<Result<void>> {
    try {
      const verif = await this.verificationRepository.findById(verificationId);
      if (!verif) {
        return this.returnFailure("Verification request not found", "VERIFICATION_NOT_FOUND");
      }

      await this.verificationRepository.update(verificationId, {
        status: VerificationStatus.RE_UPLOAD,
        rejectionReason: reason,
      });

      await this.moderationRepository.create({
        targetUserId: verif.userId,
        moderatorId,
        action: ModerationAction.RE_UPLOAD_REQUEST,
        targetId: verificationId,
        reason,
      });

      const { auditService, notificationService } = await this.getServices();
      await auditService.log(moderatorId, "VERIFICATION_RE_UPLOAD_REQUEST", undefined, undefined, `Flagged verification for re-upload: ${verif.userId}. Reason: ${reason}`);

      await notificationService.enqueue(
        verif.userId,
        "Re-upload Documents Request",
        `Our moderation team requested a re-upload of your verification documents. Reason: ${reason}. Please update your submission.`
      );

      await eventDispatcher.publish("VerificationReUploadRequested", {
        verificationId,
        userId: verif.userId,
        moderatorId,
        reason,
      });

      return this.returnSuccess(undefined);
    } catch (e: any) {
      return this.returnFailure(`Failed to request re-upload: ${e.message}`);
    }
  }

  async getModerationHistory(targetUserId: string): Promise<Result<any[]>> {
    try {
      const history = await this.moderationRepository.findByTargetUserId(targetUserId);
      return this.returnSuccess(history);
    } catch (e: any) {
      return this.returnFailure(`Failed to fetch moderation history: ${e.message}`);
    }
  }

  // --- Bulk moderation actions ---
  async bulkApprovePhotos(photoIds: string[], moderatorId: string): Promise<Result<void>> {
    try {
      for (const photoId of photoIds) {
        await this.approvePhoto(photoId, moderatorId);
      }
      return returnSuccess(undefined);
    } catch (e: any) {
      return returnFailure(e.message, "BULK_APPROVE_PHOTOS_ERROR");
    }
  }

  async bulkRejectPhotos(photoIds: string[], moderatorId: string, reason: string): Promise<Result<void>> {
    try {
      for (const photoId of photoIds) {
        await this.rejectPhoto(photoId, moderatorId, reason);
      }
      return returnSuccess(undefined);
    } catch (e: any) {
      return returnFailure(e.message, "BULK_REJECT_PHOTOS_ERROR");
    }
  }

  // --- Blacklist Management ---
  async addToBlacklist(type: "IP" | "EMAIL" | "DEVICE", value: string, reason: string, moderatorId: string): Promise<Result<any>> {
    try {
      const entry = await prisma.blacklist.create({
        data: { type, value, reason },
      });
      const { auditService } = await this.getServices();
      await auditService.log(moderatorId, "BLACKLIST_ADD", undefined, undefined, `Added ${type}:${value} to blacklist. Reason: ${reason}`);
      return returnSuccess(entry);
    } catch (e: any) {
      return returnFailure(e.message, "ADD_TO_BLACKLIST_ERROR");
    }
  }

  async isBlacklisted(type: "IP" | "EMAIL" | "DEVICE", value: string): Promise<boolean> {
    const entry = await prisma.blacklist.findUnique({
      where: { value },
    });
    return !!entry && entry.type === type;
  }

  async removeFromBlacklist(value: string, moderatorId: string): Promise<Result<any>> {
    try {
      const entry = await prisma.blacklist.delete({
        where: { value },
      });
      const { auditService } = await this.getServices();
      await auditService.log(moderatorId, "BLACKLIST_REMOVE", undefined, undefined, `Removed ${value} from blacklist`);
      return returnSuccess(entry);
    } catch (e: any) {
      return returnFailure(e.message, "REMOVE_FROM_BLACKLIST_ERROR");
    }
  }

  // --- Appeals Management ---
  async submitAppeal(userId: string, reason: string): Promise<Result<any>> {
    try {
      const appeal = await prisma.appeal.create({
        data: {
          userId,
          reason,
          status: "PENDING",
        },
      });
      return returnSuccess(appeal);
    } catch (e: any) {
      return returnFailure(e.message, "SUBMIT_APPEAL_ERROR");
    }
  }

  async getAppeals(status?: string): Promise<Result<any[]>> {
    try {
      const appeals = await prisma.appeal.findMany({
        where: status ? { status } : undefined,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      });
      return returnSuccess(appeals);
    } catch (e: any) {
      return returnFailure(e.message, "GET_APPEALS_ERROR");
    }
  }

  async resolveAppeal(appealId: string, status: "APPROVED" | "REJECTED", response: string, moderatorId: string): Promise<Result<any>> {
    try {
      const appeal = await prisma.appeal.update({
        where: { id: appealId },
        data: { status, response },
      });

      const { auditService } = await this.getServices();

      if (status === "APPROVED") {
        // Reactivate user and profile
        await prisma.user.update({
          where: { id: appeal.userId },
          data: { isActive: true },
        });
        await prisma.profile.update({
          where: { userId: appeal.userId },
          data: { status: "APPROVED" },
        });
        await auditService.log(moderatorId, "APPEAL_APPROVED", undefined, undefined, `Approved appeal ${appealId} for user ${appeal.userId}`);
      } else {
        await auditService.log(moderatorId, "APPEAL_REJECTED", undefined, undefined, `Rejected appeal ${appealId} for user ${appeal.userId}`);
      }

      return returnSuccess(appeal);
    } catch (e: any) {
      return returnFailure(e.message, "RESOLVE_APPEAL_ERROR");
    }
  }

  // --- Image Duplicate Check ---
  async checkDuplicatePhoto(checksum: string): Promise<boolean> {
    const meta = await prisma.imageMetadata.findFirst({
      where: { checksum, deletedAt: null },
    });
    return !!meta;
  }

  // --- IP / Device review ---
  async getDeviceSessions(userId: string): Promise<Result<any[]>> {
    try {
      const sessions = await prisma.userSessionHistory.findMany({
        where: { userId },
        orderBy: { loginAt: "desc" },
      });
      return returnSuccess(sessions);
    } catch (e: any) {
      return returnFailure(e.message, "GET_DEVICE_SESSIONS_ERROR");
    }
  }
}
