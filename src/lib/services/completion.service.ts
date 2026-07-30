import { Profile, Photo } from "@prisma/client";
import { BaseService } from "./base.service";

export class CompletionService extends BaseService {
  calculate(profile: Profile & { photos?: Photo[] }): number {
    let score = 0;

    let basicCount = 0;
    if (profile.gender) basicCount++;
    if (profile.dateOfBirth) basicCount++;
    if (profile.height) basicCount++;
    if (profile.maritalStatus) basicCount++;
    score += (basicCount / 4) * 25;

    let contactCount = 0;
    if (profile.city) contactCount++;
    if (profile.state) contactCount++;
    if (profile.country) contactCount++;
    score += (contactCount / 3) * 20;

    let eduCareerCount = 0;
    if (profile.education) eduCareerCount++;
    if (profile.occupation) eduCareerCount++;
    if (profile.income !== null && profile.income !== undefined) eduCareerCount++;
    score += (eduCareerCount / 3) * 20;

    if (profile.bio && profile.bio.trim().length > 10) {
      score += 15;
    }

    if (profile.photos && profile.photos.length > 0) {
      score += 20;
    }

    return Math.round(score);
  }
}
