export class ProfileSpecification {
  static approvedOnly() {
    return {
      status: "APPROVED" as any,
      deletedAt: null,
      user: {
        isActive: true,
        deletedAt: null,
      },
    };
  }

  static filterByGender(gender?: string) {
    if (!gender) return {};
    return { gender };
  }

  static filterByAgeRange(minAge?: number, maxAge?: number) {
    if (!minAge && !maxAge) return {};
    const now = new Date();
    const where: any = {};
    if (minAge) {
      const maxDob = new Date();
      maxDob.setFullYear(now.getFullYear() - minAge);
      where.lte = maxDob;
    }
    if (maxAge) {
      const minDob = new Date();
      minDob.setFullYear(now.getFullYear() - (maxAge + 1));
      where.gte = minDob;
    }
    return { dateOfBirth: where };
  }

  static filterByLocation(city?: string, state?: string, country?: string) {
    const where: any = {};
    if (city) where.city = { equals: city, mode: "insensitive" };
    if (state) where.state = { equals: state, mode: "insensitive" };
    if (country) where.country = { equals: country, mode: "insensitive" };
    return where;
  }

  static filterByReligionCaste(religion?: string, caste?: string) {
    const where: any = {};
    if (religion) where.religion = { equals: religion, mode: "insensitive" };
    if (caste) where.caste = { equals: caste, mode: "insensitive" };
    return where;
  }

  static filterByIncome(minIncome?: number) {
    if (minIncome === undefined || minIncome === null) return {};
    return { income: { gte: minIncome } };
  }

  static filterByMotherTongue(motherTongue?: string) {
    if (!motherTongue) return {};
    return { motherTongue: { equals: motherTongue, mode: "insensitive" } };
  }

  static filterByHeightRange(minHeight?: number, maxHeight?: number) {
    if (!minHeight && !maxHeight) return {};
    const height: any = {};
    if (minHeight) height.gte = minHeight;
    if (maxHeight) height.lte = maxHeight;
    return { height };
  }

  static filterByEducation(education?: string) {
    if (!education) return {};
    return { education: { contains: education, mode: "insensitive" } };
  }

  static filterByOccupation(occupation?: string) {
    if (!occupation) return {};
    return { occupation: { contains: occupation, mode: "insensitive" } };
  }

  static filterByLifestyle(smoking?: string, drinking?: string, food?: string) {
    const where: any = {};
    if (smoking) where.smoking = { equals: smoking, mode: "insensitive" };
    if (drinking) where.drinking = { equals: drinking, mode: "insensitive" };
    if (food) where.foodPreference = { equals: food, mode: "insensitive" };
    return where;
  }

  static filterByVerification(isVerified?: boolean) {
    if (!isVerified) return {};
    return {
      user: {
        identityVerification: {
          status: "APPROVED",
        },
      },
    };
  }

  static filterByPremium(isPremium?: boolean) {
    if (!isPremium) return {};
    return {
      user: {
        memberships: {
          some: {
            status: "ACTIVE" as any,
            endDate: { gte: new Date() },
          },
        },
      },
    };
  }

  static filterByCompletion(minPercent?: number) {
    if (minPercent === undefined || minPercent === null) return {};
    return { completionPercent: { gte: minPercent } };
  }

  static filterBySubCasteGothram(subCaste?: string, gothram?: string) {
    const where: any = {};
    if (subCaste) where.subCaste = { equals: subCaste, mode: "insensitive" };
    if (gothram) where.gothram = { equals: gothram, mode: "insensitive" };
    return where;
  }

  static filterByWeightRange(minWeight?: number, maxWeight?: number) {
    if (!minWeight && !maxWeight) return {};
    const weight: any = {};
    if (minWeight) weight.gte = minWeight;
    if (maxWeight) weight.lte = maxWeight;
    return { weight };
  }

  static filterByIncomeRange(minIncome?: number, maxIncome?: number) {
    if (minIncome === undefined && maxIncome === undefined) return {};
    const income: any = {};
    if (minIncome !== undefined) income.gte = minIncome;
    if (maxIncome !== undefined) income.lte = maxIncome;
    return { income };
  }

  static filterByHasPhoto(hasPhoto?: boolean) {
    if (!hasPhoto) return {};
    return {
      photos: {
        some: {
          deletedAt: null,
        },
      },
    };
  }

  static filterByRecentlyJoined(recentlyJoined?: boolean) {
    if (!recentlyJoined) return {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return {
      createdAt: { gte: thirtyDaysAgo },
    };
  }

  static filterByCreatedWithinDays(days?: number) {
    if (!days || days <= 0) return {};
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return {
      createdAt: { gte: cutoff },
    };
  }

  static filterByRecentlyActive(recentlyActive?: boolean) {
    if (!recentlyActive) return {};
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return {
      updatedAt: { gte: sevenDaysAgo },
    };
  }
}

