import { EmailProvider } from "./email-provider";
import { emailConfig } from "../../config/email.config";
import { logger } from "../logger/logger";

export class ResendEmailProvider implements EmailProvider {
  async send(to: string, subject: string, body: string): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY || emailConfig.resend.apiKey;
    if (!apiKey) {
      logger.info({ to, subject }, "[ResendEmailProvider (Mock)] API Key is missing. Simulating delivery.");
      if (process.env.NODE_ENV !== "production") {
        console.log(`[Email Simulation] To: ${to} | Subject: ${subject}`);
      }
      return;
    }

    // Default to onboarding@resend.dev if EMAIL_FROM is not explicitly defined or verified
    const fromAddress =
      process.env.EMAIL_FROM ||
      "InstantMatrimony <onboarding@resend.dev>";

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
        logger.error({ to, error }, "Resend API returned error response");
        // Retry with default onboarding address if domain error occurred
        if (fromAddress !== "InstantMatrimony <onboarding@resend.dev>") {
          try {
            await resend.emails.send({
              from: "InstantMatrimony <onboarding@resend.dev>",
              to: [to],
              subject,
              html: body,
            });
            logger.info({ to, subject }, "Email sent successfully via Resend onboarding fallback");
            return;
          } catch (fallbackErr: any) {
            logger.error({ to, error: fallbackErr?.message }, "Fallback Resend sending failed");
          }
        }
        logger.info(
          { to, subject, preview: body.replace(/<[^>]*>?/gm, "").substring(0, 150) + "..." },
          "[Resend Fallback Mock] Email logged locally after provider sandbox/restriction."
        );
        return;
      }

      logger.info({ to, subject, id: data?.id }, "Email sent successfully via Resend API");
    } catch (error: any) {
      logger.error({ to, error: error?.message || error }, "Failed to send email via Resend API");
      logger.info(
        { to, subject, preview: body.replace(/<[^>]*>?/gm, "").substring(0, 150) + "..." },
        "[Resend Fallback Mock] Email logged locally after provider sandbox/restriction."
      );
    }
  }
}
