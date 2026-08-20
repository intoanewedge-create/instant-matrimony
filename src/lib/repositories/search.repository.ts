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
      include: {
        partnerPreference: true,
      },
    });
    const viewerGender = viewerProfile?.gender?.toUpperCase();
    const enforcedTargetGender = viewerGender === "MALE" ? "FEMALE" : viewerGender === "FEMALE" ? "MALE" : "NONE";
    const viewerPref = viewerProfile?.partnerPreference;

    const rawCategory = filters.category || (params as any).category;
    const category = rawCategory?.toLowerCase();
    let categoryTargetUserIds: string[] | null = null;

    if (category === "shortlisted_by_you") {
      const [favs, interests] = await Promise.all([
        prisma.favorite.findMany({
          where: { userId: viewerId },
          select: { favoriteUserId: true },
        }),
        prisma.interest.findMany({
          where: { senderId: viewerId },
          select: { receiverId: true },
        }),
      ]);
      categoryTargetUserIds = Array.from(
        new Set([...favs.map((f) => f.favoriteUserId), ...interests.map((i) => i.receiverId)])
      );
    } else if (category === "viewed_you") {
      const visits = await prisma.profileVisitor.findMany({
        where: { visitedId: viewerId },
        select: { visitorId: true },
      });
      categoryTargetUserIds = Array.from(new Set(visits.map((v) => v.visitorId)));
    } else if (category === "shortlisted_you") {
      const [favs, interests] = await Promise.all([
        prisma.favorite.findMany({
          where: { favoriteUserId: viewerId },
          select: { userId: true },
        }),
        prisma.interest.findMany({
          where: { receiverId: viewerId },
          select: { senderId: true },
        }),
      ]);
      categoryTargetUserIds = Array.from(
        new Set([...favs.map((f) => f.userId), ...interests.map((i) => i.senderId)])
      );
    } else if (category === "viewed_by_you") {
      const visits = await prisma.profileVisitor.findMany({
        where: { visitorId: viewerId },
        select: { visitedId: true },
      });
      categoryTargetUserIds = Array.from(new Set(visits.map((v) => v.visitedId)));
    } else if (category === "new_matches") {
      filters.createdWithinDays = 7;
      if (viewerPref) {
        if (filters.minAge === undefined && viewerPref.minAge) filters.minAge = viewerPref.minAge;
        if (filters.maxAge === undefined && viewerPref.maxAge) filters.maxAge = viewerPref.maxAge;
        if (filters.minHeight === undefined && viewerPref.minHeight) filters.minHeight = viewerPref.minHeight;
        if (filters.maxHeight === undefined && viewerPref.maxHeight) filters.maxHeight = viewerPref.maxHeight;
        if (!filters.maritalStatus && viewerPref.maritalStatus) filters.maritalStatus = viewerPref.maritalStatus;
        if (!filters.religion && viewerPref.religion) filters.religion = viewerPref.religion;
        if (!filters.motherTongue && viewerPref.motherTongue) filters.motherTongue = viewerPref.motherTongue;
        if (!filters.education && viewerPref.education) filters.education = viewerPref.education;
        if (!filters.country && viewerPref.country) filters.country = viewerPref.country;
      }
    } else if (
      category === "recently_joined" ||
      category === "newly_joined"
    ) {
      filters.createdWithinDays = 30;
    } else if (category === "with_photos" || category === "matches_with_photos") {
      filters.hasPhoto = true;
    } else if (category === "nearby") {
      if (viewerProfile?.city) filters.city = viewerProfile.city;
      else if (viewerProfile?.district) filters.district = viewerProfile.district;
      else if (viewerProfile?.state) filters.state = viewerProfile.state;
      else if (viewerProfile?.country) filters.country = viewerProfile.country;
    } else if (category === "mutual_matches") {
      // True bidirectional compatibility
      const candidateWhereForViewerPref = SearchSpecification.buildWhereClause({
        viewerId,
        blockedUserIds,
        gender: enforcedTargetGender,
        minAge: viewerPref?.minAge ?? undefined,
        maxAge: viewerPref?.maxAge ?? undefined,
        minHeight: viewerPref?.minHeight ?? undefined,
        maxHeight: viewerPref?.maxHeight ?? undefined,
        maritalStatus: viewerPref?.maritalStatus || undefined,
        religion: viewerPref?.religion || undefined,
        motherTongue: viewerPref?.motherTongue || undefined,
        education: viewerPref?.education || undefined,
        country: viewerPref?.country || undefined,
      });

      const compatibleCandidates = await prisma.profile.findMany({
        where: candidateWhereForViewerPref,
        select: {
          userId: true,
          partnerPreference: true,
        },
        take: 100,
      });

      const viewerAge = viewerProfile?.dateOfBirth
        ? Math.floor((Date.now() - new Date(viewerProfile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : undefined;

      const bidirectionalUserIds: string[] = [];
      for (const cand of compatibleCandidates) {
        const cp = cand.partnerPreference;
        if (!cp) {
          bidirectionalUserIds.push(cand.userId);
          continue;
        }
        let matches = true;
        if (cp.minAge && viewerAge && viewerAge < cp.minAge) matches = false;
        if (cp.maxAge && viewerAge && viewerAge > cp.maxAge) matches = false;
        if (cp.minHeight && viewerProfile?.height && viewerProfile.height < cp.minHeight) matches = false;
        if (cp.maxHeight && viewerProfile?.height && viewerProfile.height > cp.maxHeight) matches = false;
        if (cp.religion && viewerProfile?.religion && cp.religion.toLowerCase() !== viewerProfile.religion.toLowerCase()) matches = false;
        if (cp.maritalStatus && viewerProfile?.maritalStatus && cp.maritalStatus.toLowerCase() !== viewerProfile.maritalStatus.toLowerCase()) matches = false;
        if (cp.country && viewerProfile?.country && cp.country.toLowerCase() !== viewerProfile.country.toLowerCase()) matches = false;
        if (matches) {
          bidirectionalUserIds.push(cand.userId);
        }
      }

      const [myFavs, acceptedInterests] = await Promise.all([
        prisma.favorite.findMany({
          where: { userId: viewerId },
          select: { favoriteUserId: true },
        }),
        prisma.interest.findMany({
          where: {
            OR: [
              { senderId: viewerId, status: "ACCEPTED" },
              { receiverId: viewerId, status: "ACCEPTED" },
            ],
          },
          select: { senderId: true, receiverId: true },
        }),
      ]);

      const myFavIds = myFavs.map((f) => f.favoriteUserId);
      const mutualFavs = await prisma.favorite.findMany({
        where: {
          userId: { in: myFavIds },
          favoriteUserId: viewerId,
        },
        select: { userId: true },
      });
      const mutualFavUserIds = mutualFavs.map((f) => f.userId);
      const acceptedUserIds = acceptedInterests.map((i) =>
        i.senderId === viewerId ? i.receiverId : i.senderId
      );

      categoryTargetUserIds = Array.from(
        new Set([...bidirectionalUserIds, ...mutualFavUserIds, ...acceptedUserIds])
      );
    } else if (category === "looking_for_you") {
      if (viewerProfile) {
        const viewerAge = viewerProfile.dateOfBirth
          ? Math.floor((Date.now() - new Date(viewerProfile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          : undefined;

        const prefConditions: any[] = [];
        if (viewerProfile.religion) {
          prefConditions.push({
            religion: { equals: viewerProfile.religion, mode: "insensitive" },
          });
        }
        if (viewerProfile.motherTongue) {
          prefConditions.push({
            motherTongue: { equals: viewerProfile.motherTongue, mode: "insensitive" },
          });
        }
        if (viewerProfile.education) {
          prefConditions.push({
            education: { contains: viewerProfile.education, mode: "insensitive" },
          });
        }
        if (viewerProfile.maritalStatus) {
          prefConditions.push({
            maritalStatus: { equals: viewerProfile.maritalStatus, mode: "insensitive" },
          });
        }
        if (viewerProfile.country) {
          prefConditions.push({
            country: { equals: viewerProfile.country, mode: "insensitive" },
          });
        }
        if (viewerAge) {
          prefConditions.push({
            AND: [
              { OR: [{ minAge: null }, { minAge: { lte: viewerAge } }] },
              { OR: [{ maxAge: null }, { maxAge: { gte: viewerAge } }] },
            ],
          });
        }

        const matchingPrefs = await prisma.partnerPreference.findMany({
          where: {
            OR: prefConditions.length > 0 ? prefConditions : undefined,
          },
          select: { profile: { select: { userId: true } } },
        });
        categoryTargetUserIds = matchingPrefs.map((p) => p.profile.userId);
      }
    } else if (
      category === "pref_education" ||
      category === "education_preference"
    ) {
      if (viewerPref?.education) {
        filters.education = viewerPref.education;
      } else if (viewerProfile?.education) {
        filters.education = viewerProfile.education;
      } else {
        categoryTargetUserIds = [];
      }
    } else if (
      category === "pref_profession" ||
      category === "profession_preference"
    ) {
      if (viewerProfile?.occupation) {
        filters.occupation = viewerProfile.occupation;
      } else {
        categoryTargetUserIds = [];
      }
    } else if (
      category === "pref_location" ||
      category === "location_preference"
    ) {
      if (viewerPref?.country) {
        filters.country = viewerPref.country;
      } else if (viewerProfile?.country) {
        filters.country = viewerProfile.country;
      } else {
        categoryTargetUserIds = [];
      }
    } else if (category === "all" || category === "best_matches" || !category) {
      // Best Matches: Apply viewer's PartnerPreference
      if (viewerPref) {
        if (filters.minAge === undefined && viewerPref.minAge) filters.minAge = viewerPref.minAge;
        if (filters.maxAge === undefined && viewerPref.maxAge) filters.maxAge = viewerPref.maxAge;
        if (filters.minHeight === undefined && viewerPref.minHeight) filters.minHeight = viewerPref.minHeight;
        if (filters.maxHeight === undefined && viewerPref.maxHeight) filters.maxHeight = viewerPref.maxHeight;
        if (!filters.maritalStatus && viewerPref.maritalStatus) filters.maritalStatus = viewerPref.maritalStatus;
        if (!filters.religion && viewerPref.religion) filters.religion = viewerPref.religion;
        if (!filters.motherTongue && viewerPref.motherTongue) filters.motherTongue = viewerPref.motherTongue;
        if (!filters.education && viewerPref.education) filters.education = viewerPref.education;
        if (!filters.country && viewerPref.country) filters.country = viewerPref.country;
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
      createdWithinDays: filters.createdWithinDays,
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
