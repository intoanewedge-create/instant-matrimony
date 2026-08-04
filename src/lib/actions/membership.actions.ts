"use server";

import { auth } from "../auth";
import { container } from "../container";
import { revalidatePath } from "next/cache";

export async function submitManualPaymentAction(data: {
  planId: string;
  paymentMethod: string;
  utrNumber: string;
  receiptUrl?: string;
  bankName?: string;
  accountHolder?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = (session.user as any).id;

  if (!data.planId || !data.utrNumber) {
    return { success: false, error: "Plan ID and UTR / Transaction reference number are required." };
  }

  const res = await container.services.membershipService.submitManualPayment(
    userId,
    data.planId,
    data.paymentMethod || "QR_CODE",
    data.utrNumber.trim(),
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
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Admin authorization required" };
  }
  const adminUserId = (session.user as any).id;

  const res = await container.services.membershipService.approvePayment(adminUserId, paymentId);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath("/admin/payments");
  revalidatePath("/admin/memberships");
  revalidatePath("/dashboard");
  return { success: true, membership: res.data.membership };
}

export async function rejectPaymentAction(paymentId: string, reason: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Admin authorization required" };
  }
  const adminUserId = (session.user as any).id;

  const res = await container.services.membershipService.rejectPayment(adminUserId, paymentId, reason);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath("/admin/payments");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function editMembershipPlanAction(planId: string, data: any) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Admin authorization required" };
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
