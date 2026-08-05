"use server";

import { container } from "../container";
import { z } from "zod";
import { verifyActionPermission } from "./action-utils";
import { returnFailure } from "../result";

const flagSchema = z.object({
  key: z.string().min(1, "Key is required"),
  enabled: z.boolean(),
  value: z.string().default("true"),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
});

export async function setFlagAction(input: {
  key: string;
  enabled: boolean;
  value?: string;
  description?: string;
  category?: string;
}) {
  const permCheck = await verifyActionPermission("MANAGE_SYSTEM");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }

  const result = flagSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const res = await container.services.featureFlagService.setFlag(
    result.data.key,
    result.data.enabled,
    result.data.value,
    result.data.description || undefined,
    result.data.category || undefined
  );

  return res;
}

export async function listFlagsAction() {
  const permCheck = await verifyActionPermission("MANAGE_SYSTEM");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const res = await container.services.featureFlagService.listFlags();
  return res;
}

export async function seedDefaultFlagsAction() {
  const permCheck = await verifyActionPermission("MANAGE_SYSTEM");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const res = await container.services.featureFlagService.seedDefaultFlags();
  return res;
}
