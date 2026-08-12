import { EmailProvider } from "./email-provider";
import { emailConfig } from "../../config/email.config";
import { logger } from "../logger/logger";

export class ResendEmailProvider implements EmailProvider {
  async send(to: string, subject: string, body: string): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY || emailConfig.resend.apiKey;
    if (!apiKey) {
      if (process.env.NODE_ENV === "production") {
        logger.error({ to, subject }, "RESEND_API_KEY is not configured in the production environment.");
        throw new Error("Email service is currently unavailable. Please check server configuration.");
      }
      logger.info({ to, subject }, "[ResendEmailProvider (Mock)] API Key is missing in development. Simulating delivery.");
      return;
    }

    // Always use configured InstantMatrimony sender or verified environment sender
    const fromAddress =
      process.env.EMAIL_FROM ||
      emailConfig.from ||
      "InstantMatrimony <noreply@instantmatrimony.com>";

    try {
      const resendModule = await import("resend" as any);
      const resend = new resendModule.Resend(apiKey);

      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject,
        html: body,
      });

      if (error) {
        logger.error({ to, error: error.message || error }, "Resend API returned error response");

        // If Resend is operating in sandbox mode with recipient restrictions
        if (
          error.message?.includes("testing emails to your own email address") ||
          (error as any).statusCode === 403 ||
          (error as any).statusCode === 422
        ) {
          logger.warn(
            { to, from: fromAddress },
            "Resend sandbox restriction detected: Production domain verification is required to send emails to arbitrary recipients."
          );
          if (process.env.NODE_ENV !== "production") {
            // In dev / test, log the email so development is not blocked
            logger.info(
              { to, subject, preview: body.replace(/<[^>]*>?/gm, "").substring(0, 150) + "..." },
              "[Resend Sandbox Dev Notice] Email logged locally."
            );
            return;
          }
          throw new Error("Resend production domain verification is required before arbitrary user email addresses can reliably receive verification emails.");
        }

        throw new Error(error.message || "Failed to send email via Resend API");
      }

      logger.info({ to, subject, id: data?.id }, "Verification email sent successfully via Resend API");
    } catch (error: any) {
      logger.error({ to, error: error?.message || error }, "Failed to send email via Resend API");
      if (process.env.NODE_ENV === "production") {
        throw error;
      }
    }
  }
}
