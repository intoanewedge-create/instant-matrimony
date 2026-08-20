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

    // Fetch Viewer's Partner Preference for preference-driven categories
    const viewerPref = await prisma.partnerPreference.findFirst({
      where: { profile: { userId: viewerId } },
    });

    if (category === "shortlisted_by_you") {
      const [favs, sentInterests] = await Promise.all([
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
        new Set([
          ...favs.map((f) => f.favoriteUserId),
          ...sentInterests.map((i) => i.receiverId),
        ])
      );
    } else if (category === "viewed_you") {
      const visits = await prisma.profileVisitor.findMany({
        where: { visitedId: viewerId },
        select: { visitorId: true },
      });
      categoryTargetUserIds = visits.map((v) => v.visitorId);
    } else if (category === "shortlisted_you") {
      const [favs, receivedInterests] = await Promise.all([
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
        new Set([
          ...favs.map((f) => f.userId),
          ...receivedInterests.map((i) => i.senderId),
        ])
      );
    } else if (category === "viewed_by_you") {
      const visits = await prisma.profileVisitor.findMany({
        where: { visitorId: viewerId },
        select: { visitedId: true },
      });
      categoryTargetUserIds = visits.map((v) => v.visitedId);
    } else if (category === "new_matches") {
      // Created within last 7 days + matches preference
      filters.recentlyJoined = true;
      if (viewerPref) {
        if (viewerPref.minAge && !filters.minAge) filters.minAge = viewerPref.minAge;
        if (viewerPref.maxAge && !filters.maxAge) filters.maxAge = viewerPref.maxAge;
        if (viewerPref.minHeight && !filters.minHeight) filters.minHeight = viewerPref.minHeight;
        if (viewerPref.maxHeight && !filters.maxHeight) filters.maxHeight = viewerPref.maxHeight;
        if (viewerPref.religion && !filters.religion) filters.religion = viewerPref.religion;
        if (viewerPref.caste && !filters.caste) filters.caste = viewerPref.caste;
        if (viewerPref.motherTongue && !filters.motherTongue) filters.motherTongue = viewerPref.motherTongue;
        if (viewerPref.education && !filters.education) filters.education = viewerPref.education;
        if ((viewerPref as any).occupation && !filters.occupation) filters.occupation = (viewerPref as any).occupation;
        if ((viewerPref as any).city && !filters.city) filters.city = (viewerPref as any).city;
        if ((viewerPref as any).state && !filters.state) filters.state = (viewerPref as any).state;
        if (viewerPref.country && !filters.country) filters.country = viewerPref.country;
        if (viewerPref.maritalStatus && !filters.maritalStatus && viewerPref.maritalStatus !== "Any") {
          filters.maritalStatus = viewerPref.maritalStatus;
        }
      }
    } else if (
      category === "recently_joined" ||
      category === "newly_joined"
    ) {
      // Created within last 30 days
      filters.recentlyJoined = true;
    } else if (category === "with_photos" || category === "matches_with_photos") {
      filters.hasPhoto = true;
    } else if (category === "nearby") {
      // Uses location preference from logged-in user's Partner Preference
      if ((viewerPref as any)?.city) filters.city = (viewerPref as any).city;
      else if ((viewerPref as any)?.state) filters.state = (viewerPref as any).state;
      else if (viewerPref?.country) filters.country = viewerPref.country;
      else if (viewerProfile?.city) filters.city = viewerProfile.city;
      else if (viewerProfile?.district) filters.district = viewerProfile.district;
      else if (viewerProfile?.state) filters.state = viewerProfile.state;
      else if (viewerProfile?.country) filters.country = viewerProfile.country;
    } else if (
      category === "pref_location" ||
      category === "location_preference"
    ) {
      if ((viewerPref as any)?.city) filters.city = (viewerPref as any).city;
      else if ((viewerPref as any)?.state) filters.state = (viewerPref as any).state;
      else if (viewerPref?.country) filters.country = viewerPref.country;
      else if (viewerProfile?.state) filters.state = viewerProfile.state;
      else if (viewerProfile?.country) filters.country = viewerProfile.country;
    } else if (
      category === "pref_education" ||
      category === "education_preference"
    ) {
      if (viewerPref?.education) {
        filters.education = viewerPref.education;
      }
    } else if (
      category === "pref_profession" ||
      category === "profession_preference"
    ) {
      if ((viewerPref as any)?.occupation) {
        filters.occupation = (viewerPref as any).occupation;
      } else if (viewerPref?.education) {
        filters.education = viewerPref.education;
      }
    } else if (category === "mutual_matches") {
      // Pure TWO-WAY Profile / Preference compatibility check
      // 1. Apply viewer's PartnerPreference to candidate filters
      if (viewerPref) {
        if (viewerPref.minAge && !filters.minAge) filters.minAge = viewerPref.minAge;
        if (viewerPref.maxAge && !filters.maxAge) filters.maxAge = viewerPref.maxAge;
        if (viewerPref.minHeight && !filters.minHeight) filters.minHeight = viewerPref.minHeight;
        if (viewerPref.maxHeight && !filters.maxHeight) filters.maxHeight = viewerPref.maxHeight;
        if (viewerPref.religion && !filters.religion) filters.religion = viewerPref.religion;
        if (viewerPref.motherTongue && !filters.motherTongue) filters.motherTongue = viewerPref.motherTongue;
        if (viewerPref.maritalStatus && !filters.maritalStatus && viewerPref.maritalStatus !== "Any") {
          filters.maritalStatus = viewerPref.maritalStatus;
        }
      }

      // 2. Candidate's PartnerPreference must also match viewer's profile details
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
            religion: { equals: viewerFull.religion, mode: "insensitive" as const },
          });
        }
        if (viewerFull.motherTongue) {
          prefConditions.push({
            motherTongue: { equals: viewerFull.motherTongue, mode: "insensitive" as const },
          });
        }
        if (viewerFull.education) {
          prefConditions.push({
            education: { contains: viewerFull.education, mode: "insensitive" as const },
          });
        }
        if (viewerFull.maritalStatus) {
          prefConditions.push({
            maritalStatus: { equals: viewerFull.maritalStatus, mode: "insensitive" as const },
          });
        }
        if (viewerFull.country) {
          prefConditions.push({
            country: { equals: viewerFull.country, mode: "insensitive" as const },
          });
        }

        const matchingCandidatePrefs = await prisma.partnerPreference.findMany({
          where: {
            OR: prefConditions.length > 0 ? prefConditions : undefined,
          },
          include: { profile: { select: { userId: true } } },
        });
        categoryTargetUserIds = matchingCandidatePrefs.map((p) => p.profile.userId);
      }
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
            religion: { equals: viewerFull.religion, mode: "insensitive" as const },
          });
        }
        if (viewerFull.motherTongue) {
          prefConditions.push({
            motherTongue: { equals: viewerFull.motherTongue, mode: "insensitive" as const },
          });
        }
        if (viewerFull.education) {
          prefConditions.push({
            education: { contains: viewerFull.education, mode: "insensitive" as const },
          });
        }
        if (viewerFull.maritalStatus) {
          prefConditions.push({
            maritalStatus: { equals: viewerFull.maritalStatus, mode: "insensitive" as const },
          });
        }
        if (viewerFull.country) {
          prefConditions.push({
            country: { equals: viewerFull.country, mode: "insensitive" as const },
          });
        }

        const matchingPrefs = await prisma.partnerPreference.findMany({
          where: {
            OR: prefConditions.length > 0 ? prefConditions : undefined,
          },
          include: { profile: { select: { userId: true } } },
        });
        categoryTargetUserIds = matchingPrefs.map((p) => p.profile.userId);
      }
    } else if (category === "all" || category === "best_matches" || !category) {
      // Best Matches: Apply user's full partner preference criteria
      if (viewerPref) {
        if (viewerPref.minAge && !filters.minAge) filters.minAge = viewerPref.minAge;
        if (viewerPref.maxAge && !filters.maxAge) filters.maxAge = viewerPref.maxAge;
        if (viewerPref.minHeight && !filters.minHeight) filters.minHeight = viewerPref.minHeight;
        if (viewerPref.maxHeight && !filters.maxHeight) filters.maxHeight = viewerPref.maxHeight;
        if (viewerPref.religion && !filters.religion) filters.religion = viewerPref.religion;
        if (viewerPref.caste && !filters.caste) filters.caste = viewerPref.caste;
        if (viewerPref.motherTongue && !filters.motherTongue) filters.motherTongue = viewerPref.motherTongue;
        if (viewerPref.education && !filters.education) filters.education = viewerPref.education;
        if ((viewerPref as any).occupation && !filters.occupation) filters.occupation = (viewerPref as any).occupation;
        if ((viewerPref as any).city && !filters.city) filters.city = (viewerPref as any).city;
        if ((viewerPref as any).state && !filters.state) filters.state = (viewerPref as any).state;
        if (viewerPref.country && !filters.country) filters.country = viewerPref.country;
        if (viewerPref.maritalStatus && !filters.maritalStatus && viewerPref.maritalStatus !== "Any") {
          filters.maritalStatus = viewerPref.maritalStatus;
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
