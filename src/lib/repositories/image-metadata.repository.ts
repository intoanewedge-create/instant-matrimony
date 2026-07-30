import { ImageMetadata } from "@prisma/client";
import { prisma } from "../prisma";
import { BaseRepository } from "./base.repository";
import { IImageMetadataRepository } from "./interfaces/image-metadata.repository";

export class PrismaImageMetadataRepository extends BaseRepository<ImageMetadata> implements IImageMetadataRepository {
  protected modelDelegate = prisma.imageMetadata;

  async findByPhotoId(photoId: string): Promise<ImageMetadata | null> {
    return prisma.imageMetadata.findUnique({
      where: { photoId },
    });
  }

  async findByChecksum(checksum: string): Promise<ImageMetadata[]> {
    return prisma.imageMetadata.findMany({
      where: { checksum, deletedAt: null },
    });
  }
}
