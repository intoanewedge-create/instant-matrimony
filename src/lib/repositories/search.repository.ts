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
      select: { gender: true, city: true, state: true, country: true },
    });
    const viewerGender = viewerProfile?.gender?.toUpperCase();
    const enforcedTargetGender = viewerGender === "MALE" ? "FEMALE" : viewerGender === "FEMALE" ? "MALE" : "NONE";

    const category = filters.category || (params as any).category;
    let categoryTargetUserIds: string[] | null = null;

    if (category === "shortlisted_by_you") {
      const favs = await prisma.favorite.findMany({
        where: { userId: viewerId },
        select: { favoriteUserId: true },
      });
      categoryTargetUserIds = favs.map((f) => f.favoriteUserId);
    } else if (category === "viewed_you") {
      const visits = await prisma.profileVisitor.findMany({
        where: { visitedId: viewerId },
        select: { visitorId: true },
      });
      categoryTargetUserIds = visits.map((v) => v.visitorId);
    } else if (category === "shortlisted_you") {
      const favs = await prisma.favorite.findMany({
        where: { favoriteUserId: viewerId },
        select: { userId: true },
      });
      categoryTargetUserIds = favs.map((f) => f.userId);
    } else if (category === "viewed_by_you") {
      const visits = await prisma.profileVisitor.findMany({
        where: { visitorId: viewerId },
        select: { visitedId: true },
      });
      categoryTargetUserIds = visits.map((v) => v.visitedId);
    } else if (category === "nearby") {
      if (viewerProfile?.city) filters.city = viewerProfile.city;
      else if (viewerProfile?.state) filters.state = viewerProfile.state;
      else if (viewerProfile?.country) filters.country = viewerProfile.country;
    } else if (category === "pref_education" || category === "pref_profession" || category === "pref_location") {
      const pref = await prisma.partnerPreference.findFirst({
        where: { profile: { userId: viewerId } },
      });
      if (pref) {
        if (category === "pref_education" && pref.education) filters.education = pref.education;
        if (category === "pref_location" && pref.country) filters.country = pref.country;
      }
    } else if (category === "looking_for_you") {
      const vFullProf = await prisma.profile.findUnique({
        where: { userId: viewerId },
        select: { religion: true, education: true },
      });
      if (vFullProf) {
        const matchingPrefs = await prisma.partnerPreference.findMany({
          where: {
            OR: [
              { religion: { equals: vFullProf.religion, mode: "insensitive" } },
              { education: { equals: vFullProf.education, mode: "insensitive" } },
            ],
          },
          select: { profileId: true },
        });
        const matchedProfileIds = matchingPrefs.map((p) => p.profileId);
        const matchedProfs = await prisma.profile.findMany({
          where: { id: { in: matchedProfileIds } },
          select: { userId: true },
        });
        categoryTargetUserIds = matchedProfs.map((p) => p.userId);
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
