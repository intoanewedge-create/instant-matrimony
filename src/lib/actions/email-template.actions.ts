"use server";

import { emailTemplateService } from "../services/email-template.service";
import { revalidatePath } from "next/cache";
import { verifyActionPermission } from "./action-utils";
import { returnFailure } from "../result";

export async function getEmailTemplatesAction() {
  const permCheck = await verifyActionPermission("MANAGE_MARKETING");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  return await emailTemplateService.getTemplates();
}

export async function getEmailTemplateBySlugAction(slug: string) {
  const permCheck = await verifyActionPermission("MANAGE_MARKETING");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  return await emailTemplateService.getTemplateBySlug(slug);
}

export async function updateEmailTemplateAction(id: string, subject: string, bodyHtml: string, bodyText: string) {
  const permCheck = await verifyActionPermission("MANAGE_MARKETING");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  const res = await emailTemplateService.updateTemplate(id, subject, bodyHtml, bodyText);
  if (res.success) {
    revalidatePath("/admin/email-templates");
  }
  return res;
}

export async function sendTestEmailAction(slug: string, testRecipient: string) {
  const permCheck = await verifyActionPermission("MANAGE_MARKETING");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  return await emailTemplateService.sendTestEmail(slug, testRecipient);
}
