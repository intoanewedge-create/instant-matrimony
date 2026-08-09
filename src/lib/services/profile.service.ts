import { BaseService } from "./base.service";
import { Result } from "../result";
import { IProfileRepository } from "../repositories/interfaces/profile.repository";
import { CompletionService } from "./completion.service";
import { eventDispatcher } from "../events/event-dispatcher";
import { DOMAIN_EVENTS } from "@/constants";

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

      const mergedProfile = { ...profile, ...data };
      const completionPercent = this.completionService.calculate(mergedProfile);

      const status = resetToPending ? "PENDING" : profile.status;

      const updated = await this.profileRepository.update(profile.id, {
        ...data,
        completionPercent,
        status,
      });

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

      let status = profile.status;
      if (step === 8 && stepData.submitForReview) {
        status = "PENDING";
      }

      // Strip submitForReview flag from actual database fields
      const { submitForReview: _submitForReview, ...dbFields } = stepData;

      const mergedProfile = { ...profile, ...dbFields };
      const completionPercent = this.completionService.calculate(mergedProfile);

      const updated = await this.profileRepository.update(profile.id, {
        ...dbFields,
        completionPercent,
        status,
      });

      if (step === 8 && stepData.submitForReview) {
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

      const updated = await this.executeTransaction(async (tx) => {
        const pref = await tx.partnerPreference.upsert({
          where: { profileId: profile.id },
          create: { ...prefData, profileId: profile.id },
          update: prefData,
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
}
