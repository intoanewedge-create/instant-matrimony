import { BaseRepository } from "./base.repository";
import { IAnalyticsRepository } from "./interfaces/analytics.repository";
import { prisma } from "../prisma";

export class PrismaAnalyticsRepository
  extends BaseRepository<any>
  implements IAnalyticsRepository
{
  protected modelDelegate = prisma.profileVisitor;

  async trackVisitor(visitorId: string, visitedId: string): Promise<any> {
    return this.modelDelegate.create({
      data: {
        visitorId,
        visitedId,
      },
    });
  }

  async trackSearch(
    userId: string,
    query?: string,
    filters?: any,
  ): Promise<any> {
    return prisma.searchHistory.create({
      data: {
        userId,
        query,
        filters: filters ? JSON.parse(JSON.stringify(filters)) : undefined,
      },
    });
  }

  async getProfileViewsCount(userId: string): Promise<number> {
    return this.modelDelegate.count({
      where: {
        visitedId: userId,
      },
    });
  }

  async getVisitorStats(userId: string): Promise<any> {
    const visits = await this.modelDelegate.findMany({
      where: { visitedId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        visitor: {
          include: {
            profile: {
              include: {
                photos: {
                  where: { deletedAt: null, isApproved: true },
                },
              },
            },
          },
        },
      },
    });

    const totalViews = visits.length;
    const uniqueVisitors = new Set(visits.map((v) => v.visitorId)).size;

    return {
      totalViews,
      uniqueVisitors,
      visits,
    };
  }

  async getSearchHistory(userId: string, limit: number): Promise<any[]> {
    return prisma.searchHistory.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }

  async getAdminStats(): Promise<any> {
    const totalUsers = await prisma.user.count({ where: { deletedAt: null } });
    const activeUsers = await prisma.user.count({
      where: { isActive: true, deletedAt: null },
    });
    const totalProfiles = await prisma.profile.count({
      where: { deletedAt: null },
    });
    const pendingProfiles = await prisma.profile.count({
      where: { status: "PENDING", deletedAt: null },
    });
    const totalCmsPages = await prisma.cmsPage.count({
      where: { deletedAt: null },
    });
    const totalFeatureFlags = await prisma.featureFlag.count();

    return {
      totalUsers,
      activeUsers,
      totalProfiles,
      pendingProfiles,
      totalCmsPages,
      totalFeatureFlags,
    };
  }
}
