import { ProfileSpecification } from "./profile.specification";

export class SearchSpecification {
  static buildWhereClause(params: {
    viewerId: string;
    blockedUserIds: string[];
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
    smoking?: string;
    drinking?: string;
    food?: string;
    isVerified?: boolean;
    isPremium?: boolean;
    minCompletion?: number;
  }) {
    const andClauses: any[] = [
      ProfileSpecification.approvedOnly(),
      { userId: { not: params.viewerId } },
    ];

    if (params.blockedUserIds && params.blockedUserIds.length > 0) {
      andClauses.push({ userId: { notIn: params.blockedUserIds } });
    }

    if (params.gender) {
      andClauses.push(ProfileSpecification.filterByGender(params.gender));
    }

    const ageFilter = ProfileSpecification.filterByAgeRange(params.minAge, params.maxAge);
    if (ageFilter.dateOfBirth) {
      andClauses.push(ageFilter);
    }

    const locationFilter = ProfileSpecification.filterByLocation(params.city, params.state, params.country);
    if (Object.keys(locationFilter).length > 0) {
      andClauses.push(locationFilter);
    }

    const religionFilter = ProfileSpecification.filterByReligionCaste(params.religion, params.caste);
    if (Object.keys(religionFilter).length > 0) {
      andClauses.push(religionFilter);
    }

    const incomeFilter = ProfileSpecification.filterByIncome(params.minIncome);
    if (incomeFilter.income) {
      andClauses.push(incomeFilter);
    }

    const mtFilter = ProfileSpecification.filterByMotherTongue(params.motherTongue);
    if (Object.keys(mtFilter).length > 0) {
      andClauses.push(mtFilter);
    }

    const heightFilter = ProfileSpecification.filterByHeightRange(params.minHeight, params.maxHeight);
    if (heightFilter.height) {
      andClauses.push(heightFilter);
    }

    const eduFilter = ProfileSpecification.filterByEducation(params.education);
    if (Object.keys(eduFilter).length > 0) {
      andClauses.push(eduFilter);
    }

    const occFilter = ProfileSpecification.filterByOccupation(params.occupation);
    if (Object.keys(occFilter).length > 0) {
      andClauses.push(occFilter);
    }

    const lifestyleFilter = ProfileSpecification.filterByLifestyle(params.smoking, params.drinking, params.food);
    if (Object.keys(lifestyleFilter).length > 0) {
      andClauses.push(lifestyleFilter);
    }

    const verifFilter = ProfileSpecification.filterByVerification(params.isVerified);
    if (Object.keys(verifFilter).length > 0) {
      andClauses.push(verifFilter);
    }

    const premFilter = ProfileSpecification.filterByPremium(params.isPremium);
    if (Object.keys(premFilter).length > 0) {
      andClauses.push(premFilter);
    }

    const compFilter = ProfileSpecification.filterByCompletion(params.minCompletion || 20);
    if (compFilter.completionPercent) {
      andClauses.push(compFilter);
    }

    andClauses.push({
      user: {
        isActive: true,
        deletedAt: null,
      },
    });

    return { AND: andClauses };
  }
}
