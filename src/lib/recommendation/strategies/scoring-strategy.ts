import { RecommendationContext } from "../../domain/contracts";
import { recommendationConfig } from "../../../config/recommendation.config";

export interface ScoringStrategy {
  name: string;
  calculateScore(context: RecommendationContext): number;
}

export class AgeStrategy implements ScoringStrategy {
  name = "age";
  calculateScore(context: RecommendationContext): number {
    const { viewerPreferences, candidate } = context;
    const maxWeight = recommendationConfig.weights.age;
    
    if (viewerPreferences?.minAge || viewerPreferences?.maxAge) {
      if (!candidate.dateOfBirth) return 0;
      
      const today = new Date();
      let age = today.getFullYear() - candidate.dateOfBirth.getFullYear();
      const m = today.getMonth() - candidate.dateOfBirth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < candidate.dateOfBirth.getDate())) {
        age--;
      }

      const minOk = !viewerPreferences.minAge || age >= viewerPreferences.minAge;
      const maxOk = !viewerPreferences.maxAge || age <= viewerPreferences.maxAge;
      return minOk && maxOk ? maxWeight : 0;
    }
    return maxWeight; // Default weight if no pref set
  }
}

export class ReligionStrategy implements ScoringStrategy {
  name = "religion";
  calculateScore(context: RecommendationContext): number {
    const { viewerPreferences, candidate } = context;
    const maxWeight = recommendationConfig.weights.religion;

    if (viewerPreferences?.religion && candidate.religion) {
      return viewerPreferences.religion.toLowerCase() === candidate.religion.toLowerCase() ? maxWeight : 0;
    }
    return maxWeight;
  }
}

export class EducationStrategy implements ScoringStrategy {
  name = "education";
  calculateScore(context: RecommendationContext): number {
    const { viewerPreferences, candidate } = context;
    const maxWeight = recommendationConfig.weights.education;

    if (viewerPreferences?.education && candidate.education) {
      return candidate.education.toLowerCase().includes(viewerPreferences.education.toLowerCase()) ? maxWeight : 0;
    }
    return maxWeight;
  }
}

export class OccupationStrategy implements ScoringStrategy {
  name = "occupation";
  calculateScore(context: RecommendationContext): number {
    const { viewerPreferences, candidate } = context;
    const maxWeight = recommendationConfig.weights.occupation;

    if (viewerPreferences?.occupation && candidate.occupation) {
      return candidate.occupation.toLowerCase().includes(viewerPreferences.occupation.toLowerCase()) ? maxWeight : 0;
    }
    return maxWeight;
  }
}

export class LifestyleStrategy implements ScoringStrategy {
  name = "lifestyle";
  calculateScore(context: RecommendationContext): number {
    // Basic lifestyle similarity score: foods, smoking, drinking habits
    const { viewer, candidate } = context;
    const maxWeight = recommendationConfig.weights.lifestyle;
    let matching = 0;
    
    // Simulating match details
    if (viewer.maritalStatus && candidate.maritalStatus && viewer.maritalStatus === candidate.maritalStatus) {
      matching += 0.5;
    }
    if (viewer.religion && candidate.religion && viewer.religion === candidate.religion) {
      matching += 0.5;
    }

    return matching * maxWeight;
  }
}

export class LocationStrategy implements ScoringStrategy {
  name = "location";
  calculateScore(context: RecommendationContext): number {
    const { viewer, candidate } = context;
    const maxWeight = recommendationConfig.weights.location;
    let score = 0;

    if (viewer.country && candidate.country && viewer.country.toLowerCase() === candidate.country.toLowerCase()) {
      score += maxWeight * 0.4;
      if (viewer.state && candidate.state && viewer.state.toLowerCase() === candidate.state.toLowerCase()) {
        score += maxWeight * 0.3;
        if (viewer.city && candidate.city && viewer.city.toLowerCase() === candidate.city.toLowerCase()) {
          score += maxWeight * 0.3;
        }
      }
    }

    return score;
  }
}

export class PartnerPreferenceStrategy implements ScoringStrategy {
  name = "partnerPreference";
  calculateScore(context: RecommendationContext): number {
    const { viewerPreferences, candidate } = context;
    const maxWeight = recommendationConfig.weights.caste; // uses caste weights for simplicity
    
    if (viewerPreferences?.caste && candidate.caste) {
      return viewerPreferences.caste.toLowerCase() === candidate.caste.toLowerCase() ? maxWeight : 0;
    }
    return maxWeight;
  }
}

export class BehaviorHistoryStrategy implements ScoringStrategy {
  name = "behaviorHistory";
  calculateScore(context: RecommendationContext): number {
    const { candidate, clickHistory } = context;
    let boost = 0;

    // Check if user clicked candidate's religion
    if (candidate.religion && clickHistory.clickedReligions[candidate.religion.toLowerCase()]) {
      boost += 2;
    }
    // Check if user clicked candidate's city
    if (candidate.city && clickHistory.clickedCities[candidate.city.toLowerCase()]) {
      boost += 2;
    }
    // Check if user clicked candidate's occupation
    if (candidate.occupation && clickHistory.clickedOccupations[candidate.occupation.toLowerCase()]) {
      boost += 2;
    }

    return Math.min(boost, 6); // Max 6 points behavior boost
  }
}

export class PremiumBoostStrategy implements ScoringStrategy {
  name = "premiumBoost";
  calculateScore(context: RecommendationContext): number {
    const maxWeight = recommendationConfig.weights.premiumMembership;
    return context.candidate.isPremium ? maxWeight : 0;
  }
}

export class VerificationBoostStrategy implements ScoringStrategy {
  name = "verificationBoost";
  calculateScore(context: RecommendationContext): number {
    const maxWeight = recommendationConfig.weights.identityVerification;
    return context.candidate.isVerified ? maxWeight : 0;
  }
}
