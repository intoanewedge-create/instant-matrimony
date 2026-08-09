import { RecommendationProvider } from "./recommendation-provider";
import { Result, returnSuccess, returnFailure } from "../result";
import { prisma } from "../prisma";
import { recommendationConfig } from "../../config/recommendation.config";
import { calculateAge } from "../utils/date";
import { ProfileMapper } from "../mappers/profile.mapper";

export class DefaultRecommendationProvider implements RecommendationProvider {
  name(): string {
    return "DefaultRecommendationProvider";
  }

  async getRecommendations(
    userId: string,
    limit: number,
  ): Promise<Result<any[]>> {
    try {
      const viewer = await prisma.profile.findUnique({
        where: { userId },
        include: { partnerPreference: true },
      });

      if (!viewer) {
        return returnFailure(
          "Viewer profile not found",
          "VIEWER_PROFILE_NOT_FOUND",
        );
      }

      const blocks = await prisma.block.findMany({
        where: {
          OR: [{ blockerId: userId }, { blockedId: userId }],
        },
      });
      const blockedUserIds = blocks
        .flatMap((b) => [b.blockerId, b.blockedId])
        .filter((id) => id !== userId);

      const candidates = await prisma.profile.findMany({
        where: {
          userId: { notIn: [userId, ...blockedUserIds] },
          status: "APPROVED",
          deletedAt: null,
          user: {
            isActive: true,
            deletedAt: null,
          },
          gender:
            viewer.gender === "MALE"
              ? "FEMALE"
              : viewer.gender === "FEMALE"
                ? "MALE"
                : undefined,
        },
        include: {
          photos: {
            where: { deletedAt: null, isApproved: true },
          },
          user: {
            include: {
              memberships: {
                where: {
                  status: "ACTIVE",
                  endDate: { gte: new Date() },
                },
              },
              identityVerification: true,
            },
          },
        },
      });

      const scored = candidates.map((cand) => {
        const scoreDetails = this.scoreCandidate(viewer, cand);
        return {
          profile: cand,
          ...scoreDetails,
        };
      });

      const sorted = scored.sort((a, b) => b.score - a.score).slice(0, limit);

      const mappedSorted = sorted.map((item) => {
        const dto = ProfileMapper.toResponse(item.profile);
        return {
          ...item,
          profile: {
            ...dto,
            user: item.profile.user ? {
              name: item.profile.user.name,
              identityVerification: item.profile.user.identityVerification ? {
                status: item.profile.user.identityVerification.status
              } : null
            } : null
          }
        };
      });

      return returnSuccess(mappedSorted);
    } catch (e: any) {
      return returnFailure(e.message, "RECOMMENDATIONS_ERROR");
    }
  }

  private scoreCandidate(
    viewer: any,
    candidate: any,
  ): {
    score: number;
    grade: string;
    scoreBreakdown: Record<string, number>;
    strengths: string[];
    weaknesses: string[];
    confidence: number;
    explanation: string;
  } {
    const weights = recommendationConfig.weights;
    const pref = viewer.partnerPreference;

    let totalPoints = 0;
    let earnedPoints = 0;
    const scoreBreakdown: Record<string, number> = {};
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    const addScoreItem = (name: keyof typeof weights, earned: number) => {
      const maxWeight = weights[name];
      totalPoints += maxWeight;
      earnedPoints += earned;
      scoreBreakdown[name as string] = Math.round((earned / maxWeight) * 100);
    };

    // 1. Age
    if (pref?.minAge || pref?.maxAge) {
      const age = candidate.dateOfBirth
        ? calculateAge(candidate.dateOfBirth)
        : null;
      if (age) {
        const minOk = !pref.minAge || age >= pref.minAge;
        const maxOk = !pref.maxAge || age <= pref.maxAge;
        if (minOk && maxOk) {
          addScoreItem("age", weights.age);
          strengths.push("Age fits preferences");
        } else {
          addScoreItem("age", 0);
          weaknesses.push("Age outside preferred range");
        }
      } else {
        addScoreItem("age", 0);
      }
    } else {
      addScoreItem("age", weights.age);
    }

    // 2. Religion
    if (pref?.religion) {
      if (
        candidate.religion &&
        candidate.religion.toLowerCase() === pref.religion.toLowerCase()
      ) {
        addScoreItem("religion", weights.religion);
        strengths.push("Shared religion");
      } else {
        addScoreItem("religion", 0);
        weaknesses.push("Different religion");
      }
    } else {
      addScoreItem("religion", weights.religion);
    }

    // 3. Caste
    if (pref?.caste) {
      if (
        candidate.caste &&
        candidate.caste.toLowerCase() === pref.caste.toLowerCase()
      ) {
        addScoreItem("caste", weights.caste);
        strengths.push("Same caste");
      } else {
        addScoreItem("caste", 0);
        weaknesses.push("Caste preference mismatch");
      }
    } else {
      addScoreItem("caste", weights.caste);
    }

    // 4. Mother Tongue
    if (pref?.motherTongue) {
      if (
        candidate.motherTongue &&
        candidate.motherTongue.toLowerCase() === pref.motherTongue.toLowerCase()
      ) {
        addScoreItem("motherTongue", weights.motherTongue);
        strengths.push("Same mother tongue");
      } else {
        addScoreItem("motherTongue", 0);
        weaknesses.push("Different mother tongue");
      }
    } else {
      addScoreItem("motherTongue", weights.motherTongue);
    }

    // 5. Marital Status
    if (pref?.maritalStatus) {
      if (
        candidate.maritalStatus &&
        candidate.maritalStatus.toLowerCase() ===
          pref.maritalStatus.toLowerCase()
      ) {
        addScoreItem("maritalStatus", weights.maritalStatus);
      } else {
        addScoreItem("maritalStatus", 0);
      }
    } else {
      addScoreItem("maritalStatus", weights.maritalStatus);
    }

    // 6. Height
    if (pref?.minHeight || pref?.maxHeight) {
      const height = candidate.height;
      if (height) {
        const minOk = !pref.minHeight || height >= pref.minHeight;
        const maxOk = !pref.maxHeight || height <= pref.maxHeight;
        if (minOk && maxOk) {
          addScoreItem("height", weights.height);
        } else {
          addScoreItem("height", 0);
        }
      } else {
        addScoreItem("height", 0);
      }
    } else {
      addScoreItem("height", weights.height);
    }

    // 7. Location (Country + State + City)
    let locScore = 0;
    if (
      candidate.country &&
      viewer.country &&
      candidate.country.toLowerCase() === viewer.country.toLowerCase()
    ) {
      locScore += weights.location * 0.4;
      if (
        candidate.state &&
        viewer.state &&
        candidate.state.toLowerCase() === viewer.state.toLowerCase()
      ) {
        locScore += weights.location * 0.3;
        if (
          candidate.city &&
          viewer.city &&
          candidate.city.toLowerCase() === viewer.city.toLowerCase()
        ) {
          locScore += weights.location * 0.3;
        }
      }
    }
    addScoreItem("location", locScore);
    if (locScore === weights.location) {
      strengths.push("Located in the same city");
    } else if (locScore > 0) {
      strengths.push("Located in the same country");
    }

    // 8. Education & Occupation
    if (pref?.education && candidate.education) {
      if (
        candidate.education.toLowerCase().includes(pref.education.toLowerCase())
      ) {
        addScoreItem("education", weights.education);
        strengths.push("Matching education level");
      } else {
        addScoreItem("education", 0);
      }
    } else {
      addScoreItem("education", weights.education);
    }
    addScoreItem("occupation", candidate.occupation ? weights.occupation : 0);

    // 9. Income
    if (candidate.income && viewer.income) {
      if (candidate.income >= viewer.income * 0.8) {
        addScoreItem("income", weights.income);
      } else {
        addScoreItem("income", weights.income * 0.5);
      }
    } else {
      addScoreItem("income", weights.income * 0.5);
    }

    // 10. Profile Completion
    const completionEarned =
      (candidate.completionPercent / 100) * weights.profileCompletion;
    addScoreItem("profileCompletion", completionEarned);

    // 11. Verification
    const isVerified =
      candidate.user?.identityVerification?.status === "APPROVED";
    addScoreItem(
      "identityVerification",
      isVerified ? weights.identityVerification : 0,
    );
    if (isVerified) {
      strengths.push("Identity verified badge");
    } else {
      weaknesses.push("Profile not verified yet");
    }

    // 12. Premium Membership
    const isPremium = (candidate.user?.memberships?.length || 0) > 0;
    addScoreItem(
      "premiumMembership",
      isPremium ? weights.premiumMembership : 0,
    );
    if (isPremium) {
      strengths.push("Premium subscription benefit");
    }

    // 13. Recently Active
    const lastActive = candidate.user?.lastLoginAt;
    const isActiveRecent =
      lastActive &&
      Date.now() - new Date(lastActive).getTime() < 3 * 24 * 60 * 60 * 1000;
    addScoreItem("recentlyActive", isActiveRecent ? weights.recentlyActive : 0);

    // 14. Lifestyle compatibility (smoking / drinking / foodPreference)
    // Uses viewer's own attributes as reference — matching attributes earn full credit,
    // missing/unknown attributes earn a neutral baseline share (0.8).
    const lifestyleAxes: Array<"smoking" | "drinking" | "foodPreference"> = [
      "smoking",
      "drinking",
      "foodPreference",
    ];
    let lifestyleHits = 0;
    let lifestyleTotal = 0;
    for (const axis of lifestyleAxes) {
      const v = (viewer as any)[axis];
      const c = (candidate as any)[axis];
      if (v && c) {
        lifestyleTotal += 1;
        if (String(v).toLowerCase() === String(c).toLowerCase())
          lifestyleHits += 1;
      }
    }
    const lifestyleRatio =
      lifestyleTotal > 0 ? lifestyleHits / lifestyleTotal : 0.8;
    addScoreItem("lifestyle", weights.lifestyle * lifestyleRatio);
    if (lifestyleTotal > 0 && lifestyleRatio === 1) {
      strengths.push("Matching lifestyle preferences");
    } else if (lifestyleTotal > 0 && lifestyleRatio === 0) {
      weaknesses.push("Different lifestyle preferences");
    }

    // 15. Family values compatibility
    let familyRatio = 0.9;
    if (viewer.familyValues && candidate.familyValues) {
      familyRatio =
        viewer.familyValues.toLowerCase() ===
        candidate.familyValues.toLowerCase()
          ? 1
          : 0.5;
    }
    addScoreItem("familyValues", weights.familyValues * familyRatio);

    addScoreItem("horoscope", weights.horoscope);
    addScoreItem("mutualInterests", weights.mutualInterests * 0.7);
    addScoreItem("activityScore", weights.activityScore * 0.8);

    const finalPercentage = Math.round((earnedPoints / totalPoints) * 100);

    let grade = "C";
    if (finalPercentage >= recommendationConfig.grades.APlus.min) {
      grade = recommendationConfig.grades.APlus.label;
    } else if (finalPercentage >= recommendationConfig.grades.A.min) {
      grade = recommendationConfig.grades.A.label;
    } else if (finalPercentage >= recommendationConfig.grades.BPlus.min) {
      grade = recommendationConfig.grades.BPlus.label;
    } else if (finalPercentage >= recommendationConfig.grades.B.min) {
      grade = recommendationConfig.grades.B.label;
    }

    const explanation = `Matched ${strengths.length} key fields, with an overall compatibility of ${finalPercentage}%.`;

    return {
      score: finalPercentage,
      grade,
      scoreBreakdown,
      strengths,
      weaknesses,
      confidence: candidate.completionPercent / 100,
      explanation,
    };
  }
}
