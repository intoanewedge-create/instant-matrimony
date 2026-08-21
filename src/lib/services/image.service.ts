import { BaseService } from "./base.service";
import { Result } from "../result";
import { imageConfig } from "@/config/image.config";
import crypto from "crypto";

// Lazy-load sharp to avoid crashing serverless environments (Vercel)
// where the native libvips binary is not available at module load time.
let _sharp: typeof import("sharp") | null = null;
async function getSharp() {
  if (!_sharp) {
    const sharpModule = await import("sharp");
    _sharp = (sharpModule.default || sharpModule) as any;
  }
  return _sharp as unknown as typeof import("sharp").default;
}

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

    // 3. Dimension validation
    try {
      const sharp = await getSharp();
      const metadata = await sharp(buffer).metadata();
      if (!metadata.width || !metadata.height) {
        return this.returnFailure("Invalid image dimensions", "INVALID_DIMENSIONS");
      }
      if (metadata.width < 100 || metadata.height < 100) {
        return this.returnFailure("Image must be at least 100x100 pixels", "IMAGE_TOO_SMALL");
      }
    } catch (e: any) {
      console.error("Failed to read image metadata:", e);
      return this.returnFailure("Failed to read image metadata", "INVALID_IMAGE_FILE");
    }

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
      const sharp = await getSharp();
      const checksum = crypto.createHash("sha256").update(buffer).digest("hex");

      // 1. Convert to WebP, rotate automatically, and strip EXIF
      const pipeline = sharp(buffer)
        .rotate()
        .webp({ quality: imageConfig.compressionQuality });

      const processedBuffer = await pipeline.toBuffer();
      const metadata = await sharp(processedBuffer).metadata();

      const width = metadata.width || 0;
      const height = metadata.height || 0;

      // 2. Generate Thumbnail
      const thumbWidth = imageConfig.sizes.thumbnail.width;
      const thumbHeight = imageConfig.sizes.thumbnail.height;
      const thumbnailBuffer = await sharp(processedBuffer)
        .resize(thumbWidth, thumbHeight, { fit: "cover" })
        .toBuffer();

      // 3. Generate Responsive Sizes
      const responsiveBuffers: { sizeName: string; buffer: Buffer; width: number; height: number }[] = [];
      
      const mediumWidth = imageConfig.sizes.medium.width;
      const mediumHeight = imageConfig.sizes.medium.height;
      const mediumBuffer = await sharp(processedBuffer)
        .resize(mediumWidth, mediumHeight, { fit: "inside", withoutEnlargement: true })
        .toBuffer();
      const mediumMeta = await sharp(mediumBuffer).metadata();
      responsiveBuffers.push({
        sizeName: "medium",
        buffer: mediumBuffer,
        width: mediumMeta.width || mediumWidth,
        height: mediumMeta.height || mediumHeight,
      });

      const largeWidth = imageConfig.sizes.large.width;
      const largeHeight = imageConfig.sizes.large.height;
      const largeBuffer = await sharp(processedBuffer)
        .resize(largeWidth, largeHeight, { fit: "inside", withoutEnlargement: true })
        .toBuffer();
      const largeMeta = await sharp(largeBuffer).metadata();
      responsiveBuffers.push({
        sizeName: "large",
        buffer: largeBuffer,
        width: largeMeta.width || largeWidth,
        height: largeMeta.height || largeHeight,
      });

      return this.returnSuccess({
        processedBuffer,
        mimeType: "image/webp",
        width,
        height,
        checksum,
        thumbnailBuffer,
        responsiveBuffers,
      });
    } catch (e: any) {
      return this.returnFailure(`Image processing failed: ${e.message}`, "IMAGE_PROCESSING_ERROR");
    }
  }
}

