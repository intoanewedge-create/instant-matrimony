"use server";

import { prisma } from "../prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyActionPermission } from "./action-utils";
import { returnFailure, returnSuccess } from "../result";

const testimonialSchema = z.object({
  name: z.string().min(2, "Name or couple names required"),
  role: z.string().optional().nullable(),
  content: z.string().min(10, "Story / feedback must be at least 10 characters"),
  photoUrl: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5).default(5),
  isApproved: z.boolean().default(true),
  order: z.number().int().default(0),
});

const testimonialUpdateSchema = testimonialSchema.partial();

export async function getTestimonialsAction(includeUnapproved: boolean = false) {
  try {
    const where = includeUnapproved ? {} : { isApproved: true };
    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return returnSuccess(testimonials);
  } catch (e: any) {
    return returnFailure(e.message, "TESTIMONIAL_FETCH_ERROR");
  }
}

export async function createTestimonialAction(input: any) {
  const permCheck = await verifyActionPermission("MANAGE_CMS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }

  const result = testimonialSchema.safeParse(input);
  if (!result.success) {
    return returnFailure(result.error.issues[0].message, "VALIDATION_ERROR");
  }

  try {
    const testimonial = await prisma.testimonial.create({
      data: {
        name: result.data.name.trim(),
        role: result.data.role?.trim() || null,
        content: result.data.content.trim(),
        photoUrl: result.data.photoUrl?.trim() || null,
        rating: result.data.rating ?? 5,
        isApproved: result.data.isApproved ?? true,
        order: result.data.order ?? 0,
      },
    });

    const { auditService } = await import("../container");
    await auditService.log(
      permCheck.data!.userId,
      "TESTIMONIAL_CREATED",
      undefined,
      undefined,
      `Created Testimonial ID: ${testimonial.id} ("${testimonial.name}")`
    );

    revalidatePath("/success-stories");
    revalidatePath("/admin/testimonials");
    revalidatePath("/admin/cms");

    return returnSuccess(testimonial);
  } catch (e: any) {
    return returnFailure(e.message, "TESTIMONIAL_CREATE_ERROR");
  }
}

export async function updateTestimonialAction(id: string, input: any) {
  const permCheck = await verifyActionPermission("MANAGE_CMS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }

  const result = testimonialUpdateSchema.safeParse(input);
  if (!result.success) {
    return returnFailure(result.error.issues[0].message, "VALIDATION_ERROR");
  }

  try {
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return returnFailure("Testimonial not found", "NOT_FOUND");
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(result.data.name !== undefined ? { name: result.data.name.trim() } : {}),
        ...(result.data.role !== undefined ? { role: result.data.role?.trim() || null } : {}),
        ...(result.data.content !== undefined ? { content: result.data.content.trim() } : {}),
        ...(result.data.photoUrl !== undefined ? { photoUrl: result.data.photoUrl?.trim() || null } : {}),
        ...(result.data.rating !== undefined ? { rating: result.data.rating } : {}),
        ...(result.data.isApproved !== undefined ? { isApproved: result.data.isApproved } : {}),
        ...(result.data.order !== undefined ? { order: result.data.order } : {}),
      },
    });

    const { auditService } = await import("../container");
    await auditService.log(
      permCheck.data!.userId,
      "TESTIMONIAL_UPDATED",
      undefined,
      undefined,
      `Updated Testimonial ID: ${id}`
    );

    revalidatePath("/success-stories");
    revalidatePath("/admin/testimonials");
    revalidatePath("/admin/cms");

    return returnSuccess(updated);
  } catch (e: any) {
    return returnFailure(e.message, "TESTIMONIAL_UPDATE_ERROR");
  }
}

export async function deleteTestimonialAction(id: string) {
  const permCheck = await verifyActionPermission("MANAGE_CMS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }

  try {
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return returnFailure("Testimonial not found", "NOT_FOUND");
    }

    await prisma.testimonial.delete({ where: { id } });

    const { auditService } = await import("../container");
    await auditService.log(
      permCheck.data!.userId,
      "TESTIMONIAL_DELETED",
      undefined,
      undefined,
      `Deleted Testimonial ID: ${id}`
    );

    revalidatePath("/success-stories");
    revalidatePath("/admin/testimonials");
    revalidatePath("/admin/cms");

    return returnSuccess({ deleted: true });
  } catch (e: any) {
    return returnFailure(e.message, "TESTIMONIAL_DELETE_ERROR");
  }
}

export async function toggleTestimonialApprovedAction(id: string) {
  const permCheck = await verifyActionPermission("MANAGE_CMS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }

  try {
    const existing = await prisma.testimonial.findUnique({ where: { id } });
    if (!existing) {
      return returnFailure("Testimonial not found", "NOT_FOUND");
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: { isApproved: !existing.isApproved },
    });

    revalidatePath("/success-stories");
    revalidatePath("/admin/testimonials");
    revalidatePath("/admin/cms");

    return returnSuccess(updated);
  } catch (e: any) {
    return returnFailure(e.message, "TESTIMONIAL_TOGGLE_ERROR");
  }
}
