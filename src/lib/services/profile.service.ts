import { BaseService } from "./base.service";
import { Result } from "../result";
import { IProfileRepository } from "../repositories/interfaces/profile.repository";
import { CompletionService } from "./completion.service";
import { eventDispatcher } from "../events/event-dispatcher";
import { DOMAIN_EVENTS } from "@/constants";
import { prisma } from "../prisma";

const ALLOWED_PROFILE_FIELDS = [
  "gender",
  "dateOfBirth",
  "religion",
  "motherTongue",
  "caste",
  "subCaste",
  "gothram",
  "height",
  "weight",
  "maritalStatus",
  "education",
  "occupation",
  "income",
  "city",
  "state",
  "country",
  "district",
  "bio",
  "familyDetails",
  "familyValues",
  "horoscope",
  "smoking",
  "drinking",
  "foodPreference",
] as const;

const ALLOWED_PREF_FIELDS = [
  "minAge",
  "maxAge",
  "minHeight",
  "maxHeight",
  "maritalStatus",
  "religion",
  "motherTongue",
  "education",
  "country",
] as const;

export class ProfileService extends BaseService {
  constructor(
    private profileRepository: IProfileRepository,
    private completionService: CompletionService,
  ) {
    super();
  }

  async getProfileByUserId(userId: string): Promise<Result<any>> {
    try {
      console.log("Looking for profile with userId:", userId);

      const profile = await this.profileRepository.findByUserId(userId);

      if (!profile)
        return this.returnFailure("Profile not found", "PROFILE_NOT_FOUND");

      return this.returnSuccess(profile);
    } catch (e: any) {
      return this.returnFailure(e.message, "PROFILE_FETCH_ERROR");
    }
  }

  async updateProfile(userId: string, data: any): Promise<Result<any>> {
    try {
      const profile = await this.profileRepository.findByUserId(userId);
      console.log("Profile found:", profile);
      if (!profile)
        return this.returnFailure("Profile not found", "PROFILE_NOT_FOUND");

      let resetToPending = false;
      if (profile.status === "APPROVED") {
        const criticalFields = [
          "gender",
          "dateOfBirth",
          "religion",
          "caste",
          "income",
        ];
        for (const field of criticalFields) {
          if (
            data[field] !== undefined &&
            data[field] !== (profile as any)[field]
          ) {
            resetToPending = true;
            break;
          }
        }
      }

      // Filter to only allowed profile fields
      const cleanProfileData: Record<string, any> = {};
      for (const field of ALLOWED_PROFILE_FIELDS) {
        if (data[field] !== undefined) {
          cleanProfileData[field] = data[field];
        }
      }

      const mergedProfile = { ...profile, ...cleanProfileData };
      const completionPercent = this.completionService.calculate(mergedProfile);

      const status = resetToPending ? "PENDING" : profile.status;

      const updated = await this.profileRepository.update(profile.id, {
        ...cleanProfileData,
        completionPercent,
        status,
      });

      // If partner preference data was also provided in updateProfile, sync it
      if (data.partnerPreference) {
        await this.updatePartnerPreference(userId, data.partnerPreference);
      }

      if (resetToPending) {
        await eventDispatcher.publish(DOMAIN_EVENTS.PROFILE_SUBMITTED, {
          userId,
          profileId: profile.id,
          reason: "Critical fields updated post-approval",
        });
      }

      return this.returnSuccess(updated);
    } catch (e: any) {
      return this.returnFailure(e.message, "PROFILE_UPDATE_ERROR");
    }
  }

  async saveWizardStep(
    userId: string,
    step: number,
    stepData: any,
  ): Promise<Result<any>> {
    try {
      const profile = await this.profileRepository.findByUserId(userId);
      if (!profile)
        return this.returnFailure("Profile not found", "PROFILE_NOT_FOUND");

      // Step 1: User name and phone
      if (step === 1) {
        const { name, phone } = stepData;
        if (name || phone) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              ...(name ? { name } : {}),
              ...(phone ? { phone } : {}),
            },
          });
        }
        return this.returnSuccess(profile);
      }

      // If partner preference data was provided (e.g. Step 8 or Step 7)
      const hasPrefFields = ALLOWED_PREF_FIELDS.some((f) => stepData[f] !== undefined);
      if (hasPrefFields && (step === 7 || step === 8)) {
        await this.updatePartnerPreference(userId, stepData);
      }

      let status = profile.status;
      if (stepData.submitForReview || (step === 10 && stepData.submitForReview !== false)) {
        status = "PENDING";
      }

      // Strip submitForReview flag and filter only allowed Profile fields
      const { submitForReview: _submitForReview, ...rawFields } = stepData;

      const cleanDbFields: Record<string, any> = {};
      for (const field of ALLOWED_PROFILE_FIELDS) {
        if (rawFields[field] !== undefined) {
          cleanDbFields[field] = rawFields[field];
        }
      }

      const mergedProfile = { ...profile, ...cleanDbFields };
      const completionPercent = this.completionService.calculate(mergedProfile);

      const updated = await this.profileRepository.update(profile.id, {
        ...cleanDbFields,
        completionPercent,
        status,
      });

      if (stepData.submitForReview || (step === 10 && stepData.submitForReview !== false)) {
        await eventDispatcher.publish(DOMAIN_EVENTS.PROFILE_SUBMITTED, {
          userId,
          profileId: profile.id,
          reason: "Completed onboarding wizard",
        });
      }

      return this.returnSuccess(updated);
    } catch (e: any) {
      return this.returnFailure(e.message, "WIZARD_SAVE_ERROR");
    }
  }

  async updatePartnerPreference(
    userId: string,
    prefData: any,
  ): Promise<Result<any>> {
    try {
      const profile = await this.profileRepository.findByUserId(userId);
      if (!profile)
        return this.returnFailure("Profile not found", "PROFILE_NOT_FOUND");

      const cleanPrefData: Record<string, any> = {};
      for (const field of ALLOWED_PREF_FIELDS) {
        if (prefData[field] !== undefined) {
          cleanPrefData[field] = prefData[field];
        }
      }

      const updated = await this.executeTransaction(async (tx) => {
        const pref = await tx.partnerPreference.upsert({
          where: { profileId: profile.id },
          create: { ...cleanPrefData, profileId: profile.id },
          update: cleanPrefData,
        });

        const fullProfile = await tx.profile.findFirst({
          where: { id: profile.id },
          include: { photos: true, partnerPreference: true },
        });
        const completionPercent = this.completionService.calculate(fullProfile);
        await tx.profile.update({
          where: { id: profile.id },
          data: { completionPercent },
        });

        return pref;
      });

      return this.returnSuccess(updated);
    } catch (e: any) {
      return this.returnFailure(e.message, "PREFERENCE_UPDATE_ERROR");
    }
  }

  async approveProfile(adminUserId: string, profileId: string): Promise<Result<any>> {
    try {
      const profile = await this.profileRepository.findById(profileId);
      if (!profile) return this.returnFailure("Profile not found", "PROFILE_NOT_FOUND");
      if (profile.status === "APPROVED") return this.returnFailure("Profile is already approved", "INVALID_STATUS");

      const previousStatus = profile.status;
      const updated = await this.profileRepository.update(profileId, {
        status: "APPROVED",
        approvedById: adminUserId,
        approvedAt: new Date(),
        rejectionReason: null,
      });

      await eventDispatcher.publish(DOMAIN_EVENTS.PROFILE_APPROVED, {
        userId: profile.userId,
        profileId,
        approvedById: adminUserId,
        previousStatus,
      });

      return this.returnSuccess(updated);
    } catch (e: any) {
      return this.returnFailure(e.message, "PROFILE_APPROVE_ERROR");
    }
  }

  async rejectProfile(adminUserId: string, profileId: string, reason: string): Promise<Result<any>> {
    try {
      if (!reason || reason.trim().length === 0) {
        return this.returnFailure("Rejection reason is required", "REASON_REQUIRED");
      }
      const profile = await this.profileRepository.findById(profileId);
      if (!profile) return this.returnFailure("Profile not found", "PROFILE_NOT_FOUND");
      if (profile.status === "SUSPENDED") return this.returnFailure("Cannot reject a suspended profile", "INVALID_STATUS");

      const previousStatus = profile.status;
      const updated = await this.profileRepository.update(profileId, {
        status: "REJECTED",
        rejectionReason: reason.trim(),
      });

      await eventDispatcher.publish(DOMAIN_EVENTS.PROFILE_REJECTED, {
        userId: profile.userId,
        profileId,
        rejectedById: adminUserId,
        reason,
        previousStatus,
      });

      return this.returnSuccess(updated);
    } catch (e: any) {
      return this.returnFailure(e.message, "PROFILE_REJECT_ERROR");
    }
  }

  async suspendProfile(adminUserId: string, profileId: string, reason?: string): Promise<Result<any>> {
    try {
      const profile = await this.profileRepository.findById(profileId);
      if (!profile) return this.returnFailure("Profile not found", "PROFILE_NOT_FOUND");

      const updated = await this.profileRepository.update(profileId, {
        status: "SUSPENDED",
        rejectionReason: reason || null,
      });

      return this.returnSuccess(updated);
    } catch (e: any) {
      return this.returnFailure(e.message, "PROFILE_SUSPEND_ERROR");
    }
  }

  async restoreProfile(adminUserId: string, profileId: string): Promise<Result<any>> {
    try {
      const profile = await this.profileRepository.findById(profileId);
      if (!profile) return this.returnFailure("Profile not found", "PROFILE_NOT_FOUND");
      if (profile.status !== "SUSPENDED" && profile.status !== "REJECTED") {
        return this.returnFailure("Only suspended or rejected profiles can be restored", "INVALID_STATUS");
      }

      const updated = await this.profileRepository.update(profileId, {
        status: "APPROVED",
        rejectionReason: null,
      });

      return this.returnSuccess(updated);
    } catch (e: any) {
      return this.returnFailure(e.message, "PROFILE_RESTORE_ERROR");
    }
  }

  async resubmitProfile(userId: string): Promise<Result<any>> {
    try {
      const profile = await this.profileRepository.findByUserId(userId);
      if (!profile) return this.returnFailure("Profile not found", "PROFILE_NOT_FOUND");
      if (profile.status !== "REJECTED" && profile.status !== "DRAFT") {
        return this.returnFailure("Only rejected or draft profiles can be resubmitted", "INVALID_STATUS");
      }

      if (profile.completionPercent < 50) {
        return this.returnFailure("Profile must be at least 50% complete before submission", "INCOMPLETE_PROFILE");
      }

      const updated = await this.profileRepository.update(profile.id, {
        status: "PENDING",
        rejectionReason: null,
      });

      await eventDispatcher.publish(DOMAIN_EVENTS.PROFILE_SUBMITTED, {
        userId,
        profileId: profile.id,
        reason: "Resubmitted after edits",
      });

      return this.returnSuccess(updated);
    } catch (e: any) {
      return this.returnFailure(e.message, "PROFILE_RESUBMIT_ERROR");
    }
  }

  async deleteProfileByAdmin(adminUserId: string, profileId: string, reason?: string): Promise<Result<any>> {
    try {
      const profile = await this.profileRepository.findById(profileId);
      if (!profile) return this.returnFailure("Profile not found", "PROFILE_NOT_FOUND");

      const now = new Date();

      const result = await this.executeTransaction(async (tx) => {
        const updatedProfile = await tx.profile.update({
          where: { id: profileId },
          data: {
            status: "DELETED",
            deletedAt: now,
            rejectionReason: reason ? `[DELETED BY ADMIN] ${reason}` : "[DELETED BY ADMIN]",
          },
        });

        const existingUser = await tx.user.findUnique({
          where: { id: profile.userId },
          select: { id: true, email: true, phone: true },
        });

        if (existingUser) {
          const timestamp = now.getTime();
          const cleanId = existingUser.id.replace(/-/g, "").slice(0, 8);
          const anonymizedEmail = existingUser.email.startsWith("deleted_")
            ? existingUser.email
            : `deleted_${timestamp}_${cleanId}_${existingUser.email}`;

          const anonymizedPhone = existingUser.phone
            ? existingUser.phone.startsWith("deleted_")
              ? existingUser.phone
              : `deleted_${timestamp}_${cleanId}_${existingUser.phone}`
            : null;

          await tx.user.update({
            where: { id: profile.userId },
            data: {
              isActive: false,
              accountStatus: "SUSPENDED",
              deletedAt: now,
              email: anonymizedEmail,
              phone: anonymizedPhone,
            },
          });
        }

        return updatedProfile;
      });

      const { auditService } = await import("../container");
      await auditService.log(
        adminUserId,
        "ADMIN_PROFILE_DELETED",
        undefined,
        undefined,
        `Soft-deleted profile ${profileId} (User ${profile.userId}). Reason: ${reason || "Admin removal"}`
      );

      return this.returnSuccess(result);
    } catch (e: any) {
      return this.returnFailure(e.message, "PROFILE_DELETE_ERROR");
    }
  }

  async getProfilePrivacy(userId: string): Promise<Result<any>> {
    try {
      const profile = await this.profileRepository.findByUserId(userId);
      if (!profile) return this.returnFailure("Profile not found", "PROFILE_NOT_FOUND");

      const privacy = await prisma.profilePrivacy.findUnique({
        where: { profileId: profile.id },
      });

      return this.returnSuccess(
        privacy || {
          blurPhotos: false,
          hidePhone: false,
          hideIncome: false,
          hideFamilyDetails: false,
          hideLastSeen: false,
          hideOnlineStatus: false,
        }
      );
    } catch (e: any) {
      return this.returnFailure(e.message, "PRIVACY_GET_ERROR");
    }
  }

  async updateProfilePrivacy(userId: string, data: any): Promise<Result<any>> {
    try {
      const profile = await this.profileRepository.findByUserId(userId);
      if (!profile) return this.returnFailure("Profile not found", "PROFILE_NOT_FOUND");

      const privacyData: any = {};
      const fields = [
        "blurPhotos",
        "hidePhone",
        "hideIncome",
        "hideFamilyDetails",
        "hideLastSeen",
        "hideOnlineStatus",
      ];
      for (const f of fields) {
        if (typeof data[f] === "boolean") {
          privacyData[f] = data[f];
        }
      }

      const privacy = await prisma.profilePrivacy.upsert({
        where: { profileId: profile.id },
        update: privacyData,
        create: {
          ...privacyData,
          profileId: profile.id,
        },
      });

      return this.returnSuccess(privacy);
    } catch (e: any) {
      return this.returnFailure(e.message, "PRIVACY_UPDATE_ERROR");
    }
  }
}
