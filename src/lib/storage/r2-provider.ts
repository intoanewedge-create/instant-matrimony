import { StorageProvider } from "./storage-provider";
import { storageConfig } from "@/config/storage.config";

export class R2StorageProvider implements StorageProvider {
  async upload(file: { name: string; buffer: Buffer; mimeType: string }): Promise<{ url: string; key: string }> {
    const { bucket, endpoint } = storageConfig.r2;
    if (!bucket || !endpoint) {
      throw new Error("R2 is not configured. Set R2_BUCKET_NAME and R2_ENDPOINT.");
    }
    
    const key = `uploads/${Date.now()}-${file.name}`;
    const url = `${endpoint}/${bucket}/${key}`;
    
    return { url, key };
  }

  async delete(_key: string): Promise<void> {
    // Cloudflare R2 delete simulation
  }
}
