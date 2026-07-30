import { RecommendationContext } from "../domain/contracts";

export interface MatchExplanationProvider {
  name(): string;
  explain(context: RecommendationContext, totalScore: number): Promise<string[]>;
}
