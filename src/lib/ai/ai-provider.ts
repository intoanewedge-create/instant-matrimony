import { UserProfile, RecommendationContext } from "../domain/contracts";

export interface AiProvider {
  providerName(): string;
  providerVersion(): string;
  supportsStreaming(): boolean;
  supportsVision(): boolean;
  supportsEmbeddings(): boolean;
  supportsChat(): boolean;
  supportsFunctionCalling(): boolean;
  health(): Promise<boolean>;

  getProfileSuggestions(profile: UserProfile): Promise<{
    suggestions: string[];
    missingFields: string[];
    improvements: string[];
  }>;
  improveBiography(bio: string, occupation?: string): Promise<string>;
  generateIcebreakers(sender: UserProfile, receiver: UserProfile): Promise<string[]>;
  analyzeProfile(profile: UserProfile): Promise<{
    tone: string;
    strengthScore: number;
    hasRedFlags: boolean;
    redFlags: string[];
    suggestedInterests: string[];
  }>;
  explainCompatibility(context: RecommendationContext): Promise<string>;
}
