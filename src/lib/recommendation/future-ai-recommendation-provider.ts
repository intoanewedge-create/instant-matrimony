import { RecommendationProvider } from "./recommendation-provider";
import { RuleBasedRecommendationProvider } from "./rule-based-recommendation-provider";
import { Result } from "../result";

export class FutureAiRecommendationProvider implements RecommendationProvider {
  constructor(private fallback: RuleBasedRecommendationProvider) {}

  name(): string {
    return "FutureAiRecommendationProvider";
  }

  async getRecommendations(userId: string, limit: number): Promise<Result<any[]>> {
    // Framework stub falling back to rule-based matchmaking
    return this.fallback.getRecommendations(userId, limit);
  }
}
