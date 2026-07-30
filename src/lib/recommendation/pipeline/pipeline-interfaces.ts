import { UserProfile, RecommendationContext, CompatibilityScore } from "../../domain/contracts";

export interface ICandidateCollector {
  collect(viewer: UserProfile): Promise<UserProfile[]>;
}

export interface ICandidateFilter {
  filter(viewer: UserProfile, candidates: UserProfile[]): Promise<UserProfile[]>;
}

export interface ICompatibilityScorer {
  score(context: RecommendationContext): Promise<CompatibilityScore>;
}

export interface IBehaviorBoostService {
  getBehaviorContext(viewerId: string): Promise<any>;
}

export interface IRecommendationRanker {
  rank(scored: { candidate: UserProfile; score: CompatibilityScore }[]): Promise<{ candidate: UserProfile; score: CompatibilityScore }[]>;
}

export interface IExplanationProvider {
  explain(context: RecommendationContext, score: number): Promise<string[]>;
}
