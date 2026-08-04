"use server";

import { auth } from "../auth";
import { container } from "../container";
import { revalidatePath } from "next/cache";

export async function unlockContactAction(targetUserId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = (session.user as any).id;

  const res = await container.services.contactUnlockService.unlockContact(userId, targetUserId);
  if (!res.success) return { success: false, error: res.error };

  revalidatePath(`/profile/${targetUserId}`);
  revalidatePath(`/search`);
  revalidatePath(`/dashboard`);
  return { success: true, ...res.data };
}

export async function getUnlockQuotaAction() {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = (session.user as any).id;

  const res = await container.services.contactUnlockService.getUnlockQuota(userId);
  if (!res.success) return { success: false, error: res.error };

  return { success: true, ...res.data };
}
