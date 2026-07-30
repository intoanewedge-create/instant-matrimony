export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  gender: string;
  religion: string | null;
  caste: string | null;
  motherTongue: string | null;
  maritalStatus: string | null;
  dateOfBirth: Date | null;
  height: number | null;
  country: string | null;
  state: string | null;
  city: string | null;
  education: string | null;
  occupation: string | null;
  income: number | null;
  completionPercent: number;
  isVerified: boolean;
  isPremium: boolean;
  lastLoginAt: Date | null;
}

export interface PartnerPreference {
  id?: string;
  userId: string;
  minAge: number | null;
  maxAge: number | null;
  religion: string | null;
  caste: string | null;
  motherTongue: string | null;
  maritalStatus: string | null;
  minHeight: number | null;
  maxHeight: number | null;
  education: string | null;
  occupation: string | null;
}

export interface RecommendationContext {
  viewer: UserProfile;
  viewerPreferences: PartnerPreference | null;
  candidate: UserProfile;
  clickHistory: {
    clickCount: number;
    clickedReligions: Record<string, number>;
    clickedCastes: Record<string, number>;
    clickedOccupations: Record<string, number>;
    clickedCities: Record<string, number>;
  };
  featureFlags: Record<string, boolean>;
}

export interface CompatibilityScore {
  totalScore: number;
  grade: string;
  scoreBreakdown: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  confidence: number;
  explanation: string;
}

export interface SearchContext {
  viewerId: string;
  queryText?: string;
  filters: {
    gender?: string;
    minAge?: number;
    maxAge?: number;
    religion?: string;
    caste?: string;
    city?: string;
    state?: string;
    country?: string;
    minIncome?: number;
    motherTongue?: string;
    minHeight?: number;
    maxHeight?: number;
    education?: string;
    occupation?: string;
    smoking?: boolean;
    drinking?: boolean;
    food?: string;
    isVerified?: boolean;
    isPremium?: boolean;
    minCompletion?: number;
  };
  cursor?: string;
  limit: number;
  sortBy?: string;
}

export interface NotificationContext {
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  category: "SYSTEM" | "MATCH" | "MESSAGE" | "PAYMENT" | "SECURITY" | "PROFILE" | "ADMIN";
}

export interface DashboardAggregate {
  profile: any;
  membership: any;
  receivedInterests: any[];
  sentInterests: any[];
  suggestions: any[];
  conversations: any[];
  notifications: any[];
  savedSearches: any[];
  analytics: {
    viewsCount: number;
    interestAcceptRate: number;
    profileCompletion: number;
    unresolvedModerationCount: number;
  };
  aiInsights: {
    completionSuggestions: string[];
    bioImprovementSuggestion: string;
    profileStrengthScore: number;
  };
}
