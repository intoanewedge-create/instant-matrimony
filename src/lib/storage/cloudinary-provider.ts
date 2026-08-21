import crypto from "crypto";
import { StorageProvider } from "./storage-provider";
import { storageConfig } from "@/config/storage.config";

export class CloudinaryStorageProvider implements StorageProvider {
  async upload(file: { name: string; buffer: Buffer; mimeType: string }): Promise<{ url: string; key: string }> {
    let { cloudName, apiKey, apiSecret } = storageConfig.cloudinary;
    if (!cloudName && process.env.CLOUDINARY_URL && process.env.CLOUDINARY_URL.includes("@")) {
      cloudName = process.env.CLOUDINARY_URL.split("@")[1];
    }
    if (!apiKey) apiKey = process.env.CLOUDINARY_API_KEY || "";
    if (!apiSecret) apiSecret = process.env.CLOUDINARY_SECRET || process.env.CLOUDINARY_API_SECRET || "";

    if (!cloudName || !apiKey) {
      throw new Error("Cloudinary provider is not fully configured. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY.");
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimeType });
    formData.append("file", blob, file.name);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);

    if (apiSecret) {
      const strToSign = `timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(strToSign).digest("hex");
      formData.append("signature", signature);
    } else {
      formData.append("upload_preset", "instant_matrimony");
    }

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Cloudinary API returned error: ${errText}`);
      }

      const data = await res.json();
      return {
        url: data.secure_url || data.url,
        key: data.public_id,
      };
    } catch (e: any) {
      throw new Error(`Cloudinary upload failed: ${e.message}`);
    }
  }

  async delete(_key: string): Promise<void> {
    // In production, a secure server-side signature is generated to call Cloudinary's destroy API
  }
}
