import { Profile } from "@prisma/client";
import { prisma } from "../prisma";
import { ISearchRepository } from "./interfaces/search.repository";
import { SearchSpecification } from "../specifications/search.specification";

export class PrismaSearchRepository implements ISearchRepository {
  async search(params: {
    viewerId: string;
    filters: any;
    cursor?: string;
    limit: number;
    sortBy?: string;
  }): Promise<Profile[]> {
    const { viewerId, filters, cursor, limit, sortBy } = params;

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

    const where = SearchSpecification.buildWhereClause({
      viewerId,
      blockedUserIds,
      gender: filters.gender,
      minAge: filters.minAge,
      maxAge: filters.maxAge,
      religion: filters.religion,
      caste: filters.caste,
      city: filters.city,
      state: filters.state,
      country: filters.country,
      minIncome: filters.minIncome,
      motherTongue: filters.motherTongue,
      minHeight: filters.minHeight,
      maxHeight: filters.maxHeight,
      education: filters.education,
      occupation: filters.occupation,
      smoking: filters.smoking,
      drinking: filters.drinking,
      food: filters.food,
      isVerified: filters.isVerified,
      isPremium: filters.isPremium,
      minCompletion: filters.minCompletion,
    });

    let orderBy: any = [];
    if (sortBy === "recentlyActive") {
      orderBy = [
        { user: { lastLoginAt: "desc" } },
        { createdAt: "desc" }
      ];
    } else if (sortBy === "newest") {
      orderBy = [
        { createdAt: "desc" }
      ];
    } else if (sortBy === "premium") {
      orderBy = [
        {
          user: {
            memberships: {
              _count: "desc"
            }
          }
        },
        { createdAt: "desc" }
      ];
    } else if (sortBy === "verified") {
      orderBy = [
        {
          user: {
            identityVerification: {
              status: "desc"
            }
          }
        },
        { createdAt: "desc" }
      ];
    } else {
      orderBy = [
        { completionPercent: "desc" },
        { createdAt: "desc" }
      ];
    }

    return prisma.profile.findMany({
      where,
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        photos: {
          where: { deletedAt: null, isApproved: true },
        },
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
    }) as any;
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

