"use server";

import { auth } from "../auth";
import { container } from "../container";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const saveSearchSchema = z.object({
  name: z.string().min(1, "Name is required"),
  filters: z.any(),
});

export async function saveSearchAction(input: { name: string; filters: any }) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const result = saveSearchSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const res = await container.services.savedSearchService.saveSearch(
    session.user.id,
    result.data.name,
    result.data.filters
  );

  if (res.success) {
    revalidatePath("/dashboard/saved-searches");
  }
  return res;
}

export async function renameSearchAction(id: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!id || !name) {
    return { success: false, error: "ID and Name are required" };
  }

  const res = await container.services.savedSearchService.renameSearch(
    session.user.id,
    id,
    name
  );

  if (res.success) {
    revalidatePath("/dashboard/saved-searches");
  }
  return res;
}

export async function pinSearchAction(id: string, isPinned: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!id) {
    return { success: false, error: "ID is required" };
  }

  const res = await container.services.savedSearchService.pinSearch(
    session.user.id,
    id,
    isPinned
  );

  if (res.success) {
    revalidatePath("/dashboard/saved-searches");
  }
  return res;
}

export async function deleteSearchAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (!id) {
    return { success: false, error: "ID is required" };
  }

  const res = await container.services.savedSearchService.deleteSearch(
    session.user.id,
    id
  );

  if (res.success) {
    revalidatePath("/dashboard/saved-searches");
  }
  return res;
}

export async function getSavedSearchesAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const res = await container.services.savedSearchService.getSavedSearches(session.user.id);
  return res;
}
