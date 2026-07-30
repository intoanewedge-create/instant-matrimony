export interface MatchWeights {
  age: number;
  religion: number;
  caste: number;
  motherTongue: number;
  maritalStatus: number;
  height: number;
  education: number;
  occupation: number;
  income: number;
  location: number; // Country + State + City
  lifestyle: number; // Smoking + Drinking + Food
  familyValues: number;
  horoscope: number;
  profileCompletion: number;
  identityVerification: number;
  premiumMembership: number;
  recentlyActive: number;
  mutualInterests: number;
  activityScore: number;
}

export const recommendationConfig = {
  weights: {
    age: 15,
    religion: 10,
    caste: 10,
    motherTongue: 8,
    maritalStatus: 5,
    height: 7,
    education: 8,
    occupation: 7,
    income: 8,
    location: 10, // Matching country/state/city
    lifestyle: 5, // Food, smoking, drinking
    familyValues: 3,
    horoscope: 2,
    profileCompletion: 5,
    identityVerification: 7,
    premiumMembership: 5,
    recentlyActive: 5,
    mutualInterests: 5,
    activityScore: 2,
  } as MatchWeights,
  grades: {
    APlus: { min: 90, label: "A+" },
    A: { min: 80, label: "A" },
    BPlus: { min: 70, label: "B+" },
    B: { min: 60, label: "B" },
    C: { min: 0, label: "C" },
  },
};
