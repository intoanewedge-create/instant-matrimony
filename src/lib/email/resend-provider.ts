import { EmailProvider } from "./email-provider";
import { emailConfig } from "../../config/email.config";
import { logger } from "../logger/logger";

export class ResendEmailProvider implements EmailProvider {
  async send(to: string, subject: string, body: string): Promise<void> {
    const apiKey = emailConfig.resend.apiKey;
    if (!apiKey) {
      logger.info({ to, subject }, "[ResendEmailProvider (Mock)] API Key is missing. Simulating delivery.");
      return;
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailConfig.from,
          to: [to],
          subject,
          html: body,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error({ to, status: response.status, errorText }, "Resend API returned error response");
        throw new Error(`Resend API error: ${response.statusText}`);
      }

      logger.info({ to, subject }, "Email sent successfully via Resend API");
    } catch (error: any) {
      logger.error({ to, error: error.message }, "Failed to send email via Resend API");
      throw error;
    }
  }
}
