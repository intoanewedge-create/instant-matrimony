import { prisma } from "../prisma";
import { Result, returnSuccess, returnFailure } from "../result";
import { emailService } from "../email";

export interface SystemEmailTemplate {
  slug: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  placeholders: string[];
}

export const DEFAULT_EMAIL_TEMPLATES: SystemEmailTemplate[] = [
  {
    slug: "welcome",
    name: "Welcome Email",
    subject: "Welcome to {{website_name}}, {{user_name}}!",
    bodyHtml: "<h2>Welcome to {{website_name}}</h2><p>Dear {{user_name}},</p><p>Thank you for registering. We are thrilled to help you find your life partner.</p>",
    bodyText: "Welcome to {{website_name}}, {{user_name}}! Thank you for registering.",
    placeholders: ["website_name", "user_name"],
  },
  {
    slug: "email-verification",
    name: "Email Verification",
    subject: "Verify your email address - {{website_name}}",
    bodyHtml: "<p>Hi {{user_name}},</p><p>Please verify your account by clicking the link below:</p><p><a href='{{verification_link}}'>Verify Account</a></p>",
    bodyText: "Hi {{user_name}}, Please verify your account: {{verification_link}}",
    placeholders: ["website_name", "user_name", "verification_link"],
  },
  {
    slug: "forgot-password",
    name: "Forgot Password Reset",
    subject: "Password Reset Request - {{website_name}}",
    bodyHtml: "<p>Dear {{user_name}},</p><p>Click here to reset your password: <a href='{{reset_link}}'>Reset Password</a></p>",
    bodyText: "Dear {{user_name}}, Reset your password: {{reset_link}}",
    placeholders: ["website_name", "user_name", "reset_link"],
  },
  {
    slug: "profile-approved",
    name: "Profile Approved",
    subject: "Congratulations! Your profile is approved on {{website_name}}",
    bodyHtml: "<p>Dear {{user_name}},</p><p>Your matrimonial profile has been reviewed and approved by our team.</p>",
    bodyText: "Dear {{user_name}}, Your profile has been approved.",
    placeholders: ["website_name", "user_name"],
  },
  {
    slug: "profile-rejected",
    name: "Profile Rejected",
    subject: "Action Required: Update your profile on {{website_name}}",
    bodyHtml: "<p>Dear {{user_name}},</p><p>Your profile requires modification. Reason: {{reason}}</p>",
    bodyText: "Dear {{user_name}}, Your profile requires modification. Reason: {{reason}}",
    placeholders: ["website_name", "user_name", "reason"],
  },
  {
    slug: "interest-received",
    name: "Interest Received",
    subject: "{{sender_name}} expressed interest in your profile",
    bodyHtml: "<p>Hi {{user_name}},</p><p>{{sender_name}} sent an interest request to you. Log in to view details.</p>",
    bodyText: "Hi {{user_name}}, {{sender_name}} sent an interest request to you.",
    placeholders: ["website_name", "user_name", "sender_name"],
  },
  {
    slug: "interest-accepted",
    name: "Interest Accepted",
    subject: "{{sender_name}} accepted your interest request!",
    bodyHtml: "<p>Great news {{user_name}}!</p><p>{{sender_name}} has accepted your interest. You can now chat or view contact details.</p>",
    bodyText: "Great news {{user_name}}! {{sender_name}} has accepted your interest.",
    placeholders: ["website_name", "user_name", "sender_name"],
  },
  {
    slug: "membership-activated",
    name: "Membership Activated",
    subject: "Your {{plan_name}} plan is now active!",
    bodyHtml: "<p>Dear {{user_name}},</p><p>Your subscription to {{plan_name}} is now active. Enjoy premium features!</p>",
    bodyText: "Dear {{user_name}}, Your subscription to {{plan_name}} is active.",
    placeholders: ["website_name", "user_name", "plan_name"],
  },
  {
    slug: "membership-expiring",
    name: "Membership Expiring",
    subject: "Your {{website_name}} plan expires in {{days}} days",
    bodyHtml: "<p>Dear {{user_name}},</p><p>Your {{plan_name}} subscription will expire in {{days}} days. Renew now to stay connected.</p>",
    bodyText: "Dear {{user_name}}, Your subscription expires in {{days}} days.",
    placeholders: ["website_name", "user_name", "plan_name", "days"],
  },
  {
    slug: "payment-submitted",
    name: "Payment Submitted",
    subject: "Payment received under review - {{website_name}}",
    bodyHtml: "<p>Dear {{user_name}},</p><p>We received your payment reference {{utr_number}} of {{amount}}. It is undergoing verification.</p>",
    bodyText: "Dear {{user_name}}, Payment reference {{utr_number}} of {{amount}} is under verification.",
    placeholders: ["website_name", "user_name", "utr_number", "amount"],
  },
  {
    slug: "payment-approved",
    name: "Payment Approved",
    subject: "Payment Approved - {{website_name}}",
    bodyHtml: "<p>Dear {{user_name}},</p><p>Your payment of {{amount}} has been approved and your membership updated.</p>",
    bodyText: "Dear {{user_name}}, Payment of {{amount}} approved.",
    placeholders: ["website_name", "user_name", "amount"],
  },
  {
    slug: "payment-rejected",
    name: "Payment Rejected",
    subject: "Payment Rejected - {{website_name}}",
    bodyHtml: "<p>Dear {{user_name}},</p><p>Your payment request was rejected. Reason: {{reason}}</p>",
    bodyText: "Dear {{user_name}}, Payment rejected. Reason: {{reason}}",
    placeholders: ["website_name", "user_name", "reason"],
  },
  {
    slug: "concierge-update",
    name: "Concierge Status Update",
    subject: "Executive Concierge Update - {{website_name}}",
    bodyHtml: "<p>Dear {{user_name}},</p><p>Concierge update: {{update_content}}</p>",
    bodyText: "Dear {{user_name}}, Concierge update: {{update_content}}",
    placeholders: ["website_name", "user_name", "update_content"],
  },
];

export class EmailTemplateService {
  async seedTemplates(): Promise<Result<void>> {
    try {
      for (const t of DEFAULT_EMAIL_TEMPLATES) {
        const existing = await prisma.emailTemplate.findUnique({ where: { slug: t.slug } });
        if (!existing) {
          await prisma.emailTemplate.create({
            data: {
              slug: t.slug,
              name: t.name,
              subject: t.subject,
              bodyHtml: t.bodyHtml,
              bodyText: t.bodyText,
              placeholders: t.placeholders,
            },
          });
        }
      }
      return returnSuccess(undefined);
    } catch (e: any) {
      return returnFailure(e.message, "TEMPLATE_SEED_ERROR");
    }
  }

  async getTemplates(): Promise<Result<any[]>> {
    try {
      await this.seedTemplates();
      const templates = await prisma.emailTemplate.findMany({ orderBy: { name: "asc" } });
      return returnSuccess(templates);
    } catch (e: any) {
      return returnFailure(e.message, "GET_TEMPLATES_ERROR");
    }
  }

  async getTemplateBySlug(slug: string): Promise<Result<any>> {
    try {
      const template = await prisma.emailTemplate.findUnique({ where: { slug }, include: { versions: { orderBy: { version: "desc" } } } });
      if (!template) return returnFailure("Template not found", "TEMPLATE_NOT_FOUND");
      return returnSuccess(template);
    } catch (e: any) {
      return returnFailure(e.message, "GET_TEMPLATE_ERROR");
    }
  }

  async updateTemplate(id: string, subject: string, bodyHtml: string, bodyText: string, updatedById?: string): Promise<Result<any>> {
    try {
      const current = await prisma.emailTemplate.findUnique({ where: { id } });
      if (!current) return returnFailure("Template not found", "TEMPLATE_NOT_FOUND");

      // Create snapshot version
      await prisma.emailTemplateVersion.create({
        data: {
          templateId: id,
          subject: current.subject,
          bodyHtml: current.bodyHtml,
          bodyText: current.bodyText,
          version: current.version,
          createdById: updatedById,
        },
      });

      const updated = await prisma.emailTemplate.update({
        where: { id },
        data: {
          subject,
          bodyHtml,
          bodyText,
          version: current.version + 1,
        },
      });

      return returnSuccess(updated);
    } catch (e: any) {
      return returnFailure(e.message, "UPDATE_TEMPLATE_ERROR");
    }
  }

  async sendTestEmail(slug: string, testRecipient: string): Promise<Result<void>> {
    try {
      const tRes = await this.getTemplateBySlug(slug);
      if (!tRes.success) return tRes;
      const t = tRes.data;

      const dummyVars: Record<string, string> = {
        website_name: "InstantMatrimony",
        user_name: "John Doe",
        verification_link: "https://example.com/verify",
        reset_link: "https://example.com/reset",
        sender_name: "Priya Sharma",
        reason: "Photo quality issue",
        plan_name: "Gold VIP",
        days: "3",
        utr_number: "UTR123456789",
        amount: "₹2,999",
        update_content: "Meeting scheduled with family.",
      };

      let html = t.bodyHtml;
      let subject = t.subject;
      for (const [k, v] of Object.entries(dummyVars)) {
        html = html.replaceAll(`{{${k}}}`, v);
        subject = subject.replaceAll(`{{${k}}}`, v);
      }

      await emailService.sendEmail({
        to: testRecipient,
        subject: `[TEST] ${subject}`,
        html,
      });

      return returnSuccess(undefined);
    } catch (e: any) {
      return returnFailure(e.message, "SEND_TEST_EMAIL_ERROR");
    }
  }

  renderTemplate(subjectTemplate: string, bodyHtmlTemplate: string, variables: Record<string, string>): { subject: string; html: string } {
    let subject = subjectTemplate;
    let html = bodyHtmlTemplate;
    for (const [k, v] of Object.entries(variables)) {
      subject = subject.replaceAll(`{{${k}}}`, v || "");
      html = html.replaceAll(`{{${k}}}`, v || "");
    }
    return { subject, html };
  }
}

export const emailTemplateService = new EmailTemplateService();
