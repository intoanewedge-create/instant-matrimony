export class ProfileSpecification {
  static approvedOnly() {
    return {
      status: "APPROVED" as any,
      deletedAt: null,
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
}
