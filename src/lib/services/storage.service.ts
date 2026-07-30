import { BaseService } from "./base.service";
import { Result } from "../result";
import { Media, MediaType } from "@prisma/client";
import { StorageProvider } from "../storage/storage-provider";
import { IMediaRepository } from "../repositories/interfaces/media.repository";
import { storageConfig } from "@/config/storage.config";

export class StorageService extends BaseService {
  constructor(
    private storageProvider: StorageProvider,
    private mediaRepository: IMediaRepository
  ) {
    super();
  }

  async uploadFile(
    file: { name: string; buffer: Buffer; mimeType: string },
    type: MediaType,
    userId: string
  ): Promise<Result<Media>> {
    try {
      const { url, key } = await this.storageProvider.upload(file);

      const media = await this.mediaRepository.create({
        url,
        key,
        fileName: file.name,
        mimeType: file.mimeType,
        fileSize: file.buffer.length,
        type,
        provider: storageConfig.provider,
        userId,
      });

      return this.returnSuccess(media);
    } catch (e: any) {
      return this.returnFailure(`Storage upload failed: ${e.message}`, "STORAGE_UPLOAD_ERROR");
    }
  }

  async deleteFile(mediaId: string): Promise<Result<void>> {
    try {
      const media = await this.mediaRepository.findById(mediaId);
      if (!media) {
        return this.returnFailure("Media file not found", "MEDIA_NOT_FOUND");
      }

      await this.storageProvider.delete(media.key);
      await this.mediaRepository.softDelete(mediaId);

      return this.returnSuccess(undefined);
    } catch (e: any) {
      return this.returnFailure(`Storage deletion failed: ${e.message}`, "STORAGE_DELETE_ERROR");
    }
  }
}
