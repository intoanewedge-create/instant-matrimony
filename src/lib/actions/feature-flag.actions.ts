"use server";

import { auth } from "../auth";
import { container } from "../container";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
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
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }
  const res = await container.services.featureFlagService.listFlags();
  return res;
}

export async function seedDefaultFlagsAction() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }
  const res = await container.services.featureFlagService.seedDefaultFlags();

  return res;
}
