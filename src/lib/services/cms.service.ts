import { BaseService } from "./base.service";
import { Result, returnSuccess, returnFailure } from "../result";
import { ICmsRepository } from "../repositories/interfaces/cms.repository";
import { CacheProvider } from "../cache/cache-provider";
import { prisma } from "../prisma";

export class CmsService extends BaseService {
  constructor(
    private repository: ICmsRepository,
    private cache: CacheProvider
  ) {
    super();
  }

  async getPageBySlug(slug: string): Promise<Result<any>> {
    try {
      const cacheKey = `cms:page:${slug}`;
      const cached = await this.cache.get<any>(cacheKey);
      if (cached) {
        return this.returnSuccess(cached);
      }

      const page = await this.repository.findBySlug(slug);
      if (!page) {
        return this.returnFailure("Page not found", "CMS_PAGE_NOT_FOUND");
      }

      await this.cache.set(cacheKey, page, 3600, ["cms"]);
      return this.returnSuccess(page);
    } catch (e: any) {
      return this.returnFailure(e.message, "CMS_GET_PAGE_ERROR");
    }
  }

  async createPage(data: any): Promise<Result<any>> {
    try {
      const page = await this.repository.createPage(data);
      await this.cache.invalidateTags(["cms"]);
      return this.returnSuccess(page);
    } catch (e: any) {
      return this.returnFailure(e.message, "CMS_CREATE_PAGE_ERROR");
    }
  }

  async updatePage(id: string, data: any): Promise<Result<any>> {
    try {
      const page = await this.repository.updatePage(id, data);
      await this.cache.invalidateTags(["cms"]);
      return this.returnSuccess(page);
    } catch (e: any) {
      return this.returnFailure(e.message, "CMS_UPDATE_PAGE_ERROR");
    }
  }

  async deletePage(id: string): Promise<Result<any>> {
    try {
      const page = await this.repository.deletePage(id);
      await this.cache.invalidateTags(["cms"]);
      return this.returnSuccess(page);
    } catch (e: any) {
      return this.returnFailure(e.message, "CMS_DELETE_PAGE_ERROR");
    }
  }

  async listPages(status?: string): Promise<Result<any[]>> {
    try {
      const pages = await this.repository.listPages(status);
      return this.returnSuccess(pages);
    } catch (e: any) {
      return this.returnFailure(e.message, "CMS_LIST_PAGES_ERROR");
    }
  }

  async createSection(pageId: string, key: string, content: string, order: number = 0): Promise<Result<any>> {
    try {
      const section = await this.repository.createSection({ pageId, key, content, order });
      await this.cache.invalidateTags(["cms"]);
      return this.returnSuccess(section);
    } catch (e: any) {
      return this.returnFailure(e.message, "CMS_CREATE_SECTION_ERROR");
    }
  }

  async updateSection(id: string, content: string, order?: number): Promise<Result<any>> {
    try {
      const section = await this.repository.updateSection(id, { content, order });
      await this.cache.invalidateTags(["cms"]);
      return this.returnSuccess(section);
    } catch (e: any) {
      return this.returnFailure(e.message, "CMS_UPDATE_SECTION_ERROR");
    }
  }

  async deleteSection(id: string): Promise<Result<any>> {
    try {
      const section = await this.repository.deleteSection(id);
      await this.cache.invalidateTags(["cms"]);
      return this.returnSuccess(section);
    } catch (e: any) {
      return this.returnFailure(e.message, "CMS_DELETE_SECTION_ERROR");
    }
  }

  async createNavigation(label: string, url: string, order: number = 0, parentId?: string): Promise<Result<any>> {
    try {
      const nav = await this.repository.createNavigation({ label, url, order, parentId });
      await this.cache.invalidateTags(["cms"]);
      return this.returnSuccess(nav);
    } catch (e: any) {
      return this.returnFailure(e.message, "CMS_CREATE_NAV_ERROR");
    }
  }

  async getNavigation(): Promise<Result<any[]>> {
    try {
      const navs = await this.repository.getNavigationTree();
      return this.returnSuccess(navs);
    } catch (e: any) {
      return this.returnFailure(e.message, "CMS_GET_NAV_ERROR");
    }
  }

  async seedDefaultPages(): Promise<Result<void>> {
    try {
      const defaults = [
        { slug: "home", title: "Welcome to InstantMatrimony", content: "# InstantMatrimony\nFind your perfect match in real time." },
        { slug: "about", title: "About Us", content: "# About Us\nWe connect souls through a reliable and premium ecosystem." },
        { slug: "faq", title: "Frequently Asked Questions", content: "# FAQ\nAnswers to all your matrimony questions." },
        { slug: "contact", title: "Contact Us", content: "# Contact Us\nGet in touch with support." },
        { slug: "privacy-policy", title: "Privacy Policy", content: "# Privacy Policy\nYour data privacy is our absolute priority." },
        { slug: "terms", title: "Terms and Conditions", content: "# Terms & Conditions\nGuidelines and agreements of our platform usage." },
        { slug: "refund-policy", title: "Refund Policy", content: "# Refund Policy\nDetailed subscription cancellation and refund rules." },
        { slug: "safety-tips", title: "Safety Guidelines", content: "# Safety Guidelines\nKey tips on safety and profiles verification." },
      ];

      for (const item of defaults) {
        const existing = await this.repository.findBySlug(item.slug);
        if (!existing) {
          await this.repository.createPage({
            slug: item.slug,
            title: item.title,
            content: item.content,
            status: "PUBLISHED",
          });
        }
      }
      return this.returnSuccess(undefined);
    } catch (e: any) {
      return this.returnFailure(e.message, "CMS_SEED_ERROR");
    }
  }

  // --- Production-Grade Publishing & Version Rollbacks ---
  async publishPage(id: string, publishedById: string): Promise<Result<any>> {
    try {
      const page = await prisma.cmsPage.findUnique({
        where: { id },
      });

      if (!page) {
        return this.returnFailure("Page not found", "PAGE_NOT_FOUND");
      }

      const nextVersion = page.version + 1;

      // Update page to PUBLISHED
      const updatedPage = await prisma.cmsPage.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          version: nextVersion,
          publishedById,
          publishedAt: new Date(),
        },
      });

      // Save a history version snapshot
      await prisma.cmsPageVersion.create({
        data: {
          pageId: id,
          title: page.title,
          content: page.content,
          seoTitle: page.seoTitle,
          seoDescription: page.seoDescription,
          version: page.version,
          publishedById,
        },
      });

      const { auditService } = await import("../container");
      await auditService.log(publishedById, "CMS_PAGE_PUBLISHED", undefined, undefined, `Published page slug: ${page.slug} as v${page.version}`);
      await this.cache.invalidateTags(["cms"]);

      return returnSuccess(updatedPage);
    } catch (e: any) {
      return returnFailure(e.message, "PUBLISH_PAGE_ERROR");
    }
  }

  async getPageVersions(pageId: string): Promise<Result<any[]>> {
    try {
      const versions = await prisma.cmsPageVersion.findMany({
        where: { pageId },
        orderBy: { version: "desc" },
        include: { publishedBy: true },
      });
      return returnSuccess(versions);
    } catch (e: any) {
      return returnFailure(e.message, "GET_PAGE_VERSIONS_ERROR");
    }
  }

  async rollbackPageVersion(pageId: string, versionNumber: number, moderatorId: string): Promise<Result<any>> {
    try {
      const versionRecord = await prisma.cmsPageVersion.findFirst({
        where: { pageId, version: versionNumber },
      });

      if (!versionRecord) {
        return this.returnFailure("Page version not found", "VERSION_NOT_FOUND");
      }

      const page = await prisma.cmsPage.findUnique({ where: { id: pageId } });
      if (!page) {
        return this.returnFailure("Page not found", "PAGE_NOT_FOUND");
      }

      // Revert the CmsPage content to the version snapshot
      const updatedPage = await prisma.cmsPage.update({
        where: { id: pageId },
        data: {
          title: versionRecord.title,
          content: versionRecord.content,
          seoTitle: versionRecord.seoTitle,
          seoDescription: versionRecord.seoDescription,
          version: page.version + 1, // increment overall version counter
        },
      });

      const { auditService } = await import("../container");
      await auditService.log(moderatorId, "CMS_PAGE_ROLLBACK", undefined, undefined, `Rolled back page slug: ${page.slug} to v${versionNumber}`);
      await this.cache.invalidateTags(["cms"]);

      return returnSuccess(updatedPage);
    } catch (e: any) {
      return returnFailure(e.message, "ROLLBACK_VERSION_ERROR");
    }
  }
}
