import { StorageProvider } from "./storage-provider";
import { storageConfig } from "@/config/storage.config";

export class S3StorageProvider implements StorageProvider {
  async upload(file: { name: string; buffer: Buffer; mimeType: string }): Promise<{ url: string; key: string }> {
    const { bucket, region, endpoint } = storageConfig.s3;
    if (!bucket) {
      throw new Error("S3 bucket name is not configured. Set AWS_BUCKET_NAME.");
    }
    
    const key = `uploads/${Date.now()}-${file.name}`;
    const host = endpoint || `https://${bucket}.s3.${region}.amazonaws.com`;
    const url = `${host}/${key}`;
    
    return { url, key };
  }

  async delete(key: string): Promise<void> {
    // S3 delete simulation
  }
}
