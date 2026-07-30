import { MatchExplanationProvider } from "./match-explanation-provider";
import { RecommendationContext } from "../domain/contracts";
import { RuleBasedMatchExplanationProvider } from "./rule-based-match-explanation-provider";

export class AiMatchExplanationProvider implements MatchExplanationProvider {
  private fallback = new RuleBasedMatchExplanationProvider();

  name(): string {
    return "AiMatchExplanationProvider";
  }

  async explain(context: RecommendationContext, totalScore: number): Promise<string[]> {
    // Framework-ready stub calling fallback
    return this.fallback.explain(context, totalScore);
  }
}
