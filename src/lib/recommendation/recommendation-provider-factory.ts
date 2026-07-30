import { RecommendationProvider } from "./recommendation-provider";
import { RuleBasedRecommendationProvider } from "./rule-based-recommendation-provider";
import { FutureAiRecommendationProvider } from "./future-ai-recommendation-provider";
import { RecommendationPipeline, DbCandidateCollector, DbCandidateFilter, StrategyCompatibilityScorer, DbBehaviorBoostService, DefaultRecommendationRanker, DefaultExplanationProvider } from "./pipeline/recommendation-pipeline";
import { RuleBasedMatchExplanationProvider } from "./rule-based-match-explanation-provider";

export class RecommendationProviderRegistry {
  private providers = new Map<string, RecommendationProvider>();
  private activeName = "rulebased";

  constructor() {
    // Instantiate pipeline components
    const collector = new DbCandidateCollector();
    const filter = new DbCandidateFilter();
    const scorer = new StrategyCompatibilityScorer();
    const behavior = new DbBehaviorBoostService();
    const ranker = new DefaultRecommendationRanker();
    const explanationProvider = new DefaultExplanationProvider(new RuleBasedMatchExplanationProvider());

    const pipeline = new RecommendationPipeline(collector, filter, scorer, behavior, ranker, explanationProvider);

    const ruleBased = new RuleBasedRecommendationProvider(pipeline);
    const aiProvider = new FutureAiRecommendationProvider(ruleBased);

    this.providers.set("rulebased", ruleBased);
    this.providers.set("ai", aiProvider);

    this.activeName = process.env.RECOMMENDATION_PROVIDER || "rulebased";
  }

  getActiveProvider(): RecommendationProvider {
    const preferred = this.providers.get(this.activeName.toLowerCase());
    return preferred || this.providers.get("rulebased")!;
  }
}

export const recommendationProviderRegistry = new RecommendationProviderRegistry();
