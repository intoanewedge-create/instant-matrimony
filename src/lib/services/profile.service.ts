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
      const { submitForReview, ...dbFields } = stepData;

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
}
