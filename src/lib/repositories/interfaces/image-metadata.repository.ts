import { ImageMetadata } from "@prisma/client";

export interface IImageMetadataRepository {
  findById(id: string): Promise<ImageMetadata | null>;
  create(data: any): Promise<ImageMetadata>;
  update(id: string, data: any): Promise<ImageMetadata>;
  softDelete(id: string): Promise<ImageMetadata>;
  findByPhotoId(photoId: string): Promise<ImageMetadata | null>;
  findByChecksum(checksum: string): Promise<ImageMetadata[]>;
}
