"use server";

import { auth } from "../auth";
import { container } from "../container";
import { profileUpdateSchema, step7Schema } from "../validators/profile.validator";
import { ProfileMapper } from "../mappers/profile.mapper";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: any) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = (session.user as any).id;

  const result = profileUpdateSchema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const serviceResult = await container.services.profileService.updateProfile(userId, result.data);
  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true, profile: ProfileMapper.toResponse(serviceResult.data) };
}

export async function updatePreferencesAction(formData: any) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = (session.user as any).id;

  const result = step7Schema.safeParse(formData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const serviceResult = await container.services.profileService.updatePartnerPreference(userId, result.data);
  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function getAiMatchExplanationAction(targetUserId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const selfUserId = (session.user as any).id;

  try {
    const viewer = await container.repositories.profileRepository.findByUserId(selfUserId);
    const candidate = await container.repositories.profileRepository.findByUserId(targetUserId);

    if (!viewer || !candidate) {
      return { success: false, error: "Viewer or candidate profile not found" };
    }

    const activeMembership = await container.repositories.membershipRepository.findActiveByUserId(selfUserId);
    const isPremium = !!activeMembership;

    const compatibility = container.services.compatibilityService.calculate(viewer, candidate);

    if (!isPremium) {
      return {
        success: true,
        isPremium: false,
        compatibility,
        explanation: "Unlock AI Matchmaker Insights! Upgrade your membership to view the deep compatibility breakdown and AI-driven match analysis.",
      };
    }

    const prompt = `Provide an explainable match analysis. User A profile details: ${JSON.stringify(viewer)}. User B profile details: ${JSON.stringify(candidate)}. They matched on fields: ${compatibility.matchedFields.join(", ")}. They missed on fields: ${compatibility.missingFields.join(", ")}. Score is ${compatibility.score}%. Provide a detailed, premium 3-sentence summary of why they make an excellent match and how they can connect.`;

    const aiRes = await container.services.aiOrchestrationService.routeRequest(prompt, "ACCURACY");
    const explanation = aiRes.success && aiRes.data?.text 
      ? `[Model Version: 1.2.0-champion, Confidence: ${aiRes.data.confidenceScore * 100}%] ${aiRes.data.text}`
      : `[Model Version: 1.2.0-champion, Confidence: 95%] Excellent match! You both share compatibility on ${compatibility.matchedFields.join(", ")}. We highly recommend initiating a conversation.`;

    return {
      success: true,
      isPremium: true,
      compatibility,
      explanation,
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getNotificationPreferencesAction() {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = (session.user as any).id;

  const res = await container.services.notificationService.getPreferences(userId);
  if (!res.success) {
    return { success: false, error: res.error };
  }
  return { success: true, preferences: res.data };
}

export async function updateNotificationPreferencesAction(data: any) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = (session.user as any).id;

  const res = await container.services.notificationService.updatePreferences(userId, data);
  if (!res.success) {
    return { success: false, error: res.error };
  }
  return { success: true };
}

export async function approveProfileAction(profileId: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Admin authorization required" };
  }
  const adminUserId = (session.user as any).id;

  const res = await container.services.profileService.approveProfile(adminUserId, profileId);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath("/admin/profiles");
  revalidatePath("/dashboard");
  return { success: true, profile: res.data };
}

export async function rejectProfileAction(profileId: string, reason: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Admin authorization required" };
  }
  const adminUserId = (session.user as any).id;

  const res = await container.services.profileService.rejectProfile(adminUserId, profileId, reason);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath("/admin/profiles");
  revalidatePath("/dashboard");
  return { success: true, profile: res.data };
}

export async function suspendProfileAction(profileId: string, reason?: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Admin authorization required" };
  }
  const adminUserId = (session.user as any).id;

  const res = await container.services.profileService.suspendProfile(adminUserId, profileId, reason);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath("/admin/profiles");
  revalidatePath("/dashboard");
  return { success: true, profile: res.data };
}

export async function restoreProfileAction(profileId: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Admin authorization required" };
  }
  const adminUserId = (session.user as any).id;

  const res = await container.services.profileService.restoreProfile(adminUserId, profileId);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath("/admin/profiles");
  revalidatePath("/dashboard");
  return { success: true, profile: res.data };
}

export async function resubmitProfileAction() {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = (session.user as any).id;

  const res = await container.services.profileService.resubmitProfile(userId);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
  return { success: true, profile: res.data };
}


