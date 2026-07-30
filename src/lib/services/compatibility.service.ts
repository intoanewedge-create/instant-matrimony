import { Profile, PartnerPreference } from "@prisma/client";
import { BaseService } from "./base.service";
import { calculateAge } from "../utils/date";

export class CompatibilityService extends BaseService {
  calculate(
    viewer: Profile & { partnerPreference?: PartnerPreference | null },
    candidate: Profile
  ): { score: number; matchedFields: string[]; missingFields: string[] } {
    const matchedFields: string[] = [];
    const missingFields: string[] = [];
    let score = 100;

    const pref = viewer.partnerPreference;
    if (!pref) {
      return { score: 100, matchedFields: ["No Preferences Set"], missingFields: [] };
    }

    if (pref.minAge || pref.maxAge) {
      const age = candidate.dateOfBirth ? calculateAge(candidate.dateOfBirth) : null;
      if (age) {
        const minOk = !pref.minAge || age >= pref.minAge;
        const maxOk = !pref.maxAge || age <= pref.maxAge;
        if (minOk && maxOk) {
          matchedFields.push("Age");
        } else {
          missingFields.push("Age");
          score -= 15;
        }
      } else {
        missingFields.push("Age");
        score -= 15;
      }
    }

    if (pref.minHeight || pref.maxHeight) {
      const height = candidate.height;
      if (height) {
        const minOk = !pref.minHeight || height >= pref.minHeight;
        const maxOk = !pref.maxHeight || height <= pref.maxHeight;
        if (minOk && maxOk) {
          matchedFields.push("Height");
        } else {
          missingFields.push("Height");
          score -= 10;
        }
      } else {
        missingFields.push("Height");
        score -= 10;
      }
    }

    if (pref.religion) {
      if (candidate.religion && candidate.religion.toLowerCase() === pref.religion.toLowerCase()) {
        matchedFields.push("Religion");
      } else {
        missingFields.push("Religion");
        score -= 20;
      }
    }

    if (pref.motherTongue) {
      if (candidate.motherTongue && candidate.motherTongue.toLowerCase() === pref.motherTongue.toLowerCase()) {
        matchedFields.push("Mother Tongue");
      } else {
        missingFields.push("Mother Tongue");
        score -= 15;
      }
    }

    if (pref.maritalStatus) {
      if (candidate.maritalStatus && candidate.maritalStatus.toLowerCase() === pref.maritalStatus.toLowerCase()) {
        matchedFields.push("Marital Status");
      } else {
        missingFields.push("Marital Status");
        score -= 10;
      }
    }

    if (pref.country) {
      if (candidate.country && candidate.country.toLowerCase() === pref.country.toLowerCase()) {
        matchedFields.push("Country");
      } else {
        missingFields.push("Country");
        score -= 15;
      }
    }

    if (pref.education) {
      if (candidate.education && candidate.education.toLowerCase().includes(pref.education.toLowerCase())) {
        matchedFields.push("Education");
      } else {
        missingFields.push("Education");
        score -= 15;
      }
    }

    const finalScore = Math.max(0, Math.min(100, score));
    return { score: finalScore, matchedFields, missingFields };
  }
}
