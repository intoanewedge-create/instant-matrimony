import { Media } from "@prisma/client";
import { prisma } from "../prisma";
import { BaseRepository } from "./base.repository";
import { IMediaRepository } from "./interfaces/media.repository";

export class PrismaMediaRepository extends BaseRepository<Media> implements IMediaRepository {
  protected modelDelegate = prisma.media;

  async findByKey(key: string): Promise<Media | null> {
    return prisma.media.findFirst({
      where: { key, deletedAt: null },
    });
  }

  async findByUserId(userId: string): Promise<Media[]> {
    return prisma.media.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }
}
