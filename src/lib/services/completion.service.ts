import { Profile, Photo, PartnerPreference } from "@prisma/client";
import { BaseService } from "./base.service";

export type CompletionSectionKey =
  | "personal"
  | "education"
  | "profession"
  | "family"
  | "lifestyle"
  | "partnerPreferences"
  | "profilePhoto";

export interface CompletionSection {
  key: CompletionSectionKey;
  name: string;
  percent: number;
  completed: boolean;
}

export interface CompletionBreakdown {
  percent: number;
  sections: CompletionSection[];
  missingSections: string[];
}

export type ProfileForCompletion = Profile & {
  photos?: Photo[];
  partnerPreference?: PartnerPreference | null;
};

export class CompletionService extends BaseService {
  private readonly SECTION_WEIGHT = 100 / 7; // ~14.29%

  getBreakdown(profile: ProfileForCompletion): CompletionBreakdown {
    const sections: CompletionSection[] = [
      {
        key: "personal",
        name: "Personal",
        percent: this.SECTION_WEIGHT,
        completed: this.isPersonalComplete(profile),
      },
      {
        key: "education",
        name: "Education",
        percent: this.SECTION_WEIGHT,
        completed: this.isEducationComplete(profile),
      },
      {
        key: "profession",
        name: "Profession",
        percent: this.SECTION_WEIGHT,
        completed: this.isProfessionComplete(profile),
      },
      {
        key: "family",
        name: "Family",
        percent: this.SECTION_WEIGHT,
        completed: this.isFamilyComplete(profile),
      },
      {
        key: "lifestyle",
        name: "Lifestyle",
        percent: this.SECTION_WEIGHT,
        completed: this.isLifestyleComplete(profile),
      },
      {
        key: "partnerPreferences",
        name: "Partner Preferences",
        percent: this.SECTION_WEIGHT,
        completed: this.isPartnerPreferencesComplete(profile),
      },
      {
        key: "profilePhoto",
        name: "Profile Photo",
        percent: this.SECTION_WEIGHT,
        completed: this.isProfilePhotoComplete(profile),
      },
    ];

    const completedSections = sections.filter(
      (section) => section.completed,
    ).length;

    const percent = Math.round(completedSections * this.SECTION_WEIGHT);

    const missingSections = sections
      .filter((section) => !section.completed)
      .map((section) => section.name);

    return {
      percent,
      sections,
      missingSections,
    };
  }

  /**
   * Backwards-compatible wrapper.
   * Existing call sites do not need changes.
   */
  calculate(profile: ProfileForCompletion): number {
    return this.getBreakdown(profile).percent;
  }

  private isPersonalComplete(profile: Profile): boolean {
    return Boolean(
      profile.gender &&
      profile.dateOfBirth &&
      profile.height &&
      profile.maritalStatus &&
      profile.religion &&
      profile.motherTongue,
    );
  }

  private isEducationComplete(profile: Profile): boolean {
    return Boolean(profile.education);
  }

  private isProfessionComplete(profile: Profile): boolean {
    return Boolean(
      profile.occupation &&
      profile.income !== null &&
      profile.income !== undefined,
    );
  }

  private isFamilyComplete(profile: Profile): boolean {
    return Boolean(profile.familyValues || profile.horoscope);
  }

  private isLifestyleComplete(profile: Profile): boolean {
    return Boolean(
      (profile.bio && profile.bio.trim().length > 10) ||
      profile.smoking ||
      profile.drinking ||
      profile.foodPreference,
    );
  }

  private isPartnerPreferencesComplete(profile: ProfileForCompletion): boolean {
    const pref = profile.partnerPreference;
    if (!pref) return false;
    return Boolean(
      pref.minAge ||
      pref.maxAge ||
      pref.minHeight ||
      pref.maxHeight ||
      pref.religion ||
      pref.motherTongue ||
      pref.education ||
      pref.country ||
      pref.maritalStatus,
    );
  }

  private isProfilePhotoComplete(profile: ProfileForCompletion): boolean {
    return Boolean(profile.photos && profile.photos.length > 0);
  }
}
