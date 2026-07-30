import { RecommendationProvider } from "./recommendation-provider";
import { Result } from "../result";
import { DefaultRecommendationProvider } from "./default-recommendation-provider";

export class AiRecommendationProvider implements RecommendationProvider {
  private defaultProvider = new DefaultRecommendationProvider();

  name(): string {
    return "AiRecommendationProvider";
  }

  async getRecommendations(userId: string, limit: number): Promise<Result<any[]>> {
    return this.defaultProvider.getRecommendations(userId, limit);
  }
}
