import { Profile, Photo } from "@prisma/client";
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

export class CompletionService extends BaseService {
  private readonly SECTION_WEIGHT = 100 / 7; // ~14.29%

  getBreakdown(
    profile: Profile & {
      photos?: Photo[];
    },
  ): CompletionBreakdown {
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
  calculate(profile: Profile & { photos?: Photo[] }): number {
    return this.getBreakdown(profile).percent;
  }

  private isPersonalComplete(profile: Profile): boolean {
    return Boolean(
      profile.gender &&
      profile.dateOfBirth &&
      profile.height &&
      profile.maritalStatus,
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
    return Boolean(profile.familyType || profile.familyDetails);
  }

  private isLifestyleComplete(profile: Profile): boolean {
    return Boolean(profile.bio && profile.bio.trim().length > 10);
  }

  private isPartnerPreferencesComplete(profile: Profile): boolean {
    return Boolean(profile.partnerPreferences);
  }

  private isProfilePhotoComplete(
    profile: Profile & { photos?: Photo[] },
  ): boolean {
    return Boolean(profile.photos && profile.photos.length > 0);
  }
}
