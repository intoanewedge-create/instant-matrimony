import { BaseRepository } from "./base.repository";
import { ICmsRepository } from "./interfaces/cms.repository";
import { prisma } from "../prisma";

export class PrismaCmsRepository
  extends BaseRepository<any>
  implements ICmsRepository
{
  protected modelDelegate = prisma.cmsPage;

  async findBySlug(slug: string): Promise<any | null> {
    return this.modelDelegate.findUnique({
      where: { slug },
      include: {
        sections: {
          orderBy: { order: "asc" },
        },
      },
    });
  }

  async createPage(data: any): Promise<any> {
    return this.modelDelegate.create({
      data,
    });
  }

  async updatePage(id: string, data: any): Promise<any> {
    return this.modelDelegate.update({
      where: { id },
      data,
    });
  }

  async deletePage(id: string): Promise<any> {
    return this.modelDelegate.delete({
      where: { id },
    });
  }

  async listPages(status?: string): Promise<any[]> {
    return this.modelDelegate.findMany({
      where: status ? { status } : {},
      orderBy: { updatedAt: "desc" },
    });
  }

  async createSection(data: any): Promise<any> {
    return prisma.cmsSection.create({
      data,
    });
  }

  async updateSection(id: string, data: any): Promise<any> {
    return prisma.cmsSection.update({
      where: { id },
      data,
    });
  }

  async deleteSection(id: string): Promise<any> {
    return prisma.cmsSection.delete({
      where: { id },
    });
  }

  async createNavigation(data: any): Promise<any> {
    return prisma.cmsNavigation.create({
      data,
    });
  }

  async getNavigationTree(): Promise<any[]> {
    return prisma.cmsNavigation.findMany({
      where: { parentId: null },
      include: {
        children: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });
  }

  async createMedia(data: any): Promise<any> {
    return prisma.cmsMedia.create({
      data,
    });
  }

  async listMedia(): Promise<any[]> {
    return prisma.cmsMedia.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
}
