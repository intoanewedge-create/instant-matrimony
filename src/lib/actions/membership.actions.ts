"use server";

import { auth } from "../auth";
import { container } from "../container";
import { revalidatePath } from "next/cache";
import { verifyActionPermission } from "./action-utils";
import { returnFailure } from "../result";

export async function submitManualPaymentAction(data: {
  planId: string;
  paymentMethod?: string;
  utrNumber?: string;
  receiptUrl?: string;
  bankName?: string;
  accountHolder?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = (session.user as any).id;

  if (!data.planId) {
    return { success: false, error: "Plan ID is required." };
  }

  const generatedRef = data.utrNumber?.trim() || `PAY-${Date.now().toString(36).toUpperCase()}`;

  const res = await container.services.membershipService.submitManualPayment(
    userId,
    data.planId,
    data.paymentMethod || "MANUAL_UPI",
    generatedRef,
    data.receiptUrl,
    data.bankName,
    data.accountHolder
  );

  if (!res.success) return { success: false, error: res.error };

  revalidatePath("/membership");
  revalidatePath("/dashboard");
  return { success: true, payment: res.data };
}

export async function approvePaymentAction(paymentId: string) {
  const permCheck = await verifyActionPermission("MANAGE_PAYMENTS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const adminUserId = permCheck.data!.userId;

  const res = await container.services.membershipService.approvePayment(adminUserId, paymentId);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath("/admin/payments");
  revalidatePath("/admin/memberships");
  revalidatePath("/dashboard");
  return { success: true, membership: res.data.membership };
}

export async function rejectPaymentAction(paymentId: string, reason: string) {
  const permCheck = await verifyActionPermission("MANAGE_PAYMENTS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const adminUserId = permCheck.data!.userId;

  const res = await container.services.membershipService.rejectPayment(adminUserId, paymentId, reason);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath("/admin/payments");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function editMembershipPlanAction(planId: string, data: any) {
  const permCheck = await verifyActionPermission("MANAGE_PAYMENTS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }

  try {
    const updated = await container.repositories.membershipRepository.updatePlan(planId, data);
    revalidatePath("/admin/memberships");
    revalidatePath("/membership");
    return { success: true, plan: updated };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
