import { UserProfile, CompatibilityScore } from "../domain/contracts";

export interface RecommendationDto {
  profileId: string;
  name: string;
  gender: string;
  age: number | null;
  religion: string | null;
  city: string | null;
  occupation: string | null;
  score: number;
  grade: string;
  explanation: string;
}

export interface SearchResultDto {
  profileId: string;
  name: string;
  gender: string;
  age: number | null;
  religion: string | null;
  city: string | null;
  occupation: string | null;
  isPremium: boolean;
  isVerified: boolean;
  score?: number;
  explanation?: string;
}

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  read: boolean;
  createdAt: Date;
}

export interface ProfileSuggestionDto {
  suggestions: string[];
  missingFields: string[];
  improvements: string[];
}

export class DtoSerializers {
  static toRecommendation(candidate: UserProfile, score: CompatibilityScore): RecommendationDto {
    const today = new Date();
    let age: number | null = null;
    if (candidate.dateOfBirth) {
      age = today.getFullYear() - new Date(candidate.dateOfBirth).getFullYear();
    }
    return {
      profileId: candidate.id,
      name: candidate.name,
      gender: candidate.gender,
      age,
      religion: candidate.religion,
      city: candidate.city,
      occupation: candidate.occupation,
      score: score.totalScore,
      grade: score.grade,
      explanation: score.explanation,
    };
  }

  static toSearchResult(candidate: any, rankingScore?: number): SearchResultDto {
    const today = new Date();
    let age: number | null = null;
    if (candidate.dateOfBirth) {
      age = today.getFullYear() - new Date(candidate.dateOfBirth).getFullYear();
    }
    return {
      profileId: candidate.id,
      name: candidate.user?.name || candidate.name || "User",
      gender: candidate.gender,
      age,
      religion: candidate.religion,
      city: candidate.city,
      occupation: candidate.occupation,
      isPremium: candidate.isPremium || false,
      isVerified: candidate.isVerified || false,
      score: rankingScore,
      explanation: candidate.compatibility?.matchedFields?.join(", ") || "",
    };
  }

  static toNotification(n: any): NotificationDto {
    return {
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      category: n.category || "SYSTEM",
      read: n.read,
      createdAt: n.createdAt,
    };
  }
}
