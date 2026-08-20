"use server";

import { auth } from "../auth";
import { container } from "../container";
import { revalidatePath } from "next/cache";
import { eventDispatcher } from "../events/event-dispatcher";
import { MediaType, DocumentType } from "@prisma/client";
import { storageConfig } from "@/config/storage.config";
import { verifyActionPermission } from "./action-utils";
import { returnFailure } from "../result";
import { prisma } from "../prisma";

export async function uploadPhoto(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = session.user.id;

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  try {
    let profile = await container.repositories.profileRepository.findByUserId(userId);
    if (!profile) {
      profile = await container.repositories.profileRepository.create({
        userId,
        status: "DRAFT",
        completionPercent: 0,
      });
    }

    const existingPhotos = await container.repositories.photoRepository.findByProfileId(profile.id);
    if (existingPhotos.length >= storageConfig.maxPhotosPerProfile) {
      return {
        success: false,
        error: `Maximum limit of ${storageConfig.maxPhotosPerProfile} photos reached.`,
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let detectedMime = (file.type || "").toLowerCase();
    if (!detectedMime || detectedMime === "application/octet-stream") {
      const ext = file.name.toLowerCase().split(".").pop();
      if (ext === "jpg" || ext === "jpeg") detectedMime = "image/jpeg";
      else if (ext === "png") detectedMime = "image/png";
      else if (ext === "webp") detectedMime = "image/webp";
    }

    const validateRes = await container.services.imageService.validateImage(buffer, file.name, detectedMime || file.type);
    if (!validateRes.success) {
      return { success: false, error: validateRes.error };
    }

    const processRes = await container.services.imageService.processImage(buffer, file.name);
    if (!processRes.success || !processRes.data) {
      return { success: false, error: processRes.error };
    }

    const { processedBuffer, checksum, width, height, mimeType } = processRes.data;

    const duplicates = await container.repositories.imageMetadataRepository.findByChecksum(checksum);
    const activeDuplicate = duplicates.find(d => existingPhotos.some(p => p.id === d.photoId));
    if (activeDuplicate) {
      return { success: false, error: "This image is already in your photo gallery." };
    }

    const objectName = `profile-images/${profile.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
    const uploadRes = await container.services.storageService.uploadFile(
      { name: objectName, buffer: processedBuffer, mimeType },
      MediaType.PHOTO,
      userId
    );
    if (!uploadRes.success || !uploadRes.data) {
      return { success: false, error: uploadRes.error };
    }

    const media = uploadRes.data;

    let photo: any;
    try {
      const isMain = existingPhotos.length === 0;
      photo = await container.repositories.photoRepository.create({
        profileId: profile.id,
        mediaId: media.id,
        url: media.url,
        isMain,
        isApproved: false,
      });

      await container.repositories.imageMetadataRepository.create({
        photoId: photo.id,
        fileSize: media.fileSize,
        mimeType: media.mimeType,
        width,
        height,
        originalName: file.name,
        storageProvider: storageConfig.provider,
        checksum,
      });

      // Update profile completion percentage
      const fullProfile = await prisma.profile.findFirst({
        where: { id: profile.id },
        include: { photos: { where: { deletedAt: null } }, partnerPreference: true },
      });
      if (fullProfile) {
        const completionPercent = container.services.completionService.calculate(fullProfile);
        await prisma.profile.update({
          where: { id: profile.id },
          data: { completionPercent },
        });
      }
    } catch (dbErr: any) {
      // Rollback newly uploaded storage file to prevent orphaned storage objects
      try {
        await container.services.storageService.deleteFile(media.id);
      } catch (cleanupErr) {
        console.warn("Storage cleanup warning during rollback:", cleanupErr);
      }
      return { success: false, error: `Failed to save photo record: ${dbErr.message}` };
    }

    try {
      await eventDispatcher.publish("PhotoUploaded", {
        photoId: photo.id,
        userId,
        profileId: profile.id,
      });
    } catch (eventErr) {
      console.warn("Event dispatch warning for PhotoUploaded:", eventErr);
    }

    revalidatePath("/onboarding");
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/verification");
    revalidatePath("/matches");
    return {
      success: true,
      photoId: photo.id,
      photo: {
        id: photo.id,
        url: photo.url,
        isMain: photo.isMain,
      },
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function replacePhoto(photoId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = session.user.id;

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  try {
    const photo = await container.repositories.photoRepository.findById(photoId);
    if (!photo) {
      return { success: false, error: "Photo not found" };
    }

    const profile = await container.repositories.profileRepository.findByUserId(userId);
    if (!profile || photo.profileId !== profile.id) {
      return { success: false, error: "Unauthorized photo replacement" };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let detectedMime = (file.type || "").toLowerCase();
    if (!detectedMime || detectedMime === "application/octet-stream") {
      const ext = file.name.toLowerCase().split(".").pop();
      if (ext === "jpg" || ext === "jpeg") detectedMime = "image/jpeg";
      else if (ext === "png") detectedMime = "image/png";
      else if (ext === "webp") detectedMime = "image/webp";
    }

    const validateRes = await container.services.imageService.validateImage(buffer, file.name, detectedMime || file.type);
    if (!validateRes.success) {
      return { success: false, error: validateRes.error };
    }

    const processRes = await container.services.imageService.processImage(buffer, file.name);
    if (!processRes.success || !processRes.data) {
      return { success: false, error: processRes.error };
    }

    const { processedBuffer, checksum, width, height, mimeType } = processRes.data;

    const oldMediaId = photo.mediaId;
    const objectName = `profile-images/${profile.id}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;

    const uploadRes = await container.services.storageService.uploadFile(
      { name: objectName, buffer: processedBuffer, mimeType },
      MediaType.PHOTO,
      userId
    );
    if (!uploadRes.success || !uploadRes.data) {
      return { success: false, error: uploadRes.error };
    }

    const media = uploadRes.data;

    try {
      await container.repositories.photoRepository.update(photoId, {
        mediaId: media.id,
        url: media.url,
        isApproved: false,
      });

      const existingMeta = await container.repositories.imageMetadataRepository.findByPhotoId(photoId);
      if (existingMeta) {
        await container.repositories.imageMetadataRepository.update(existingMeta.id, {
          fileSize: media.fileSize,
          mimeType: media.mimeType,
          width,
          height,
          originalName: file.name,
          checksum,
        });
      } else {
        await container.repositories.imageMetadataRepository.create({
          photoId,
          fileSize: media.fileSize,
          mimeType: media.mimeType,
          width,
          height,
          originalName: file.name,
          storageProvider: storageConfig.provider,
          checksum,
        });
      }

      // Safe cleanup of old storage object after successful replacement
      if (oldMediaId) {
        try {
          await container.services.storageService.deleteFile(oldMediaId);
        } catch (delErr) {
          console.warn("Old media deletion warning:", delErr);
        }
      }
    } catch (dbErr: any) {
      // Rollback newly uploaded replacement file
      try {
        await container.services.storageService.deleteFile(media.id);
      } catch (rollbackErr) {
        console.warn("Storage cleanup rollback warning:", rollbackErr);
      }
      return { success: false, error: `Failed to update photo record: ${dbErr.message}` };
    }

    revalidatePath("/onboarding");
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/verification");
    revalidatePath("/matches");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deletePhoto(photoId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = session.user.id;

  try {
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: { profile: true },
    });
    if (!photo) {
      return { success: false, error: "Photo not found" };
    }

    const isAdmin = (session.user as any).role === "ADMIN";
    if (photo.profile.userId !== userId && !isAdmin) {
      return { success: false, error: "Unauthorized photo deletion" };
    }

    if (photo.mediaId) {
      try {
        await container.services.storageService.deleteFile(photo.mediaId);
      } catch (err) {
        console.warn("Storage deletion warning (safe fallback):", err);
      }
    }

    // Soft delete photo record and reset isMain
    await prisma.photo.update({
      where: { id: photoId },
      data: {
        deletedAt: new Date(),
        isMain: false,
      },
    });

    // If deleting the main photo, automatically promote the next active photo to main
    if (photo.isMain) {
      const nextActivePhoto = await prisma.photo.findFirst({
        where: {
          profileId: photo.profileId,
          deletedAt: null,
          id: { not: photoId },
        },
        orderBy: { createdAt: "asc" },
      });
      if (nextActivePhoto) {
        await prisma.photo.update({
          where: { id: nextActivePhoto.id },
          data: { isMain: true },
        });
      }
    }

    // Update completion percent
    const fullProfile = await prisma.profile.findFirst({
      where: { id: photo.profileId },
      include: { photos: { where: { deletedAt: null } }, partnerPreference: true },
    });
    if (fullProfile) {
      const completionPercent = container.services.completionService.calculate(fullProfile);
      await prisma.profile.update({
        where: { id: photo.profileId },
        data: { completionPercent },
      });
    }

    try {
      await eventDispatcher.publish("PhotoDeleted", {
        photoId,
        userId,
        profileId: photo.profileId,
      });
    } catch (eventErr) {
      console.warn("Event dispatch warning for PhotoDeleted:", eventErr);
    }

    revalidatePath("/onboarding");
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/verification");
    revalidatePath("/matches");
    return { success: true };
  } catch (e: any) {
    console.error("deletePhoto error:", e);
    return { success: false, error: e.message || "Failed to delete photo" };
  }
}

export async function setPrimaryPhoto(photoId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = session.user.id;

  try {
    const photo = await container.repositories.photoRepository.findById(photoId);
    if (!photo) {
      return { success: false, error: "Photo not found" };
    }

    const profile = await container.repositories.profileRepository.findByUserId(userId);
    if (!profile || photo.profileId !== profile.id) {
      return { success: false, error: "Unauthorized" };
    }

    await container.repositories.photoRepository.clearPrimary(profile.id);

    await container.repositories.photoRepository.update(photoId, {
      isMain: true,
    });

    await eventDispatcher.publish("PrimaryPhotoChanged", {
      photoId,
      userId,
      profileId: profile.id,
    });

    revalidatePath("/onboarding");
    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/verification");
    revalidatePath("/matches");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function uploadVerificationDocument(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = session.user.id;

  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadRes = await container.services.storageService.uploadFile(
      { name: `${Date.now()}-${file.name}`, buffer, mimeType: file.type },
      MediaType.DOCUMENT,
      userId
    );
    if (!uploadRes.success || !uploadRes.data) {
      return { success: false, error: uploadRes.error };
    }

    return { success: true, mediaId: uploadRes.data.id, url: uploadRes.data.url };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function submitVerification(data: {
  documentType: string;
  documentMediaId: string;
  selfieMediaId: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = session.user.id;

  try {
    const res = await container.services.verificationService.submitVerification(userId, {
      documentType: data.documentType as DocumentType,
      documentMediaId: data.documentMediaId,
      selfieMediaId: data.selfieMediaId,
    });

    if (!res.success) {
      return { success: false, error: res.error };
    }

    revalidatePath("/dashboard/verification");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function approveVerification(id: string) {
  const permCheck = await verifyActionPermission("MANAGE_VERIFICATION");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const moderatorId = permCheck.data!.userId;

  try {
    const res = await container.services.moderationService.approveVerification(id, moderatorId);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    revalidatePath("/dashboard/verification");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function rejectVerification(id: string, reason: string) {
  const permCheck = await verifyActionPermission("MANAGE_VERIFICATION");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const moderatorId = permCheck.data!.userId;

  try {
    const res = await container.services.moderationService.rejectVerification(id, moderatorId, reason);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    revalidatePath("/dashboard/verification");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function requestReUploadVerification(id: string, reason: string) {
  const permCheck = await verifyActionPermission("MANAGE_VERIFICATION");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const moderatorId = permCheck.data!.userId;

  try {
    const res = await container.services.moderationService.requestReUploadVerification(id, moderatorId, reason);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    revalidatePath("/dashboard/verification");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function approvePhoto(photoId: string) {
  const permCheck = await verifyActionPermission("MANAGE_MODERATION");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const moderatorId = permCheck.data!.userId;

  try {
    const res = await container.services.moderationService.approvePhoto(photoId, moderatorId);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    revalidatePath("/dashboard/verification");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function rejectPhoto(photoId: string, reason: string) {
  const permCheck = await verifyActionPermission("MANAGE_MODERATION");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const moderatorId = permCheck.data!.userId;

  try {
    const res = await container.services.moderationService.rejectPhoto(photoId, moderatorId, reason);
    if (!res.success) {
      return { success: false, error: res.error };
    }

    revalidatePath("/dashboard/verification");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
