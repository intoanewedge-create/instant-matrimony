import { StorageProvider } from "./storage-provider";
import path from "path";

export class SupabaseStorageProvider implements StorageProvider {
  private supabaseUrl: string;
  private serviceKey: string;
  private bucket: string;

  constructor() {
    this.supabaseUrl = (
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "https://pjpvgmwujuikxbwjbuii.supabase.co"
    ).replace(/\/$/, "");
    this.serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "";
    this.bucket = process.env.SUPABASE_STORAGE_BUCKET || "photos";
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      const getRes = await fetch(
        `${this.supabaseUrl}/storage/v1/bucket/${this.bucket}`,
        {
          headers: {
            Authorization: `Bearer ${this.serviceKey}`,
            apikey: this.serviceKey,
          },
        }
      );
      if (!getRes.ok && getRes.status === 404) {
        // Create bucket with public access
        await fetch(`${this.supabaseUrl}/storage/v1/bucket`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.serviceKey}`,
            apikey: this.serviceKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: this.bucket,
            name: this.bucket,
            public: true,
            file_size_limit: 10485760, // 10MB
            allowed_mime_types: ["image/jpeg", "image/png", "image/webp"],
          }),
        });
      }
    } catch {
      // Ignore bucket check error and proceed
    }
  }

  async upload(file: {
    name: string;
    buffer: Buffer;
    mimeType: string;
  }): Promise<{ url: string; key: string }> {
    const ext = path.extname(file.name) || ".webp";
    const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "");
    const filename = `${Date.now()}-${cleanBase || "photo"}${ext}`;
    const key = `profile/${filename}`;

    try {
      await this.ensureBucketExists();

      const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${key}`;
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.serviceKey}`,
          apikey: this.serviceKey,
          "Content-Type": file.mimeType || "image/webp",
          "x-upsert": "true",
        },
        body: new Uint8Array(file.buffer),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`Supabase Storage REST upload response (${res.status}):`, errorText);
        
        // Fallback to Public URL format if upload completed with status 200/201 or handle error
        if (res.status !== 200 && res.status !== 201) {
          // If Supabase upload fails, generate data URI fallback so user experience doesn't break
          const mime = file.mimeType || "image/webp";
          const base64Data = file.buffer.toString("base64");
          return {
            url: `data:${mime};base64,${base64Data}`,
            key,
          };
        }
      }

      const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/${this.bucket}/${key}`;
      return { url: publicUrl, key };
    } catch (err: any) {
      console.warn("Supabase Storage upload error, using fallback Data URI:", err?.message);
      const mime = file.mimeType || "image/webp";
      const base64Data = file.buffer.toString("base64");
      return {
        url: `data:${mime};base64,${base64Data}`,
        key,
      };
    }
  }

  async delete(key: string): Promise<void> {
    if (!key || key.startsWith("data:")) return;

    try {
      const deleteUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${key}`;
      await fetch(deleteUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.serviceKey}`,
          apikey: this.serviceKey,
        },
      });
    } catch (err) {
      console.warn("Supabase Storage deletion warning:", err);
    }
  }
}
