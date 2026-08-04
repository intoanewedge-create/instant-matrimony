"use server";

import { auth } from "../auth";
import { container } from "../container";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const pageSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  metaKeywords: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
});

const sectionSchema = z.object({
  pageId: z.string().min(1),
  key: z.string().min(1),
  content: z.string().min(1),
  order: z.number().default(0),
});

const navSchema = z.object({
  label: z.string().min(1),
  url: z.string().min(1),
  order: z.number().default(0),
  parentId: z.string().optional().nullable(),
});

export async function createPageAction(input: any) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }

  const result = pageSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const res = await container.services.cmsService.createPage({
    ...result.data,
    publishedById: (session.user as any).id,
    publishedAt: result.data.status === "PUBLISHED" ? new Date() : null,
  });

  if (res.success) {
    revalidatePath("/");
  }
  return res;
}

export async function updatePageAction(id: string, input: any) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }

  const result = pageSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const res = await container.services.cmsService.updatePage(id, {
    ...result.data,
    publishedAt: result.data.status === "PUBLISHED" ? new Date() : null,
  });

  if (res.success) {
    revalidatePath(`/${result.data.slug}`);
  }
  return res;
}

export async function deletePageAction(id: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }

  const res = await container.services.cmsService.deletePage(id);
  if (res.success) {
  }
  return res;
}

export async function listPagesAction(status?: string) {
  const res = await container.services.cmsService.listPages(status);
  return res;
}

export async function getPageBySlugAction(slug: string) {
  const res = await container.services.cmsService.getPageBySlug(slug);
  return res;
}

export async function createSectionAction(input: any) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }

  const result = sectionSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const res = await container.services.cmsService.createSection(
    result.data.pageId,
    result.data.key,
    result.data.content,
    result.data.order
  );
  return res;
}

export async function createNavigationAction(input: any) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }

  const result = navSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const res = await container.services.cmsService.createNavigation(
    result.data.label,
    result.data.url,
    result.data.order,
    result.data.parentId || undefined
  );
  if (res.success) {
    revalidatePath("/");
  }
  return res;
}

export async function getNavigationAction() {
  const res = await container.services.cmsService.getNavigation();
  return res;
}

export async function seedDefaultPagesAction() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }
  const res = await container.services.cmsService.seedDefaultPages();
  return res;
}
