import { Photo } from "@prisma/client";
import { prisma } from "../prisma";
import { BaseRepository } from "./base.repository";
import { IPhotoRepository } from "./interfaces/photo.repository";

export class PrismaPhotoRepository extends BaseRepository<Photo> implements IPhotoRepository {
  protected modelDelegate = prisma.photo;

  async findByProfileId(profileId: string): Promise<Photo[]> {
    return prisma.photo.findMany({
      where: { profileId, deletedAt: null },
      include: { media: true, metadata: true },
      orderBy: { createdAt: "asc" },
    });
  }

  async findPendingApproval(): Promise<Photo[]> {
    return prisma.photo.findMany({
      where: { isApproved: false, deletedAt: null },
      include: { media: true, profile: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async clearPrimary(profileId: string): Promise<void> {
    await prisma.photo.updateMany({
      where: { profileId, isMain: true },
      data: { isMain: false },
    });
  }
}
