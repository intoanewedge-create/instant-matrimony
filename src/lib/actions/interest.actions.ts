"use server";

import { auth } from "../auth";
import { container } from "../container";
import { sendInterestSchema } from "../validators/interest.validator";
import { revalidatePath } from "next/cache";

export async function sendInterestAction(receiverId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const senderId = (session.user as any).id;

  const result = sendInterestSchema.safeParse({ receiverId });
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const serviceResult = await container.services.interestService.sendInterest(senderId, receiverId);
  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  revalidatePath("/dashboard");
  revalidatePath("/search");
  return { success: true, interest: serviceResult.data };
}

export async function acceptInterestAction(interestId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const receiverId = (session.user as any).id;

  const serviceResult = await container.services.interestService.acceptInterest(receiverId, interestId);
  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  revalidatePath("/dashboard");
  revalidatePath("/messages");
  return { success: true };
}

export async function declineInterestAction(interestId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const receiverId = (session.user as any).id;

  const serviceResult = await container.services.interestService.declineInterest(receiverId, interestId);
  if (!serviceResult.success) {
    return { success: false, error: serviceResult.error };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
