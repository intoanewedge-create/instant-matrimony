"use server";

import { auth } from "../auth";
import { conciergeService } from "../services/concierge.service";
import { revalidatePath } from "next/cache";

export async function updateConciergeStatusAction(caseId: string, status: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Admin authorization required" };
  }
  const adminUserId = (session.user as any).id;

  const res = await conciergeService.updateStatus(adminUserId, caseId, status);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath(`/admin/concierge/${caseId}`);
  revalidatePath(`/admin/concierge`);
  revalidatePath(`/concierge`);
  return { success: true, data: res.data };
}

export async function assignConciergeAdminAction(caseId: string, targetAdminId: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Admin authorization required" };
  }
  const adminUserId = (session.user as any).id;

  const res = await conciergeService.assignAdmin(adminUserId, caseId, targetAdminId);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath(`/admin/concierge/${caseId}`);
  revalidatePath(`/admin/concierge`);
  return { success: true, data: res.data };
}

export async function publishConciergeUpdateAction(caseId: string, content: string, isCustomerVisible: boolean) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Admin authorization required" };
  }
  const adminUserId = (session.user as any).id;

  if (!content || !content.trim()) {
    return { success: false, error: "Update content is required" };
  }

  const res = await conciergeService.publishUpdate(adminUserId, caseId, content.trim(), isCustomerVisible);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath(`/admin/concierge/${caseId}`);
  revalidatePath(`/concierge`);
  return { success: true, data: res.data };
}

export async function shortlistMatchAction(caseId: string, targetUserId: string, notes?: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Admin authorization required" };
  }
  const adminUserId = (session.user as any).id;

  const res = await conciergeService.shortlistMatch(adminUserId, caseId, targetUserId, notes);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath(`/admin/concierge/${caseId}`);
  revalidatePath(`/concierge`);
  return { success: true, data: res.data };
}

export async function updateShortlistStatusAction(shortlistId: string, status: string, familyResponse?: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Admin authorization required" };
  }
  const adminUserId = (session.user as any).id;

  const res = await conciergeService.updateShortlistStatus(adminUserId, shortlistId, status, familyResponse);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath(`/admin/concierge`);
  revalidatePath(`/concierge`);
  return { success: true, data: res.data };
}

export async function scheduleConciergeMeetingAction(
  caseId: string,
  title: string,
  scheduledAtString: string,
  location?: string,
  notes?: string
) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Admin authorization required" };
  }
  const adminUserId = (session.user as any).id;

  if (!title || !scheduledAtString) {
    return { success: false, error: "Title and scheduled time are required" };
  }

  const res = await conciergeService.scheduleMeeting(
    adminUserId,
    caseId,
    title,
    new Date(scheduledAtString),
    location,
    notes
  );

  if (!res.success) return { success: false, error: res.error };

  revalidatePath(`/admin/concierge/${caseId}`);
  revalidatePath(`/concierge`);
  return { success: true, data: res.data };
}

export async function logConciergeCallAction(caseId: string, person: string, duration: number, notes: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Admin authorization required" };
  }
  const adminUserId = (session.user as any).id;

  if (!person || !notes) {
    return { success: false, error: "Person contacted and notes are required" };
  }

  const res = await conciergeService.logCall(adminUserId, caseId, person, Number(duration || 0), notes);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath(`/admin/concierge/${caseId}`);
  return { success: true, data: res.data };
}

export async function addConciergeAttachmentAction(caseId: string, fileName: string, fileUrl: string, fileType?: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Admin authorization required" };
  }
  const adminUserId = (session.user as any).id;

  if (!fileName || !fileUrl) {
    return { success: false, error: "File name and URL are required" };
  }

  const res = await conciergeService.addAttachment(adminUserId, caseId, fileName, fileUrl, fileType);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath(`/admin/concierge/${caseId}`);
  revalidatePath(`/concierge`);
  return { success: true, data: res.data };
}
