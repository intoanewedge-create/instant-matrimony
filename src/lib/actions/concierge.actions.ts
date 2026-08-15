"use server";

import { conciergeService } from "../services/concierge.service";
import { revalidatePath } from "next/cache";
import { verifyActionPermission } from "./action-utils";
import { returnFailure } from "../result";
import { auth } from "@/lib/auth";

export async function updateConciergeStatusAction(caseId: string, status: string) {
  const permCheck = await verifyActionPermission("MANAGE_CONCIERGE");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const adminUserId = permCheck.data!.userId;

  const res = await conciergeService.updateStatus(adminUserId, caseId, status);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath(`/admin/concierge/${caseId}`);
  revalidatePath(`/admin/concierge`);
  revalidatePath(`/concierge`);
  return { success: true, data: res.data };
}

export async function assignConciergeAdminAction(caseId: string, targetAdminId: string) {
  const permCheck = await verifyActionPermission("MANAGE_CONCIERGE");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const adminUserId = permCheck.data!.userId;

  const res = await conciergeService.assignAdmin(adminUserId, caseId, targetAdminId);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath(`/admin/concierge/${caseId}`);
  revalidatePath(`/admin/concierge`);
  return { success: true, data: res.data };
}

export async function publishConciergeUpdateAction(caseId: string, content: string, isCustomerVisible: boolean) {
  const permCheck = await verifyActionPermission("MANAGE_CONCIERGE");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const adminUserId = permCheck.data!.userId;

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
  const permCheck = await verifyActionPermission("MANAGE_CONCIERGE");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const adminUserId = permCheck.data!.userId;

  const res = await conciergeService.shortlistMatch(adminUserId, caseId, targetUserId, notes);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath(`/admin/concierge/${caseId}`);
  revalidatePath(`/concierge`);
  return { success: true, data: res.data };
}

export async function updateShortlistStatusAction(shortlistId: string, status: string, familyResponse?: string) {
  const permCheck = await verifyActionPermission("MANAGE_CONCIERGE");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const adminUserId = permCheck.data!.userId;

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
  const permCheck = await verifyActionPermission("MANAGE_CONCIERGE");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const adminUserId = permCheck.data!.userId;

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
  const permCheck = await verifyActionPermission("MANAGE_CONCIERGE");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const adminUserId = permCheck.data!.userId;

  if (!person || !notes) {
    return { success: false, error: "Person contacted and notes are required" };
  }

  const res = await conciergeService.logCall(adminUserId, caseId, person, Number(duration || 0), notes);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath(`/admin/concierge/${caseId}`);
  return { success: true, data: res.data };
}

export async function addConciergeAttachmentAction(caseId: string, fileName: string, fileUrl: string, fileType?: string) {
  const permCheck = await verifyActionPermission("MANAGE_CONCIERGE");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const adminUserId = permCheck.data!.userId;

  if (!fileName || !fileUrl) {
    return { success: false, error: "File name and URL are required" };
  }

  const res = await conciergeService.addAttachment(adminUserId, caseId, fileName, fileUrl, fileType);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath(`/admin/concierge/${caseId}`);
  revalidatePath(`/concierge`);
  return { success: true, data: res.data };
}

export async function addCustomerConciergeNoteAction(caseId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = session.user.id;

  if (!content || !content.trim()) {
    return { success: false, error: "Note content cannot be empty" };
  }

  const res = await conciergeService.addCustomerNote(userId, caseId, content.trim());
  if (!res.success) return { success: false, error: res.error };

  revalidatePath(`/dashboard/concierge`);
  revalidatePath(`/admin/concierge/${caseId}`);
  return { success: true, data: res.data };
}
