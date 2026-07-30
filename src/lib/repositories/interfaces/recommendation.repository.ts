export interface IRecommendationRepository {
  createHistory(userId: string, targetId: string, score: number): Promise<any>;
  clickRecommendation(userId: string, targetId: string): Promise<any>;
  getRecommendationHistory(userId: string, limit: number): Promise<any[]>;
}
