import { prisma } from "../../prisma";
import { UserProfile, PartnerPreference, RecommendationContext, CompatibilityScore } from "../../domain/contracts";
import {
  ICandidateCollector,
  ICandidateFilter,
  ICompatibilityScorer,
  IBehaviorBoostService,
  IRecommendationRanker,
  IExplanationProvider,
} from "./pipeline-interfaces";
import {
  AgeStrategy,
  ReligionStrategy,
  EducationStrategy,
  OccupationStrategy,
  LifestyleStrategy,
  LocationStrategy,
  PartnerPreferenceStrategy,
  BehaviorHistoryStrategy,
  PremiumBoostStrategy,
  VerificationBoostStrategy,
  ScoringStrategy,
} from "../strategies/scoring-strategy";
import { MatchExplanationProvider } from "../match-explanation-provider";
import { loggerService } from "../../services/logger.service";

// 1. Candidate Collector
export class DbCandidateCollector implements ICandidateCollector {
  async collect(viewer: UserProfile): Promise<UserProfile[]> {
    const genderToFetch = viewer.gender === "MALE" ? "FEMALE" : viewer.gender === "FEMALE" ? "MALE" : undefined;
    
    const profiles = await prisma.profile.findMany({
      where: {
        status: "APPROVED",
        deletedAt: null,
        gender: genderToFetch,
        userId: { not: viewer.userId },
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

    return profiles.map((p: any) => ({
      id: p.id,
      userId: p.userId,
      name: p.user?.name || "User",
      gender: p.gender,
      religion: p.religion,
      caste: p.caste,
      motherTongue: p.motherTongue,
      maritalStatus: p.maritalStatus,
      dateOfBirth: p.dateOfBirth,
      height: p.height,
      country: p.country,
      state: p.state,
      city: p.city,
      education: p.education,
      occupation: p.occupation,
      income: p.income ? Number(p.income) : null,
      completionPercent: p.completionPercent || 0,
      isVerified: p.user?.identityVerification?.status === "APPROVED",
      isPremium: (p.user?.memberships?.length || 0) > 0,
      lastLoginAt: p.user?.lastLoginAt || null,
    }));
  }
}

// 2. Candidate Filter
export class DbCandidateFilter implements ICandidateFilter {
  async filter(viewer: UserProfile, candidates: UserProfile[]): Promise<UserProfile[]> {
    const blocks = await prisma.block.findMany({
      where: {
        OR: [
          { blockerId: viewer.userId },
          { blockedId: viewer.userId },
        ],
      },
    });
    const blockedIds = new Set(blocks.flatMap((b) => [b.blockerId, b.blockedId]).filter((id) => id !== viewer.userId));

    const hiddenRecs = await prisma.recommendationHistory.findMany({
      where: {
        userId: viewer.userId,
        hidden: true,
      },
    });
    const hiddenIds = new Set(hiddenRecs.map((h) => h.targetId));

    return candidates.filter((c) => !blockedIds.has(c.userId) && !hiddenIds.has(c.userId));
  }
}

// 3. Compatibility Scorer
export class StrategyCompatibilityScorer implements ICompatibilityScorer {
  private strategies: ScoringStrategy[] = [
    new AgeStrategy(),
    new ReligionStrategy(),
    new EducationStrategy(),
    new OccupationStrategy(),
    new LifestyleStrategy(),
    new LocationStrategy(),
    new PartnerPreferenceStrategy(),
    new BehaviorHistoryStrategy(),
    new PremiumBoostStrategy(),
    new VerificationBoostStrategy(),
  ];

  async score(context: RecommendationContext): Promise<CompatibilityScore> {
    const scoreBreakdown: Record<string, number> = {};
    let totalScore = 0;

    for (const strategy of this.strategies) {
      const earned = strategy.calculateScore(context);
      scoreBreakdown[strategy.name] = earned;
      totalScore += earned;
    }

    totalScore = Math.min(totalScore, 100);

    let grade = "C";
    if (totalScore >= 90) grade = "A+";
    else if (totalScore >= 80) grade = "A";
    else if (totalScore >= 70) grade = "B+";
    else if (totalScore >= 60) grade = "B";

    return {
      totalScore,
      grade,
      scoreBreakdown,
      strengths: [],
      weaknesses: [],
      confidence: context.candidate.completionPercent / 100,
      explanation: "",
    };
  }
}

// 4. Behavior Boost Service
export class DbBehaviorBoostService implements IBehaviorBoostService {
  async getBehaviorContext(viewerId: string): Promise<any> {
    const history = await prisma.recommendationHistory.findMany({
      where: { userId: viewerId, clicked: true },
      take: 50,
      include: {
        target: {
          include: {
            profile: true,
          },
        },
      },
    });

    const clickedReligions: Record<string, number> = {};
    const clickedCastes: Record<string, number> = {};
    const clickedOccupations: Record<string, number> = {};
    const clickedCities: Record<string, number> = {};

    for (const item of history) {
      const prof = item.target?.profile;
      if (prof) {
        if (prof.religion) clickedReligions[prof.religion.toLowerCase()] = (clickedReligions[prof.religion.toLowerCase()] || 0) + 1;
        if (prof.caste) clickedCastes[prof.caste.toLowerCase()] = (clickedCastes[prof.caste.toLowerCase()] || 0) + 1;
        if (prof.occupation) clickedOccupations[prof.occupation.toLowerCase()] = (clickedOccupations[prof.occupation.toLowerCase()] || 0) + 1;
        if (prof.city) clickedCities[prof.city.toLowerCase()] = (clickedCities[prof.city.toLowerCase()] || 0) + 1;
      }
    }

    return {
      clickCount: history.length,
      clickedReligions,
      clickedCastes,
      clickedOccupations,
      clickedCities,
    };
  }
}

// 5. Recommendation Ranker
export class DefaultRecommendationRanker implements IRecommendationRanker {
  async rank(scored: { candidate: UserProfile; score: CompatibilityScore }[]) {
    return scored.sort((a, b) => b.score.totalScore - a.score.totalScore);
  }
}

// 6. Explanation Provider
export class DefaultExplanationProvider implements IExplanationProvider {
  constructor(private explainer: MatchExplanationProvider) {}

  async explain(context: RecommendationContext, score: number): Promise<string[]> {
    return this.explainer.explain(context, score);
  }
}

// Orchestrator Pipeline
export class RecommendationPipeline {
  constructor(
    private collector: ICandidateCollector,
    private filter: ICandidateFilter,
    private scorer: ICompatibilityScorer,
    private behaviorService: IBehaviorBoostService,
    private ranker: IRecommendationRanker,
    private explanationProvider: IExplanationProvider
  ) {}

  async generate(viewer: UserProfile, viewerPreferences: PartnerPreference | null, limit: number = 10): Promise<{
    recommendations: { candidate: UserProfile; score: CompatibilityScore }[];
    telemetry: Record<string, number>;
  }> {
    const telemetry: Record<string, number> = {};

    // Collector timing
    const t0 = Date.now();
    const collected = await this.collector.collect(viewer);
    telemetry["CandidateCollector"] = Date.now() - t0;

    // Filter timing
    const t1 = Date.now();
    const filtered = await this.filter.filter(viewer, collected);
    telemetry["CandidateFilter"] = Date.now() - t1;

    // Behavior timing
    const t2 = Date.now();
    const clickHistory = await this.behaviorService.getBehaviorContext(viewer.userId);
    telemetry["BehaviorBoostService"] = Date.now() - t2;

    // Scoring & Explanation timing
    const t3 = Date.now();
    const scored: { candidate: UserProfile; score: CompatibilityScore }[] = [];
    
    for (const cand of filtered) {
      const context: RecommendationContext = {
        viewer,
        viewerPreferences,
        candidate: cand,
        clickHistory,
        featureFlags: {},
      };

      const scoreObj = await this.scorer.score(context);
      const explanations = await this.explanationProvider.explain(context, scoreObj.totalScore);
      scoreObj.strengths = explanations;
      scoreObj.explanation = explanations.join(" ");

      scored.push({
        candidate: cand,
        score: scoreObj,
      });
    }
    telemetry["CompatibilityScorer"] = Date.now() - t3;

    // Ranking timing
    const t4 = Date.now();
    const ranked = await this.ranker.rank(scored);
    const sliced = ranked.slice(0, limit);
    telemetry["RecommendationRanker"] = Date.now() - t4;

    loggerService.info("Recommendation Pipeline Execution Stats", { telemetry });

    return { recommendations: sliced, telemetry };
  }
}
