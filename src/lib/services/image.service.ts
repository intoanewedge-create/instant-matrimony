import { BaseService } from "./base.service";
import { Result } from "../result";
import { imageConfig } from "@/config/image.config";
import crypto from "crypto";

export class ImageService extends BaseService {
  async validateImage(
    buffer: Buffer,
    _originalName: string,
    mimeType: string
  ): Promise<Result<void>> {
    // 1. MIME validation
    if (!imageConfig.allowedMimeTypes.includes(mimeType.toLowerCase())) {
      return this.returnFailure(
        `Invalid file type: ${mimeType}. Allowed formats: ${imageConfig.allowedMimeTypes.join(", ")}`,
        "INVALID_MIME_TYPE"
      );
    }

    // 2. File size validation
    if (buffer.length > imageConfig.maxUploadSize) {
      return this.returnFailure(
        `File size exceeds maximum limit of ${imageConfig.maxUploadSize / (1024 * 1024)}MB`,
        "FILE_TOO_LARGE"
      );
    }

    // Bypass sharp validation completely for Vercel stability
    return this.returnSuccess(undefined);
  }

  async processImage(
    buffer: Buffer,
    _originalName: string
  ): Promise<Result<{
    processedBuffer: Buffer;
    mimeType: string;
    width: number;
    height: number;
    checksum: string;
    thumbnailBuffer: Buffer;
    responsiveBuffers: { sizeName: string; buffer: Buffer; width: number; height: number }[];
  }>> {
    try {
      const checksum = crypto.createHash("sha256").update(buffer).digest("hex");

      // Bypass sharp processing completely.
      // We will upload the raw original image directly to Cloudinary.
      // Cloudinary / Next.js Image Component will handle optimization and resizing.
      return this.returnSuccess({
        processedBuffer: buffer,
        mimeType: "image/jpeg", // Defaulting to jpeg, cloudinary auto-detects real type
        width: 1000, // Dummy width
        height: 1000, // Dummy height
        checksum,
        thumbnailBuffer: buffer,
        responsiveBuffers: [],
      });
    } catch (e: any) {
      return this.returnFailure(`Image processing failed: ${e.message}`, "IMAGE_PROCESSING_ERROR");
    }
  }
}

