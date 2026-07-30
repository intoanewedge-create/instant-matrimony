import { BaseService } from "./base.service";
import { Result } from "../result";
import { ISavedSearchRepository } from "../repositories/interfaces/saved-search.repository";
import { prisma } from "../prisma";

export class SavedSearchService extends BaseService {
  constructor(private repository: ISavedSearchRepository) {
    super();
  }

  async saveSearch(userId: string, name: string, filters: any): Promise<Result<any>> {
    try {
      const activeMembership = await prisma.membership.findFirst({
        where: {
          userId,
          status: "ACTIVE",
          endDate: { gte: new Date() },
        },
      });

      const isPremium = !!activeMembership;
      const count = await this.repository.countSavedSearches(userId);

      if (!isPremium && count >= 5) {
        return this.returnFailure(
          "Free users are limited to 5 saved searches. Upgrade to Premium for unlimited saved searches.",
          "PREMIUM_REQUIRED"
        );
      }

      const saved = await this.repository.saveSearch(userId, name, filters);
      return this.returnSuccess(saved);
    } catch (e: any) {
      return this.returnFailure(e.message, "SAVE_SEARCH_ERROR");
    }
  }

  async renameSearch(userId: string, id: string, name: string): Promise<Result<any>> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing || existing.userId !== userId) {
        return this.returnFailure("Saved search not found or unauthorized", "UNAUTHORIZED");
      }

      const updated = await this.repository.renameSearch(id, name);
      return this.returnSuccess(updated);
    } catch (e: any) {
      return this.returnFailure(e.message, "RENAME_SEARCH_ERROR");
    }
  }

  async pinSearch(userId: string, id: string, isPinned: boolean): Promise<Result<any>> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing || existing.userId !== userId) {
        return this.returnFailure("Saved search not found or unauthorized", "UNAUTHORIZED");
      }

      const updated = await this.repository.pinSearch(id, isPinned);
      return this.returnSuccess(updated);
    } catch (e: any) {
      return this.returnFailure(e.message, "PIN_SEARCH_ERROR");
    }
  }

  async deleteSearch(userId: string, id: string): Promise<Result<any>> {
    try {
      const existing = await this.repository.findById(id);
      if (!existing || existing.userId !== userId) {
        return this.returnFailure("Saved search not found or unauthorized", "UNAUTHORIZED");
      }

      const deleted = await this.repository.deleteSearch(id);
      return this.returnSuccess(deleted);
    } catch (e: any) {
      return this.returnFailure(e.message, "DELETE_SEARCH_ERROR");
    }
  }

  async getSavedSearches(userId: string): Promise<Result<any[]>> {
    try {
      const list = await this.repository.listSavedSearches(userId);
      return this.returnSuccess(list);
    } catch (e: any) {
      return this.returnFailure(e.message, "GET_SAVED_SEARCHES_ERROR");
    }
  }
}
