import { Profile } from "@prisma/client";
import { prisma } from "../prisma";
import { BaseRepository } from "./base.repository";
import { IProfileRepository } from "./interfaces/profile.repository";

export class PrismaProfileRepository extends BaseRepository<Profile> implements IProfileRepository {
  protected modelDelegate = prisma.profile;

  async findByUserId(userId: string): Promise<Profile | null> {
    return prisma.profile.findFirst({
      where: { userId, deletedAt: null },
      include: {
        photos: true,
        partnerPreference: true,
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            isActive: true,
          },
        },
      },
    }) as any;
  }

  async findPendingApproval(cursor?: string, limit: number = 10): Promise<Profile[]> {
    return prisma.profile.findMany({
      where: { status: "PENDING", deletedAt: null },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: { photos: true, user: true },
      orderBy: { updatedAt: "desc" },
    });
  }

  async findApproved(cursor?: string, limit: number = 10): Promise<Profile[]> {
    return prisma.profile.findMany({
      where: { status: "APPROVED", deletedAt: null },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: { photos: true, user: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
