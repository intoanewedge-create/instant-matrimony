import { Profile } from "@prisma/client";
import { prisma } from "../prisma";
import { ISearchRepository } from "./interfaces/search.repository";
import { SearchSpecification } from "../specifications/search.specification";

export class PrismaSearchRepository implements ISearchRepository {
  async search(params: {
    viewerId: string;
    filters: any;
    page?: number;
    limit: number;
    sortBy?: string;
  }): Promise<{ data: Profile[]; totalRecords: number; page: number; totalPages: number }> {
    const { viewerId, filters, page = 1, limit = 12, sortBy = "bestMatch" } = params;

    const blocks = await prisma.block.findMany({
      where: {
        OR: [
          { blockerId: viewerId },
          { blockedId: viewerId },
        ],
      },
      select: {
        blockerId: true,
        blockedId: true,
      },
    });

    const blockedUserIds = Array.from(
      new Set(
        blocks.flatMap((b) => [b.blockerId, b.blockedId]).filter((id) => id !== viewerId)
      )
    );

    const viewerProfile = await prisma.profile.findUnique({
      where: { userId: viewerId },
      select: { gender: true, city: true, state: true, country: true, horoscope: true, education: true, occupation: true },
    });
    const viewerGender = viewerProfile?.gender?.toUpperCase();
    const enforcedTargetGender = viewerGender === "MALE" ? "FEMALE" : viewerGender === "FEMALE" ? "MALE" : "NONE";

    const category = filters.category || (params as any).category;
    let categoryTargetUserIds: string[] | null = null;

    if (category === "shortlisted_by_you") {
      const interests = await prisma.interest.findMany({
        where: { senderId: viewerId },
        select: { receiverId: true },
      });
      categoryTargetUserIds = interests.map((i) => i.receiverId);
    } else if (category === "viewed_you") {
      const visits = await prisma.profileVisitor.findMany({
        where: { visitedId: viewerId },
        select: { visitorId: true },
      });
      categoryTargetUserIds = visits.map((v) => v.visitorId);
    } else if (category === "shortlisted_you") {
      const interests = await prisma.interest.findMany({
        where: { receiverId: viewerId },
        select: { senderId: true },
      });
      categoryTargetUserIds = interests.map((i) => i.senderId);
    } else if (category === "viewed_by_you") {
      const visits = await prisma.profileVisitor.findMany({
        where: { visitorId: viewerId },
        select: { visitedId: true },
      });
      categoryTargetUserIds = visits.map((v) => v.visitedId);
    } else if (category === "newly_joined") {
      filters.recentlyJoined = true;
    } else if (category === "nearby") {
      if (viewerProfile?.city) filters.city = viewerProfile.city;
      else if (viewerProfile?.state) filters.state = viewerProfile.state;
      else if (viewerProfile?.country) filters.country = viewerProfile.country;
      else categoryTargetUserIds = [];
    } else if (category === "with_photos") {
      filters.hasPhoto = true;
    } else if (category === "with_horoscope") {
      const vHoroscope = viewerProfile?.horoscope?.trim();
      if (!vHoroscope) {
        categoryTargetUserIds = [];
      }
    } else if (category === "star_matches") {
      const vFullProf = await prisma.profile.findUnique({
        where: { userId: viewerId },
        select: { star: true },
      });
      const vStar = vFullProf?.star?.trim();
      if (!vStar) {
        categoryTargetUserIds = [];
      } else {
        const matchedProfs = await prisma.profile.findMany({
          where: {
            userId: { not: viewerId },
            status: "APPROVED",
            deletedAt: null,
            star: { equals: vStar, mode: "insensitive" },
          },
          select: { userId: true },
        });
        categoryTargetUserIds = matchedProfs.map((p) => p.userId);
      }
    } else if (category === "horoscope_matches") {
      const vFullProf = await prisma.profile.findUnique({
        where: { userId: viewerId },
        include: { partnerPreference: true },
      });
      const vPref = vFullProf?.partnerPreference;
      const prefStar = vPref?.star?.trim();
      const prefRasi = vPref?.rasi?.trim();

      if (!prefStar && !prefRasi) {
        categoryTargetUserIds = [];
      } else {
        const matchedProfs = await prisma.profile.findMany({
          where: {
            userId: { not: viewerId },
            status: "APPROVED",
            deletedAt: null,
            ...(prefStar ? { star: { equals: prefStar, mode: "insensitive" } } : {}),
            ...(prefRasi ? { rasi: { equals: prefRasi, mode: "insensitive" } } : {}),
          },
          select: { userId: true },
        });
        categoryTargetUserIds = matchedProfs.map((p) => p.userId);
      }
    } else if (category === "pref_education") {
      const vFullProf = await prisma.profile.findUnique({
        where: { userId: viewerId },
        include: { partnerPreference: true },
      });
      const prefEdu = vFullProf?.partnerPreference?.education?.trim();
      if (prefEdu && prefEdu.length > 0) {
        filters.education = prefEdu;
      } else {
        categoryTargetUserIds = [];
      }
    } else if (category === "pref_profession") {
      const vFullProf = await prisma.profile.findUnique({
        where: { userId: viewerId },
        include: { partnerPreference: true },
      });
      const prefOcc = vFullProf?.partnerPreference?.occupation?.trim();
      if (prefOcc && prefOcc.length > 0) {
        filters.occupation = prefOcc;
      } else {
        categoryTargetUserIds = [];
      }
    } else if (category === "pref_location") {
      const vFullProf = await prisma.profile.findUnique({
        where: { userId: viewerId },
        include: { partnerPreference: true },
      });
      const vPref = vFullProf?.partnerPreference;
      const prefCity = vPref?.city?.trim();
      const prefDistrict = vPref?.district?.trim();
      const prefState = vPref?.state?.trim();
      const prefCountry = vPref?.country?.trim();

      if (prefCity && prefCity.length > 0) {
        filters.city = prefCity;
      } else if (prefDistrict && prefDistrict.length > 0) {
        filters.district = prefDistrict;
      } else if (prefState && prefState.length > 0) {
        filters.state = prefState;
      } else if (prefCountry && prefCountry.length > 0) {
        filters.country = prefCountry;
      } else {
        categoryTargetUserIds = [];
      }
    } else if (category === "looking_for_you") {
      const vFullProf = await prisma.profile.findUnique({
        where: { userId: viewerId },
      });
      if (vFullProf) {
        const matchingPrefs = await prisma.partnerPreference.findMany({
          where: {
            OR: [
              vFullProf.religion ? { religion: { equals: vFullProf.religion, mode: "insensitive" } } : undefined,
              vFullProf.education ? { education: { equals: vFullProf.education, mode: "insensitive" } } : undefined,
              vFullProf.country ? { country: { equals: vFullProf.country, mode: "insensitive" } } : undefined,
            ].filter(Boolean) as any[],
          },
          select: { profileId: true },
        });
        const matchedProfileIds = matchingPrefs.map((p) => p.profileId);
        const matchedProfs = await prisma.profile.findMany({
          where: { id: { in: matchedProfileIds } },
          select: { userId: true },
        });
        categoryTargetUserIds = matchedProfs.map((p) => p.userId);
      } else {
        categoryTargetUserIds = [];
      }
    } else if (category === "mutual_matches") {
      const vFullProf = await prisma.profile.findUnique({
        where: { userId: viewerId },
        include: { partnerPreference: true },
      });
      if (vFullProf && vFullProf.partnerPreference) {
        const vPref = vFullProf.partnerPreference;
        const condA: any = {};
        if (vPref.religion?.trim()) condA.religion = { equals: vPref.religion.trim(), mode: "insensitive" };
        if (vPref.motherTongue?.trim()) condA.motherTongue = { equals: vPref.motherTongue.trim(), mode: "insensitive" };
        if (vPref.maritalStatus?.trim()) condA.maritalStatus = { equals: vPref.maritalStatus.trim(), mode: "insensitive" };
        if (vPref.education?.trim()) condA.education = { equals: vPref.education.trim(), mode: "insensitive" };
        if (vPref.occupation?.trim()) condA.occupation = { equals: vPref.occupation.trim(), mode: "insensitive" };
        if (vPref.country?.trim()) condA.country = { equals: vPref.country.trim(), mode: "insensitive" };
        if (vPref.state?.trim()) condA.state = { equals: vPref.state.trim(), mode: "insensitive" };
        if (vPref.district?.trim()) condA.district = { equals: vPref.district.trim(), mode: "insensitive" };
        if (vPref.city?.trim()) condA.city = { equals: vPref.city.trim(), mode: "insensitive" };
        if (vPref.star?.trim()) condA.star = { equals: vPref.star.trim(), mode: "insensitive" };
        if (vPref.rasi?.trim()) condA.rasi = { equals: vPref.rasi.trim(), mode: "insensitive" };
        if (vPref.minHeight || vPref.maxHeight) {
          condA.height = {
            ...(vPref.minHeight ? { gte: vPref.minHeight } : {}),
            ...(vPref.maxHeight ? { lte: vPref.maxHeight } : {}),
          };
        }

        const candidates = await prisma.profile.findMany({
          where: {
            userId: { not: viewerId },
            status: "APPROVED",
            deletedAt: null,
            user: { isActive: true, deletedAt: null },
            ...condA,
          },
          include: { partnerPreference: true },
        });

        const viewerDob = vFullProf.dateOfBirth;
        let viewerAge: number | null = null;
        if (viewerDob) {
          const diffMs = Date.now() - new Date(viewerDob).getTime();
          viewerAge = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
        }

        const mutualMatchedUserIds = candidates
          .filter((candidate) => {
            const cPref = candidate.partnerPreference;
            if (!cPref) return false;

            if (cPref.religion?.trim()) {
              if (!vFullProf.religion || cPref.religion.trim().toLowerCase() !== vFullProf.religion.trim().toLowerCase()) return false;
            }
            if (cPref.motherTongue?.trim()) {
              if (!vFullProf.motherTongue || cPref.motherTongue.trim().toLowerCase() !== vFullProf.motherTongue.trim().toLowerCase()) return false;
            }
            if (cPref.maritalStatus?.trim()) {
              if (!vFullProf.maritalStatus || cPref.maritalStatus.trim().toLowerCase() !== vFullProf.maritalStatus.trim().toLowerCase()) return false;
            }
            if (cPref.education?.trim()) {
              if (!vFullProf.education || cPref.education.trim().toLowerCase() !== vFullProf.education.trim().toLowerCase()) return false;
            }
            if (cPref.occupation?.trim()) {
              if (!vFullProf.occupation || cPref.occupation.trim().toLowerCase() !== vFullProf.occupation.trim().toLowerCase()) return false;
            }
            if (cPref.country?.trim()) {
              if (!vFullProf.country || cPref.country.trim().toLowerCase() !== vFullProf.country.trim().toLowerCase()) return false;
            }
            if (cPref.state?.trim()) {
              if (!vFullProf.state || cPref.state.trim().toLowerCase() !== vFullProf.state.trim().toLowerCase()) return false;
            }
            if (cPref.district?.trim()) {
              if (!vFullProf.district || cPref.district.trim().toLowerCase() !== vFullProf.district.trim().toLowerCase()) return false;
            }
            if (cPref.city?.trim()) {
              if (!vFullProf.city || cPref.city.trim().toLowerCase() !== vFullProf.city.trim().toLowerCase()) return false;
            }
            if (cPref.star?.trim()) {
              if (!vFullProf.star || cPref.star.trim().toLowerCase() !== vFullProf.star.trim().toLowerCase()) return false;
            }
            if (cPref.rasi?.trim()) {
              if (!vFullProf.rasi || cPref.rasi.trim().toLowerCase() !== vFullProf.rasi.trim().toLowerCase()) return false;
            }
            if (cPref.minAge || cPref.maxAge) {
              if (!viewerAge) return false;
              if (cPref.minAge && viewerAge < cPref.minAge) return false;
              if (cPref.maxAge && viewerAge > cPref.maxAge) return false;
            }
            if (cPref.minHeight || cPref.maxHeight) {
              if (!vFullProf.height) return false;
              if (cPref.minHeight && vFullProf.height < cPref.minHeight) return false;
              if (cPref.maxHeight && vFullProf.height > cPref.maxHeight) return false;
            }
            return true;
          })
          .map((c) => c.userId);

        categoryTargetUserIds = mutualMatchedUserIds;
      } else {
        categoryTargetUserIds = [];
      }
    }

    const where = SearchSpecification.buildWhereClause({
      viewerId,
      blockedUserIds,
      profilePublicId: filters.profilePublicId,
      gender: enforcedTargetGender,
      minAge: filters.minAge,
      maxAge: filters.maxAge,
      minHeight: filters.minHeight,
      maxHeight: filters.maxHeight,
      minWeight: filters.minWeight,
      maxWeight: filters.maxWeight,
      maritalStatus: filters.maritalStatus,
      religion: filters.religion,
      caste: filters.caste,
      subCaste: filters.subCaste,
      gothram: filters.gothram,
      motherTongue: filters.motherTongue,
      education: filters.education,
      occupation: filters.occupation,
      minIncome: filters.minIncome,
      maxIncome: filters.maxIncome,
      country: filters.country,
      state: filters.state,
      district: filters.district,
      city: filters.city,
      smoking: filters.smoking,
      drinking: filters.drinking,
      food: filters.food,
      isVerified: filters.isVerified,
      hasPhoto: filters.hasPhoto,
      recentlyJoined: filters.recentlyJoined,
      recentlyActive: filters.recentlyActive,
      minCompletion: filters.minCompletion,
      category,
      categoryTargetUserIds,
    });

    let orderBy: any = [];
    if (sortBy === "recentlyActive") {
      orderBy = [{ updatedAt: "desc" }];
    } else if (sortBy === "recentlyJoined") {
      orderBy = [{ createdAt: "desc" }];
    } else if (sortBy === "age") {
      orderBy = [{ dateOfBirth: "desc" }];
    } else if (sortBy === "height") {
      orderBy = [{ height: "desc" }];
    } else {
      // Default: bestMatch / profile completion
      orderBy = [{ completionPercent: "desc" }, { createdAt: "desc" }];
    }

    const totalRecords = await prisma.profile.count({ where });
    const skip = (page - 1) * limit;

    const data = (await prisma.profile.findMany({
      where,
      take: limit,
      skip,
      include: {
        photos: {
          where: { deletedAt: null },
        },
        privacy: true,
        user: {
          include: {
            memberships: {
              where: {
                status: "ACTIVE",
                endDate: { gte: new Date() },
              },
              take: 1,
            },
            identityVerification: true,
          },
        },
        partnerPreference: true,
      },
      orderBy,
    })) as any;

    const totalPages = Math.ceil(totalRecords / limit) || 1;

    return {
      data,
      totalRecords,
      page,
      totalPages,
    };
  }

  async saveSearchHistory(userId: string, query?: string, filters?: any): Promise<any> {
    return prisma.searchHistory.create({
      data: {
        userId,
        query: query || null,
        filters: filters || null,
      },
    });
  }

  async getRecentSearches(userId: string, limit: number): Promise<any[]> {
    return prisma.searchHistory.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  async getPopularSearches(limit: number): Promise<any[]> {
    const raw = await prisma.searchHistory.groupBy({
      by: ["query"],
      where: {
        query: { not: null },
      },
      _count: {
        query: true,
      },
      orderBy: {
        _count: {
          query: "desc",
        },
      },
      take: limit,
    });
    return raw.map((r) => ({
      query: r.query,
      count: r._count.query,
    }));
  }

  async getSearchAnalytics(limit: number): Promise<any[]> {
    return prisma.searchHistory.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }
}
