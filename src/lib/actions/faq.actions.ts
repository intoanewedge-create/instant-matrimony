"use server";

import { prisma } from "../prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifyActionPermission } from "./action-utils";
import { returnFailure, returnSuccess } from "../result";

const faqSchema = z.object({
  question: z.string().min(3, "Question must be at least 3 characters"),
  answer: z.string().min(5, "Answer must be at least 5 characters"),
  category: z.string().default("General"),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

const faqUpdateSchema = faqSchema.partial();

export async function getFaqsAction(includeInactive: boolean = false) {
  try {
    const where = includeInactive ? {} : { isActive: true };
    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return returnSuccess(faqs);
  } catch (e: any) {
    return returnFailure(e.message, "FAQ_FETCH_ERROR");
  }
}

export async function createFaqAction(input: any) {
  const permCheck = await verifyActionPermission("MANAGE_CMS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }

  const result = faqSchema.safeParse(input);
  if (!result.success) {
    return returnFailure(result.error.issues[0].message, "VALIDATION_ERROR");
  }

  try {
    const faq = await prisma.fAQ.create({
      data: {
        question: result.data.question.trim(),
        answer: result.data.answer.trim(),
        category: result.data.category?.trim() || "General",
        order: result.data.order ?? 0,
        isActive: result.data.isActive ?? true,
      },
    });

    const { auditService } = await import("../container");
    await auditService.log(
      permCheck.data!.userId,
      "FAQ_CREATED",
      undefined,
      undefined,
      `Created FAQ ID: ${faq.id} (${faq.question.slice(0, 40)}...)`
    );

    revalidatePath("/faq");
    revalidatePath("/admin/faqs");
    revalidatePath("/admin/cms");

    return returnSuccess(faq);
  } catch (e: any) {
    return returnFailure(e.message, "FAQ_CREATE_ERROR");
  }
}

export async function updateFaqAction(id: string, input: any) {
  const permCheck = await verifyActionPermission("MANAGE_CMS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }

  const result = faqUpdateSchema.safeParse(input);
  if (!result.success) {
    return returnFailure(result.error.issues[0].message, "VALIDATION_ERROR");
  }

  try {
    const existing = await prisma.fAQ.findUnique({ where: { id } });
    if (!existing) {
      return returnFailure("FAQ not found", "NOT_FOUND");
    }

    const updated = await prisma.fAQ.update({
      where: { id },
      data: {
        ...(result.data.question !== undefined ? { question: result.data.question.trim() } : {}),
        ...(result.data.answer !== undefined ? { answer: result.data.answer.trim() } : {}),
        ...(result.data.category !== undefined ? { category: result.data.category.trim() } : {}),
        ...(result.data.order !== undefined ? { order: result.data.order } : {}),
        ...(result.data.isActive !== undefined ? { isActive: result.data.isActive } : {}),
      },
    });

    const { auditService } = await import("../container");
    await auditService.log(
      permCheck.data!.userId,
      "FAQ_UPDATED",
      undefined,
      undefined,
      `Updated FAQ ID: ${id}`
    );

    revalidatePath("/faq");
    revalidatePath("/admin/faqs");
    revalidatePath("/admin/cms");

    return returnSuccess(updated);
  } catch (e: any) {
    return returnFailure(e.message, "FAQ_UPDATE_ERROR");
  }
}

export async function deleteFaqAction(id: string) {
  const permCheck = await verifyActionPermission("MANAGE_CMS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }

  try {
    const existing = await prisma.fAQ.findUnique({ where: { id } });
    if (!existing) {
      return returnFailure("FAQ not found", "NOT_FOUND");
    }

    await prisma.fAQ.delete({ where: { id } });

    const { auditService } = await import("../container");
    await auditService.log(
      permCheck.data!.userId,
      "FAQ_DELETED",
      undefined,
      undefined,
      `Deleted FAQ ID: ${id}`
    );

    revalidatePath("/faq");
    revalidatePath("/admin/faqs");
    revalidatePath("/admin/cms");

    return returnSuccess({ deleted: true });
  } catch (e: any) {
    return returnFailure(e.message, "FAQ_DELETE_ERROR");
  }
}

export async function toggleFaqActiveAction(id: string) {
  const permCheck = await verifyActionPermission("MANAGE_CMS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }

  try {
    const existing = await prisma.fAQ.findUnique({ where: { id } });
    if (!existing) {
      return returnFailure("FAQ not found", "NOT_FOUND");
    }

    const updated = await prisma.fAQ.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    revalidatePath("/faq");
    revalidatePath("/admin/faqs");
    revalidatePath("/admin/cms");

    return returnSuccess(updated);
  } catch (e: any) {
    return returnFailure(e.message, "FAQ_TOGGLE_ERROR");
  }
}
