import { StorageProvider } from "./storage-provider";
import fs from "fs/promises";
import path from "path";
import { storageConfig } from "@/config/storage.config";

export class LocalStorageProvider implements StorageProvider {
  private uploadDir = path.join(process.cwd(), storageConfig.local.uploadDir);

  async upload(file: { name: string; buffer: Buffer; mimeType: string }): Promise<{ url: string; key: string }> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    
    const ext = path.extname(file.name) || ".webp";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`;
    const filePath = path.join(this.uploadDir, filename);
    
    await fs.writeFile(filePath, file.buffer);
    
    const key = `uploads/${filename}`;
    const url = `${storageConfig.local.baseUrl}/${filename}`;
    
    return { url, key };
  }

  async delete(key: string): Promise<void> {
    const filename = path.basename(key);
    const filePath = path.join(this.uploadDir, filename);
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore if not found
    }
  }
}
