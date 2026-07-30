import { Result } from "../result";

export interface RecommendationProvider {
  name(): string;
  getRecommendations(userId: string, limit: number): Promise<Result<any[]>>;
}
