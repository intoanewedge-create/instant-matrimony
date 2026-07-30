import { BaseService } from "./base.service";
import { CompatibilityService } from "./compatibility.service";

export class SearchRankingService extends BaseService {
  constructor(private compatibilityService: CompatibilityService) {
    super();
  }

  rankCandidates(viewerProfile: any, candidates: any[]): any[] {
    const scored = candidates.map((cand) => {
      const compatibility = this.compatibilityService.calculate(viewerProfile, cand);
      
      let rankingScore = compatibility.score;

      // 1. Premium Boost
      const isPremium = (cand.user?.memberships?.length || 0) > 0;
      if (isPremium) rankingScore += 15;

      // 2. Verification Boost
      const isVerified = cand.user?.identityVerification?.status === "APPROVED";
      if (isVerified) rankingScore += 10;

      // 3. Profile Completion Boost
      if (cand.completionPercent >= 85) {
        rankingScore += 5;
      }

      // 4. Recent Activity Boost
      const lastActive = cand.user?.lastLoginAt;
      const isActiveRecent = lastActive && Date.now() - new Date(lastActive).getTime() < 3 * 24 * 60 * 60 * 1000;
      if (isActiveRecent) {
        rankingScore += 5;
      }

      return {
        candidate: cand,
        compatibility,
        rankingScore,
      };
    });

    // Sort by rankingScore descending
    const sorted = scored.sort((a, b) => b.rankingScore - a.rankingScore);

    return sorted.map((item) => ({
      ...item.candidate,
      compatibility: item.compatibility,
      rankingScore: item.rankingScore,
    }));
  }
}
