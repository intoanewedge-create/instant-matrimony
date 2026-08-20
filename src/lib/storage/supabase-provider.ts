import { StorageProvider } from "./storage-provider";
import { storageConfig } from "@/config/storage.config";

export class SupabaseStorageProvider implements StorageProvider {
  private get credentials() {
    const { url, serviceRoleKey, bucket } = storageConfig.supabase;
    if (!url || !serviceRoleKey) {
      throw new Error(
        "Supabase Storage is not configured. Please set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY."
      );
    }
    const cleanUrl = url.replace(/\/$/, "");
    return { cleanUrl, serviceRoleKey, bucket: bucket || "profile-images" };
  }

  private async ensureBucketExists(cleanUrl: string, serviceRoleKey: string, bucket: string): Promise<void> {
    try {
      const getRes = await fetch(`${cleanUrl}/storage/v1/bucket/${bucket}`, {
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        },
      });

      if (getRes.status === 404) {
        // Create the bucket
        await fetch(`${cleanUrl}/storage/v1/bucket`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceRoleKey}`,
            apikey: serviceRoleKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: bucket,
            name: bucket,
            public: true,
            file_size_limit: 5242880, // 5MB
            allowed_mime_types: ["image/jpeg", "image/png", "image/webp"],
          }),
        });
      }
    } catch {
      // Ignore failure to ensure bucket; upload will attempt directly
    }
  }

  async upload(file: { name: string; buffer: Buffer; mimeType: string }): Promise<{ url: string; key: string }> {
    const { cleanUrl, serviceRoleKey, bucket } = this.credentials;

    await this.ensureBucketExists(cleanUrl, serviceRoleKey, bucket);

    // Clean key formatting
    const rawKey = file.name.startsWith(`${bucket}/`) ? file.name.replace(`${bucket}/`, "") : file.name;
    const key = rawKey.replace(/^\/+/, "");
    const uploadPath = `${cleanUrl}/storage/v1/object/${bucket}/${key}`;

    const res = await fetch(uploadPath, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": file.mimeType || "image/webp",
        "x-upsert": "true",
      },
      body: new Uint8Array(file.buffer),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Supabase Storage upload failed (${res.status}): ${errText}`);
    }

    const publicUrl = `${cleanUrl}/storage/v1/object/public/${bucket}/${key}`;
    const fullStorageKey = `${bucket}/${key}`;

    return {
      url: publicUrl,
      key: fullStorageKey,
    };
  }

  async delete(key: string): Promise<void> {
    try {
      const { cleanUrl, serviceRoleKey, bucket } = this.credentials;
      let pathInBucket = key;
      if (key.startsWith(`${bucket}/`)) {
        pathInBucket = key.substring(bucket.length + 1);
      } else if (key.startsWith("http")) {
        // Extract key from URL
        const parts = key.split(`/storage/v1/object/public/${bucket}/`);
        if (parts.length > 1) {
          pathInBucket = parts[1];
        }
      }

      await fetch(`${cleanUrl}/storage/v1/object/${bucket}/${pathInBucket}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        },
      });
    } catch (err) {
      console.warn("Supabase Storage deletion warning:", err);
    }
  }
}
