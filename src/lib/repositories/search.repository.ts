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
      select: { gender: true, city: true, district: true, state: true, country: true },
    });
    const viewerGender = viewerProfile?.gender?.toUpperCase();
    const enforcedTargetGender = viewerGender === "MALE" ? "FEMALE" : viewerGender === "FEMALE" ? "MALE" : "NONE";

    const rawCategory = filters.category || (params as any).category;
    const category = rawCategory?.toLowerCase();
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
    } else if (
      category === "new_matches" ||
      category === "newly_joined" ||
      category === "recently_joined"
    ) {
      filters.recentlyJoined = true;
    } else if (category === "with_photos" || category === "matches_with_photos") {
      filters.hasPhoto = true;
    } else if (category === "nearby") {
      if (viewerProfile?.city) filters.city = viewerProfile.city;
      else if (viewerProfile?.district) filters.district = viewerProfile.district;
      else if (viewerProfile?.state) filters.state = viewerProfile.state;
      else if (viewerProfile?.country) filters.country = viewerProfile.country;
    } else if (category === "mutual_matches") {
      // Reciprocal Shortlists (A favorited B and B favorited A)
      const myFavs = await prisma.favorite.findMany({
        where: { userId: viewerId },
        select: { favoriteUserId: true },
      });
      const myFavIds = myFavs.map((f) => f.favoriteUserId);

      const mutualFavs = await prisma.favorite.findMany({
        where: {
          userId: { in: myFavIds },
          favoriteUserId: viewerId,
        },
        select: { userId: true },
      });
      const mutualFavUserIds = mutualFavs.map((f) => f.userId);

      // Mutual / Reciprocal Interests
      const mySentInterests = await prisma.interest.findMany({
        where: { senderId: viewerId },
        select: { receiverId: true },
      });
      const mySentIds = mySentInterests.map((i) => i.receiverId);

      const reciprocalInterests = await prisma.interest.findMany({
        where: {
          senderId: { in: mySentIds },
          receiverId: viewerId,
        },
        select: { senderId: true },
      });
      const mutualInterestUserIds = reciprocalInterests.map((i) => i.senderId);

      const acceptedInterests = await prisma.interest.findMany({
        where: {
          OR: [
            { senderId: viewerId, status: "ACCEPTED" },
            { receiverId: viewerId, status: "ACCEPTED" },
          ],
        },
        select: { senderId: true, receiverId: true },
      });
      const acceptedUserIds = acceptedInterests.map((i) =>
        i.senderId === viewerId ? i.receiverId : i.senderId
      );

      categoryTargetUserIds = Array.from(
        new Set([...mutualFavUserIds, ...mutualInterestUserIds, ...acceptedUserIds])
      );
    } else if (category === "looking_for_you") {
      const viewerFull = await prisma.profile.findUnique({
        where: { userId: viewerId },
        select: {
          dateOfBirth: true,
          height: true,
          maritalStatus: true,
          religion: true,
          motherTongue: true,
          education: true,
          country: true,
        },
      });

      if (viewerFull) {
        const prefConditions: any[] = [];
        if (viewerFull.religion) {
          prefConditions.push({
            religion: { equals: viewerFull.religion, mode: "insensitive" },
          });
        }
        if (viewerFull.motherTongue) {
          prefConditions.push({
            motherTongue: { equals: viewerFull.motherTongue, mode: "insensitive" },
          });
        }
        if (viewerFull.education) {
          prefConditions.push({
            education: { contains: viewerFull.education, mode: "insensitive" },
          });
        }
        if (viewerFull.maritalStatus) {
          prefConditions.push({
            maritalStatus: { equals: viewerFull.maritalStatus, mode: "insensitive" },
          });
        }
        if (viewerFull.country) {
          prefConditions.push({
            country: { equals: viewerFull.country, mode: "insensitive" },
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
      category === "education_preference" ||
      category === "pref_profession" ||
      category === "profession_preference" ||
      category === "pref_location" ||
      category === "location_preference"
    ) {
      const pref = await prisma.partnerPreference.findFirst({
        where: { profile: { userId: viewerId } },
      });
      if (category === "pref_education" || category === "education_preference") {
        if (pref?.education) {
          filters.education = pref.education;
        } else {
          categoryTargetUserIds = [];
        }
      } else if (category === "pref_profession" || category === "profession_preference") {
        // PartnerPreference has no occupation field in database schema
        categoryTargetUserIds = [];
      } else if (category === "pref_location" || category === "location_preference") {
        if (pref?.country) {
          filters.country = pref.country;
        } else if (viewerProfile?.country) {
          filters.country = viewerProfile.country;
        } else {
          categoryTargetUserIds = [];
        }
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
