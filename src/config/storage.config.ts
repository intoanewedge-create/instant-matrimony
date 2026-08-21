import { env } from "./env";

export const storageConfig = {
  provider: env.STORAGE_PROVIDER,
  maxPhotosPerProfile: 6,
  local: {
    uploadDir: "public/uploads",
    baseUrl: "/uploads",
  },
  cloudinary: {
    cloudName:
      process.env.CLOUDINARY_CLOUD_NAME ||
      (process.env.CLOUDINARY_URL && process.env.CLOUDINARY_URL.includes("@")
        ? process.env.CLOUDINARY_URL.split("@")[1]
        : ""),
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET || "",
  },
  s3: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    region: process.env.AWS_REGION || "us-east-1",
    bucket: process.env.AWS_BUCKET_NAME || "",
    endpoint: process.env.AWS_ENDPOINT || undefined,
  },
  r2: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    bucket: process.env.R2_BUCKET_NAME || "",
    endpoint: process.env.R2_ENDPOINT || "", // e.g. https://<account_id>.r2.cloudflarestorage.com
  },
  minio: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "",
    bucket: process.env.MINIO_BUCKET_NAME || "",
    endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
  },
};
