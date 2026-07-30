import { BaseRepository } from "./base.repository";
import { IRecommendationRepository } from "./interfaces/recommendation.repository";
import { prisma } from "../prisma";

export class PrismaRecommendationRepository
  extends BaseRepository<any>
  implements IRecommendationRepository
{
  protected modelDelegate = prisma.recommendationHistory;

  async createHistory(userId: string, targetId: string, score: number): Promise<any> {
    return this.modelDelegate.create({
      data: {
        userId,
        targetId,
        score,
      },
    });
  }

  async clickRecommendation(userId: string, targetId: string): Promise<any> {
    const record = await this.modelDelegate.findFirst({
      where: {
        userId,
        targetId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!record) return null;

    return this.modelDelegate.update({
      where: { id: record.id },
      data: {
        clicked: true,
        clickedAt: new Date(),
      },
    });
  }

  async getRecommendationHistory(userId: string, limit: number): Promise<any[]> {
    return this.modelDelegate.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        target: {
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
  }
}
