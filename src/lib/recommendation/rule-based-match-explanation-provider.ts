import { MatchExplanationProvider } from "./match-explanation-provider";
import { RecommendationContext } from "../domain/contracts";

export class RuleBasedMatchExplanationProvider implements MatchExplanationProvider {
  name(): string {
    return "RuleBasedMatchExplanationProvider";
  }

  async explain(context: RecommendationContext, totalScore: number): Promise<string[]> {
    const { viewer, candidate } = context;
    const explanations: string[] = [];

    if (viewer.religion && candidate.religion && viewer.religion.toLowerCase() === candidate.religion.toLowerCase()) {
      explanations.push(`You both share the ${viewer.religion} religion.`);
    }

    if (viewer.city && candidate.city && viewer.city.toLowerCase() === candidate.city.toLowerCase()) {
      explanations.push(`You both live in ${viewer.city}.`);
    } else if (viewer.state && candidate.state && viewer.state.toLowerCase() === candidate.state.toLowerCase()) {
      explanations.push(`You are both located in the state of ${viewer.state}.`);
    }

    if (viewer.occupation && candidate.occupation) {
      const vOcc = viewer.occupation.toLowerCase();
      const cOcc = candidate.occupation.toLowerCase();
      
      const itKeywords = ["developer", "engineer", "software", "tech", "programmer", "it"];
      const vIsIt = itKeywords.some(k => vOcc.includes(k));
      const cIsIt = itKeywords.some(k => cOcc.includes(k));
      
      if (vIsIt && cIsIt) {
        explanations.push("You both work in Technology/Engineering.");
      } else if (vOcc === cOcc) {
        explanations.push(`You both work as a ${viewer.occupation}.`);
      }
    }

    if (totalScore >= 80) {
      explanations.push(`${totalScore}% compatibility based on preferences and activity.`);
    }

    if (explanations.length === 0) {
      explanations.push("Compatible profile matching your general preferences.");
    }

    return explanations;
  }
}
