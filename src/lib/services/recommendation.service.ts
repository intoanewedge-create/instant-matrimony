import { BaseService } from "./base.service";
import { Result } from "../result";
import { RecommendationProvider } from "../recommendation/recommendation-provider";
import { IRecommendationRepository } from "../repositories/interfaces/recommendation.repository";

export class RecommendationService extends BaseService {
  constructor(
    private provider: RecommendationProvider,
    private repository: IRecommendationRepository
  ) {
    super();
  }

  async getRecommendations(userId: string, limit: number = 10): Promise<Result<any[]>> {
    try {
      const res = await this.provider.getRecommendations(userId, limit);
      if (!res.success) {
        return this.returnFailure(res.error || "Failed to fetch recommendations", res.code);
      }

      const recommendations = res.data || [];
      for (const rec of recommendations) {
        await this.repository.createHistory(userId, rec.profile.userId, rec.score);
      }

      return this.returnSuccess(recommendations);
    } catch (e: any) {
      return this.returnFailure(e.message, "RECOMMENDATIONS_SERVICE_ERROR");
    }
  }

  async clickRecommendation(userId: string, targetId: string): Promise<Result<any>> {
    try {
      const history = await this.repository.clickRecommendation(userId, targetId);
      return this.returnSuccess(history);
    } catch (e: any) {
      return this.returnFailure(e.message, "RECOMMENDATIONS_CLICK_ERROR");
    }
  }

  async getHistory(userId: string, limit: number = 10): Promise<Result<any[]>> {
    try {
      const history = await this.repository.getRecommendationHistory(userId, limit);
      return this.returnSuccess(history);
    } catch (e: any) {
      return this.returnFailure(e.message, "RECOMMENDATIONS_HISTORY_ERROR");
    }
  }
}
