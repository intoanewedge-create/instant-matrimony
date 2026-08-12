import { StorageProvider } from "./storage-provider";
import fs from "fs/promises";
import path from "path";
import { storageConfig } from "@/config/storage.config";

export class LocalStorageProvider implements StorageProvider {
  private uploadDir = path.join(process.cwd(), storageConfig.local.uploadDir);

  async upload(file: { name: string; buffer: Buffer; mimeType: string }): Promise<{ url: string; key: string }> {
    const ext = path.extname(file.name) || ".webp";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`;
    const key = `uploads/${filename}`;

    // On Vercel / serverless environments, local filesystem is read-only or ephemeral.
    // If VERCEL env is present or if writing to disk fails, provide a resilient base64 Data URL.
    if (process.env.VERCEL === "1") {
      const mime = file.mimeType || "image/webp";
      const base64Data = file.buffer.toString("base64");
      const url = `data:${mime};base64,${base64Data}`;
      return { url, key };
    }

    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      const filePath = path.join(this.uploadDir, filename);
      await fs.writeFile(filePath, file.buffer);
      const url = `${storageConfig.local.baseUrl}/${filename}`;
      return { url, key };
    } catch (err: any) {
      // Resilient fallback for serverless / read-only filesystem environments
      const mime = file.mimeType || "image/webp";
      const base64Data = file.buffer.toString("base64");
      const url = `data:${mime};base64,${base64Data}`;
      return { url, key };
    }
  }

  async delete(key: string): Promise<void> {
    if (process.env.VERCEL === "1" || key.startsWith("data:")) {
      return;
    }
    const filename = path.basename(key);
    const filePath = path.join(this.uploadDir, filename);
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore if not found or read-only
    }
  }
}
