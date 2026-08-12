"use server";

import { auth } from "../auth";
import { container } from "../container";
import { revalidatePath } from "next/cache";
import { eventDispatcher } from "../events/event-dispatcher";
import { MediaType, DocumentType } from "@prisma/client";
import { storageConfig } from "@/config/storage.config";
import { verifyActionPermission } from "./action-utils";
import { returnFailure } from "../result";

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
    const profile = await container.repositories.profileRepository.findByUserId(userId);
    if (!profile) {
      return { success: false, error: "Profile not found" };
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

    const validateRes = await container.services.imageService.validateImage(buffer, file.name, file.type);
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

    const uploadRes = await container.services.storageService.uploadFile(
      { name: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}.webp`, buffer: processedBuffer, mimeType },
      MediaType.PHOTO,
      userId
    );
    if (!uploadRes.success || !uploadRes.data) {
      return { success: false, error: uploadRes.error };
    }

    const media = uploadRes.data;

    const isMain = existingPhotos.length === 0;
    const photo = await container.repositories.photoRepository.create({
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

    await eventDispatcher.publish("PhotoUploaded", {
      photoId: photo.id,
      userId,
      profileId: profile.id,
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/verification");
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

    const validateRes = await container.services.imageService.validateImage(buffer, file.name, file.type);
    if (!validateRes.success) {
      return { success: false, error: validateRes.error };
    }

    const processRes = await container.services.imageService.processImage(buffer, file.name);
    if (!processRes.success || !processRes.data) {
      return { success: false, error: processRes.error };
    }

    const { processedBuffer, checksum, width, height, mimeType } = processRes.data;

    if (photo.mediaId) {
      await container.services.storageService.deleteFile(photo.mediaId);
    }

    const uploadRes = await container.services.storageService.uploadFile(
      { name: `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}.webp`, buffer: processedBuffer, mimeType },
      MediaType.PHOTO,
      userId
    );
    if (!uploadRes.success || !uploadRes.data) {
      return { success: false, error: uploadRes.error };
    }

    const media = uploadRes.data;

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

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/verification");
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
    const photo = await container.repositories.photoRepository.findById(photoId);
    if (!photo) {
      return { success: false, error: "Photo not found" };
    }

    const profile = await container.repositories.profileRepository.findByUserId(userId);
    if (!profile || photo.profileId !== profile.id) {
      return { success: false, error: "Unauthorized photo deletion" };
    }

    if (photo.mediaId) {
      await container.services.storageService.deleteFile(photo.mediaId);
    }

    await container.repositories.photoRepository.softDelete(photoId);

    await eventDispatcher.publish("PhotoDeleted", {
      photoId,
      userId,
      profileId: profile.id,
    });

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/verification");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
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

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/verification");
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
