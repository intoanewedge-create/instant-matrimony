import { ProfileSpecification } from "./profile.specification";

export class SearchSpecification {
  static buildWhereClause(params: {
    viewerId: string;
    blockedUserIds?: string[];
    profilePublicId?: string;
    gender?: string;
    minAge?: number;
    maxAge?: number;
    minHeight?: number;
    maxHeight?: number;
    minWeight?: number;
    maxWeight?: number;
    maritalStatus?: string;
    religion?: string;
    caste?: string;
    subCaste?: string;
    gothram?: string;
    motherTongue?: string;
    education?: string;
    occupation?: string;
    minIncome?: number;
    maxIncome?: number;
    country?: string;
    state?: string;
    district?: string;
    city?: string;
    smoking?: string;
    drinking?: string;
    food?: string;
    isVerified?: boolean;
    hasPhoto?: boolean;
    recentlyJoined?: boolean;
    recentlyActive?: boolean;
    minCompletion?: number;
  }) {
    const andClauses: any[] = [
      ProfileSpecification.approvedOnly(),
      { userId: { not: params.viewerId } },
    ];

    if (params.blockedUserIds && params.blockedUserIds.length > 0) {
      andClauses.push({ userId: { notIn: params.blockedUserIds } });
    }

    // Filter by public Profile ID (IM########)
    if (params.profilePublicId && params.profilePublicId.trim().length > 0) {
      andClauses.push({
        user: { publicId: { equals: params.profilePublicId.trim().toUpperCase(), mode: "insensitive" } },
      });
    }

    if (params.gender) {
      andClauses.push(ProfileSpecification.filterByGender(params.gender));
    }

    const ageFilter = ProfileSpecification.filterByAgeRange(params.minAge, params.maxAge);
    if (ageFilter.dateOfBirth) {
      andClauses.push(ageFilter);
    }

    const heightFilter = ProfileSpecification.filterByHeightRange(params.minHeight, params.maxHeight);
    if (heightFilter.height) {
      andClauses.push(heightFilter);
    }

    const weightFilter = ProfileSpecification.filterByWeightRange(params.minWeight, params.maxWeight);
    if (weightFilter.weight) {
      andClauses.push(weightFilter);
    }

    if (params.maritalStatus) {
      andClauses.push({ maritalStatus: { equals: params.maritalStatus, mode: "insensitive" } });
    }

    const religionFilter = ProfileSpecification.filterByReligionCaste(params.religion, params.caste);
    if (Object.keys(religionFilter).length > 0) {
      andClauses.push(religionFilter);
    }

    const subCasteGothramFilter = ProfileSpecification.filterBySubCasteGothram(params.subCaste, params.gothram);
    if (Object.keys(subCasteGothramFilter).length > 0) {
      andClauses.push(subCasteGothramFilter);
    }

    const mtFilter = ProfileSpecification.filterByMotherTongue(params.motherTongue);
    if (Object.keys(mtFilter).length > 0) {
      andClauses.push(mtFilter);
    }

    const eduFilter = ProfileSpecification.filterByEducation(params.education);
    if (Object.keys(eduFilter).length > 0) {
      andClauses.push(eduFilter);
    }

    const occFilter = ProfileSpecification.filterByOccupation(params.occupation);
    if (Object.keys(occFilter).length > 0) {
      andClauses.push(occFilter);
    }

    const incomeFilter = ProfileSpecification.filterByIncomeRange(params.minIncome, params.maxIncome);
    if (incomeFilter.income) {
      andClauses.push(incomeFilter);
    }

    const locationFilter = ProfileSpecification.filterByLocation(params.city, params.state, params.country);
    if (params.district) {
      locationFilter.district = { equals: params.district, mode: "insensitive" };
    }
    if (Object.keys(locationFilter).length > 0) {
      andClauses.push(locationFilter);
    }

    const lifestyleFilter = ProfileSpecification.filterByLifestyle(params.smoking, params.drinking, params.food);
    if (Object.keys(lifestyleFilter).length > 0) {
      andClauses.push(lifestyleFilter);
    }

    const verifFilter = ProfileSpecification.filterByVerification(params.isVerified);
    if (Object.keys(verifFilter).length > 0) {
      andClauses.push(verifFilter);
    }

    const photoFilter = ProfileSpecification.filterByHasPhoto(params.hasPhoto);
    if (Object.keys(photoFilter).length > 0) {
      andClauses.push(photoFilter);
    }

    const recentJoinedFilter = ProfileSpecification.filterByRecentlyJoined(params.recentlyJoined);
    if (Object.keys(recentJoinedFilter).length > 0) {
      andClauses.push(recentJoinedFilter);
    }

    const recentActiveFilter = ProfileSpecification.filterByRecentlyActive(params.recentlyActive);
    if (Object.keys(recentActiveFilter).length > 0) {
      andClauses.push(recentActiveFilter);
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
