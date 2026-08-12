"use server";

import { prisma } from "../prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyActionPermission } from "./action-utils";
import { returnFailure, returnSuccess } from "../result";

const bannerSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().min(1, "Image URL is required"),
  linkUrl: z.string().optional().nullable(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

const bannerUpdateSchema = bannerSchema.partial();

export async function getBannersAction(includeInactive: boolean = false) {
  try {
    const where = includeInactive ? {} : { isActive: true };
    const banners = await prisma.banner.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return returnSuccess(banners);
  } catch (e: any) {
    return returnFailure(e.message, "BANNER_FETCH_ERROR");
  }
}

export async function createBannerAction(input: any) {
  const permCheck = await verifyActionPermission("MANAGE_CMS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }

  const result = bannerSchema.safeParse(input);
  if (!result.success) {
    return returnFailure(result.error.issues[0].message, "VALIDATION_ERROR");
  }

  try {
    const banner = await prisma.banner.create({
      data: {
        title: result.data.title.trim(),
        subtitle: result.data.subtitle?.trim() || null,
        imageUrl: result.data.imageUrl.trim(),
        linkUrl: result.data.linkUrl?.trim() || null,
        order: result.data.order ?? 0,
        isActive: result.data.isActive ?? true,
      },
    });

    const { auditService } = await import("../container");
    await auditService.log(
      permCheck.data!.userId,
      "BANNER_CREATED",
      undefined,
      undefined,
      `Created Banner ID: ${banner.id} ("${banner.title}")`
    );

    revalidatePath("/");
    revalidatePath("/admin/banners");
    revalidatePath("/admin/cms");

    return returnSuccess(banner);
  } catch (e: any) {
    return returnFailure(e.message, "BANNER_CREATE_ERROR");
  }
}

export async function updateBannerAction(id: string, input: any) {
  const permCheck = await verifyActionPermission("MANAGE_CMS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }

  const result = bannerUpdateSchema.safeParse(input);
  if (!result.success) {
    return returnFailure(result.error.issues[0].message, "VALIDATION_ERROR");
  }

  try {
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return returnFailure("Banner not found", "NOT_FOUND");
    }

    const updated = await prisma.banner.update({
      where: { id },
      data: {
        ...(result.data.title !== undefined ? { title: result.data.title.trim() } : {}),
        ...(result.data.subtitle !== undefined ? { subtitle: result.data.subtitle?.trim() || null } : {}),
        ...(result.data.imageUrl !== undefined ? { imageUrl: result.data.imageUrl.trim() } : {}),
        ...(result.data.linkUrl !== undefined ? { linkUrl: result.data.linkUrl?.trim() || null } : {}),
        ...(result.data.order !== undefined ? { order: result.data.order } : {}),
        ...(result.data.isActive !== undefined ? { isActive: result.data.isActive } : {}),
      },
    });

    const { auditService } = await import("../container");
    await auditService.log(
      permCheck.data!.userId,
      "BANNER_UPDATED",
      undefined,
      undefined,
      `Updated Banner ID: ${id}`
    );

    revalidatePath("/");
    revalidatePath("/admin/banners");
    revalidatePath("/admin/cms");

    return returnSuccess(updated);
  } catch (e: any) {
    return returnFailure(e.message, "BANNER_UPDATE_ERROR");
  }
}

export async function deleteBannerAction(id: string) {
  const permCheck = await verifyActionPermission("MANAGE_CMS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }

  try {
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return returnFailure("Banner not found", "NOT_FOUND");
    }

    await prisma.banner.delete({ where: { id } });

    const { auditService } = await import("../container");
    await auditService.log(
      permCheck.data!.userId,
      "BANNER_DELETED",
      undefined,
      undefined,
      `Deleted Banner ID: ${id}`
    );

    revalidatePath("/");
    revalidatePath("/admin/banners");
    revalidatePath("/admin/cms");

    return returnSuccess({ deleted: true });
  } catch (e: any) {
    return returnFailure(e.message, "BANNER_DELETE_ERROR");
  }
}

export async function toggleBannerActiveAction(id: string) {
  const permCheck = await verifyActionPermission("MANAGE_CMS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }

  try {
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return returnFailure("Banner not found", "NOT_FOUND");
    }

    const updated = await prisma.banner.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    revalidatePath("/");
    revalidatePath("/admin/banners");
    revalidatePath("/admin/cms");

    return returnSuccess(updated);
  } catch (e: any) {
    return returnFailure(e.message, "BANNER_TOGGLE_ERROR");
  }
}
