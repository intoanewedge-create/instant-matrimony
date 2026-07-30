import { BaseRepository } from "./base.repository";
import { ISavedSearchRepository } from "./interfaces/saved-search.repository";
import { prisma } from "../prisma";

export class PrismaSavedSearchRepository
  extends BaseRepository<any>
  implements ISavedSearchRepository
{
  protected modelDelegate = prisma.savedSearch;

  async saveSearch(userId: string, name: string, filters: any): Promise<any> {
    return this.modelDelegate.create({
      data: {
        userId,
        name,
        filters: JSON.parse(JSON.stringify(filters)),
      },
    });
  }

  async renameSearch(id: string, name: string): Promise<any> {
    return this.modelDelegate.update({
      where: { id },
      data: { name },
    });
  }

  async deleteSearch(id: string): Promise<any> {
    return this.modelDelegate.delete({
      where: { id },
    });
  }

  async listSavedSearches(userId: string): Promise<any[]> {
    return this.modelDelegate.findMany({
      where: { userId },
      orderBy: [
        { isPinned: "desc" },
        { createdAt: "desc" },
      ],
    });
  }

  async pinSearch(id: string, isPinned: boolean): Promise<any> {
    return this.modelDelegate.update({
      where: { id },
      data: { isPinned },
    });
  }

  async countSavedSearches(userId: string): Promise<number> {
    return this.modelDelegate.count({
      where: { userId },
    });
  }
}
