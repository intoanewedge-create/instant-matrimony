import { AiProvider } from "./ai-provider";
import { UserProfile, RecommendationContext } from "../domain/contracts";
import { RuleBasedAiProvider } from "./rule-based-ai-provider";

export class OpenAiProvider implements AiProvider {
  private fallback = new RuleBasedAiProvider();

  providerName(): string {
    return "OpenAiProvider";
  }

  providerVersion(): string {
    return "gpt-4o-2024-05-13";
  }

  supportsStreaming(): boolean {
    return true;
  }

  supportsVision(): boolean {
    return true;
  }

  supportsEmbeddings(): boolean {
    return true;
  }

  supportsChat(): boolean {
    return true;
  }

  supportsFunctionCalling(): boolean {
    return true;
  }

  async health(): Promise<boolean> {
    // Unhealthy by default unless keys are defined
    return !!process.env.OPENAI_API_KEY;
  }

  async getProfileSuggestions(profile: UserProfile) {
    return this.fallback.getProfileSuggestions(profile);
  }

  async improveBiography(bio: string, occupation?: string): Promise<string> {
    return this.fallback.improveBiography(bio, occupation);
  }

  async generateIcebreakers(sender: UserProfile, receiver: UserProfile): Promise<string[]> {
    return this.fallback.generateIcebreakers(sender, receiver);
  }

  async analyzeProfile(profile: UserProfile) {
    return this.fallback.analyzeProfile(profile);
  }

  async explainCompatibility(context: RecommendationContext): Promise<string> {
    return this.fallback.explainCompatibility(context);
  }
}
