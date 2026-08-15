import { BaseService } from "./base.service";
import { Result } from "../result";
import { prisma } from "../prisma";

export class FavoriteService extends BaseService {
  constructor() {
    super();
  }

  async addFavorite(
    userId: string,
    favoriteUserId: string,
  ): Promise<Result<any>> {
    try {
      if (!userId || !favoriteUserId) {
        return this.returnFailure("Missing user id", "INVALID_INPUT");
      }
      if (userId === favoriteUserId) {
        return this.returnFailure(
          "You cannot favorite your own profile.",
          "FAVORITE_SELF_NOT_ALLOWED",
        );
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: favoriteUserId },
      });
      if (!targetUser || !targetUser.isActive || targetUser.deletedAt !== null) {
        return this.returnFailure(
          "Profile to favorite not found.",
          "USER_NOT_FOUND",
        );
      }

      const blocked = await prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: userId, blockedId: favoriteUserId },
            { blockerId: favoriteUserId, blockedId: userId },
          ],
        },
      });
      if (blocked) {
        return this.returnFailure(
          "You cannot favorite this profile.",
          "FAVORITE_NOT_ALLOWED",
        );
      }

      // Upsert enforces uniqueness (userId + favoriteUserId).
      const favorite = await prisma.favorite.upsert({
        where: { userId_favoriteUserId: { userId, favoriteUserId } },
        update: {},
        create: { userId, favoriteUserId },
      });

      return this.returnSuccess(favorite);
    } catch (e: any) {
      return this.returnFailure(e.message, "FAVORITE_ADD_ERROR");
    }
  }

  async removeFavorite(
    userId: string,
    favoriteUserId: string,
  ): Promise<Result<any>> {
    try {
      // Ownership protected via composite key using session-derived userId.
      const existing = await prisma.favorite.findUnique({
        where: { userId_favoriteUserId: { userId, favoriteUserId } },
      });
      if (!existing) {
        return this.returnFailure("Favorite not found.", "FAVORITE_NOT_FOUND");
      }
      await prisma.favorite.delete({
        where: { userId_favoriteUserId: { userId, favoriteUserId } },
      });
      return this.returnSuccess({ removed: true });
    } catch (e: any) {
      return this.returnFailure(e.message, "FAVORITE_REMOVE_ERROR");
    }
  }

  async listFavorites(userId: string): Promise<Result<any[]>> {
    try {
      const favorites = await prisma.favorite.findMany({
        where: {
          userId,
          favoriteUser: {
            isActive: true,
            deletedAt: null,
          },
        },
        include: {
          favoriteUser: {
            include: {
              profile: {
                include: {
                  photos: { where: { deletedAt: null, isApproved: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return this.returnSuccess(favorites);
    } catch (e: any) {
      return this.returnFailure(e.message, "FAVORITE_LIST_ERROR");
    }
  }

  async isFavorite(userId: string, favoriteUserId: string): Promise<boolean> {
    try {
      const found = await prisma.favorite.findUnique({
        where: { userId_favoriteUserId: { userId, favoriteUserId } },
        select: { id: true },
      });
      return !!found;
    } catch {
      return false;
    }
  }

  async getFavoriteUserIds(userId: string): Promise<string[]> {
    try {
      const rows = await prisma.favorite.findMany({
        where: { userId },
        select: { favoriteUserId: true },
      });
      return rows.map((r) => r.favoriteUserId);
    } catch {
      return [];
    }
  }
}
