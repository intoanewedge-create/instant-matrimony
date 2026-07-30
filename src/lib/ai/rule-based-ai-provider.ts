import { AiProvider } from "./ai-provider";
import { UserProfile, RecommendationContext } from "../domain/contracts";
import { BioTemplateBuilder, IcebreakerTemplateBuilder, CompatibilityTemplateBuilder } from "./templates/template-builders";

export class RuleBasedAiProvider implements AiProvider {
  providerName(): string {
    return "RuleBasedAiProvider";
  }

  providerVersion(): string {
    return "1.0.0";
  }

  supportsStreaming(): boolean {
    return false;
  }

  supportsVision(): boolean {
    return false;
  }

  supportsEmbeddings(): boolean {
    return false;
  }

  supportsChat(): boolean {
    return true;
  }

  supportsFunctionCalling(): boolean {
    return false;
  }

  async health(): Promise<boolean> {
    return true;
  }

  async getProfileSuggestions(profile: UserProfile): Promise<{
    suggestions: string[];
    missingFields: string[];
    improvements: string[];
  }> {
    const suggestions: string[] = [];
    const missingFields: string[] = [];
    const improvements: string[] = [];

    if (!profile.religion) {
      missingFields.push("religion");
      suggestions.push("Add your religion to help find matches with matching family traditions.");
    }
    if (!profile.caste) {
      missingFields.push("caste");
      suggestions.push("Specify your caste to refine community matching filters.");
    }
    if (!profile.city) {
      missingFields.push("city");
      suggestions.push("Specify your current city to enable location-based proximity matching.");
    }
    if (!profile.occupation) {
      missingFields.push("occupation");
      suggestions.push("Describe your occupation to give matches insight into your career path.");
    }
    if (!profile.income) {
      missingFields.push("income");
      suggestions.push("Add annual income to appeal to partner preferences matching your lifestyle.");
    }

    if (profile.completionPercent < 50) {
      improvements.push("Profile strength is low. Complete missing details to boost visibility by 150%.");
    } else if (profile.completionPercent < 85) {
      improvements.push("Add at least 3 photos to increase matches responses by up to 3x.");
    } else {
      improvements.push("Your profile is looking great! Verify your identity to display the verification badge.");
    }

    return { suggestions, missingFields, improvements };
  }

  async improveBiography(bio: string, occupation?: string): Promise<string> {
    if (!bio || bio.trim().length === 0) {
      return `A professional individuals ${occupation ? `working as a ${occupation}` : ""}. I value family values, honesty, and mutual respect, looking to connect with a compatible partner.`;
    }
    const cleanBio = bio.trim();
    const prefix = `A warm, goal-oriented individual${occupation ? ` working as a ${occupation}` : ""}.`;
    return `${prefix} ${cleanBio} Looking to connect with someone who shares similar life perspectives and mutual values.`;
  }

  async generateIcebreakers(sender: UserProfile, receiver: UserProfile): Promise<string[]> {
    const cityPart = receiver.city ? ` in ${receiver.city}` : "";
    const occupationPart = receiver.occupation ? ` as a ${receiver.occupation}` : "";
    
    return [
      `Hello ${receiver.name}, I came across your profile and noticed you are based${cityPart}. I'd love to connect and learn more about your interests.`,
      `Hi ${receiver.name}, hope you are doing well! I'm impressed by your career progress${occupationPart}. Let's chat if you're interested.`,
      `Namaste ${receiver.name}, I see that we share similar family value preferences. I would be glad to initiate a conversation if you're open to it.`
    ];
  }

  async analyzeProfile(profile: UserProfile): Promise<{
    tone: string;
    strengthScore: number;
    hasRedFlags: boolean;
    redFlags: string[];
    suggestedInterests: string[];
  }> {
    const redFlags: string[] = [];
    
    // Check for email or phone patterns in bio
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /(\+?\d{1,4}[-.\s]??)?(\(?\d{3}\)?[-.\s]??)?\d{3}[-.\s]??\d{4}/g;
    
    // Mock check
    const bioText = profile.name + " " + (profile.occupation || "");
    if (emailRegex.test(bioText)) {
      redFlags.push("Contains email address. Contact information should not be shared in profile details.");
    }
    if (phoneRegex.test(bioText)) {
      redFlags.push("Contains phone number patterns. Avoid sharing direct numbers in bio details.");
    }

    let tone = "Friendly & Professional";
    if (profile.occupation?.toLowerCase().includes("engineer") || profile.occupation?.toLowerCase().includes("doctor")) {
      tone = "Analytical & Highly Educated";
    }

    const suggestedInterests = ["Reading", "Traveling", "Music", "Fitness", "Cooking"];
    if (profile.gender === "MALE") {
      suggestedInterests.push("Cricket");
    }

    return {
      tone,
      strengthScore: profile.completionPercent,
      hasRedFlags: redFlags.length > 0,
      redFlags,
      suggestedInterests,
    };
  }

  async explainCompatibility(context: RecommendationContext): Promise<string> {
    const { viewer, candidate } = context;
    const strengths: string[] = [];

    if (viewer.religion && candidate.religion && viewer.religion.toLowerCase() === candidate.religion.toLowerCase()) {
      strengths.push("shared religious values");
    }
    if (viewer.city && candidate.city && viewer.city.toLowerCase() === candidate.city.toLowerCase()) {
      strengths.push("same city proximity");
    }
    if (viewer.occupation && candidate.occupation) {
      strengths.push("aligned professional backgrounds");
    }

    if (strengths.length === 0) {
      return `Compatibility is built on mutual partner preferences, verified badge details, and profile completeness.`;
    }

    return `Strong compatibility highlights include: ${strengths.join(", ")}.`;
  }
}
