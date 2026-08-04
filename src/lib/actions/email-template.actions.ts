"use server";

import { emailTemplateService } from "../services/email-template.service";
import { revalidatePath } from "next/cache";

export async function getEmailTemplatesAction() {
  return await emailTemplateService.getTemplates();
}

export async function getEmailTemplateBySlugAction(slug: string) {
  return await emailTemplateService.getTemplateBySlug(slug);
}

export async function updateEmailTemplateAction(id: string, subject: string, bodyHtml: string, bodyText: string) {
  const res = await emailTemplateService.updateTemplate(id, subject, bodyHtml, bodyText);
  if (res.success) {
    revalidatePath("/admin/email-templates");
  }
  return res;
}

export async function sendTestEmailAction(slug: string, testRecipient: string) {
  return await emailTemplateService.sendTestEmail(slug, testRecipient);
}
