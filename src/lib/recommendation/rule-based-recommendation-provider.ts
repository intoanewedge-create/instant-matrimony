import { RecommendationProvider } from "./recommendation-provider";
import { RecommendationPipeline } from "./pipeline/recommendation-pipeline";
import { Result, returnSuccess, returnFailure } from "../result";
import { prisma } from "../prisma";

export class RuleBasedRecommendationProvider implements RecommendationProvider {
  constructor(private pipeline: RecommendationPipeline) {}

  name(): string {
    return "RuleBasedRecommendationProvider";
  }

  async getRecommendations(userId: string, limit: number): Promise<Result<any[]>> {
    try {
      const viewerProfile = await prisma.profile.findUnique({
        where: { userId },
        include: { partnerPreference: true, user: true },
      });

      if (!viewerProfile) {
        return returnFailure("Viewer profile not found", "VIEWER_PROFILE_NOT_FOUND");
      }

      const mappedViewer: any = {
        id: viewerProfile.id,
        userId: viewerProfile.userId,
        name: viewerProfile.user?.name || "User",
        gender: viewerProfile.gender,
        religion: viewerProfile.religion,
        caste: viewerProfile.caste,
        motherTongue: viewerProfile.motherTongue,
        maritalStatus: viewerProfile.maritalStatus,
        dateOfBirth: viewerProfile.dateOfBirth,
        height: viewerProfile.height,
        country: viewerProfile.country,
        state: viewerProfile.state,
        city: viewerProfile.city,
        education: viewerProfile.education,
        occupation: viewerProfile.occupation,
        income: viewerProfile.income ? Number(viewerProfile.income) : null,
        completionPercent: viewerProfile.completionPercent || 0,
        isVerified: false, // fallback handled in pipeline
        isPremium: false,
        lastLoginAt: viewerProfile.user?.lastLoginAt || null,
      };

      const viewerPreferences: any = viewerProfile.partnerPreference || null;

      const { recommendations } = await this.pipeline.generate(mappedViewer, viewerPreferences, limit);
      
      const response = recommendations.map((r) => ({
        profile: r.candidate,
        score: r.score.totalScore,
        grade: r.score.grade,
        scoreBreakdown: r.score.scoreBreakdown,
        strengths: r.score.strengths,
        weaknesses: r.score.weaknesses,
        confidence: r.score.confidence,
        explanation: r.score.explanation,
      }));

      return returnSuccess(response);
    } catch (e: any) {
      return returnFailure(e.message, "RECOMMENDATIONS_PROVIDER_ERROR");
    }
  }
}
