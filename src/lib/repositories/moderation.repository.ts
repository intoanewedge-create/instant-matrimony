import { ModerationHistory } from "@prisma/client";
import { prisma } from "../prisma";
import { IModerationRepository } from "./interfaces/moderation.repository";

export class PrismaModerationRepository implements IModerationRepository {
  async findById(id: string): Promise<ModerationHistory | null> {
    return prisma.moderationHistory.findUnique({
      where: { id },
    });
  }

  async create(data: any): Promise<ModerationHistory> {
    return prisma.moderationHistory.create({
      data,
    });
  }

  async findByTargetUserId(targetUserId: string): Promise<ModerationHistory[]> {
    return prisma.moderationHistory.findMany({
      where: { targetUserId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findRecent(limit = 10): Promise<ModerationHistory[]> {
    return prisma.moderationHistory.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  }
}
