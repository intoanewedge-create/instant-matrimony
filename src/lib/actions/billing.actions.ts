"use server";

import { auth } from "../auth";
import { container } from "../container";
import { z } from "zod";

const checkoutSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  amount: z.number().positive("Amount must be positive"),
  successUrl: z.string().url("Invalid success URL"),
  cancelUrl: z.string().url("Invalid cancel URL"),
});

export async function createCheckoutAction(input: {
  planId: string;
  amount: number;
  successUrl: string;
  cancelUrl: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = checkoutSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const { planId, amount, successUrl, cancelUrl } = result.data;
  const billingRes = await container.services.billingAggregate.createCheckout(
    session.user.id,
    planId,
    amount,
    successUrl,
    cancelUrl
  );

  return billingRes;
}

export async function cancelSubscriptionAction(membershipId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!membershipId) {
    return { success: false, error: "Membership ID is required" };
  }

  const billingRes = await container.services.billingAggregate.cancelSubscription(
    session.user.id,
    membershipId
  );

  return billingRes;
}
