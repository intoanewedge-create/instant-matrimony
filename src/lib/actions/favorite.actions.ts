"use server";

import { z } from "zod";
import { auth } from "../auth";
import { container } from "../container";
import { revalidatePath } from "next/cache";

const favoriteSchema = z.object({
  favoriteUserId: z.string().uuid("Invalid user ID"),
});

export async function addFavoriteAction(favoriteUserId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  const userId = (session.user as any).id;

  const parsed = favoriteSchema.safeParse({ favoriteUserId });
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const result = await container.services.favoriteService.addFavorite(
    userId,
    parsed.data.favoriteUserId,
  );
  if (!result.success) return { success: false, error: result.error };

  revalidatePath("/favorites");
  revalidatePath("/search");
  return { success: true, favorite: result.data };
}

export async function removeFavoriteAction(favoriteUserId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  const userId = (session.user as any).id;

  const parsed = favoriteSchema.safeParse({ favoriteUserId });
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const result = await container.services.favoriteService.removeFavorite(
    userId,
    parsed.data.favoriteUserId,
  );
  if (!result.success) return { success: false, error: result.error };

  revalidatePath("/favorites");
  revalidatePath("/search");
  return { success: true };
}

export async function toggleFavoriteAction(favoriteUserId: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  const userId = (session.user as any).id;

  const parsed = favoriteSchema.safeParse({ favoriteUserId });
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const already = await container.services.favoriteService.isFavorite(
    userId,
    parsed.data.favoriteUserId,
  );
  if (already) {
    const r = await container.services.favoriteService.removeFavorite(
      userId,
      parsed.data.favoriteUserId,
    );
    if (!r.success) return { success: false, error: r.error };
    revalidatePath("/favorites");
    revalidatePath("/search");
    return { success: true, favorited: false };
  }
  const r = await container.services.favoriteService.addFavorite(
    userId,
    parsed.data.favoriteUserId,
  );
  if (!r.success) return { success: false, error: r.error };
  revalidatePath("/favorites");
  revalidatePath("/search");
  return { success: true, favorited: true };
}

export async function listFavoritesAction() {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Unauthorized" };
  const userId = (session.user as any).id;

  const result = await container.services.favoriteService.listFavorites(userId);
  if (!result.success) return { success: false, error: result.error };
  return { success: true, favorites: result.data };
}
