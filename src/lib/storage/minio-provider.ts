import { StorageProvider } from "./storage-provider";
import { storageConfig } from "@/config/storage.config";

export class MinioStorageProvider implements StorageProvider {
  async upload(file: { name: string; buffer: Buffer; mimeType: string }): Promise<{ url: string; key: string }> {
    const { bucket, endpoint } = storageConfig.minio;
    if (!bucket) {
      throw new Error("MinIO is not configured. Set MINIO_BUCKET_NAME.");
    }
    
    const key = `uploads/${Date.now()}-${file.name}`;
    const url = `${endpoint}/${bucket}/${key}`;
    
    return { url, key };
  }

  async delete(key: string): Promise<void> {
    // MinIO delete simulation
  }
}
