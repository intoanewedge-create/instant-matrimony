import { EmailProvider } from "./email-provider";
import { getEmailConfig } from "../../config/email.config";
import { logger } from "../logger/logger";
import { getRecipientDomain } from "./email-utils";

export class ResendEmailProvider implements EmailProvider {
  async send(to: string, subject: string, body: string): Promise<void> {
    const config = getEmailConfig();
    const apiKey = config.resend.apiKey;
    const fromAddress = config.from;
    const recipientDomain = getRecipientDomain(to);

    if (!apiKey) {
      if (process.env.NODE_ENV === "production") {
        logger.error(
          {
            provider: "resend",
            attempted: false,
            result: "CONFIG_ERROR",
            recipientDomain,
            sender: fromAddress,
          },
          "RESEND_API_KEY is not configured in the production environment."
        );
        throw new Error("Email service is currently unavailable. Please check server configuration.");
      }
      logger.info(
        {
          provider: "resend",
          attempted: false,
          result: "DEV_FALLBACK",
          recipientDomain,
          sender: fromAddress,
          subject,
        },
        "[ResendEmailProvider (Dev/Test)] API Key is missing. Simulating local delivery."
      );
      return;
    }

    logger.info(
      {
        provider: "resend",
        attempted: true,
        recipientDomain,
        sender: fromAddress,
        subject,
      },
      "Attempting email delivery via Resend API"
    );

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
        logger.error(
          {
            provider: "resend",
            attempted: true,
            result: "FAILED",
            recipientDomain,
            sender: fromAddress,
            error: error.message || error,
          },
          "Resend API returned error response"
        );

        // Handle Resend unverified sandbox restrictions
        if (
          error.message?.includes("testing emails to your own email address") ||
          (error as any).statusCode === 403 ||
          (error as any).statusCode === 422
        ) {
          logger.warn(
            {
              provider: "resend",
              attempted: true,
              result: "SANDBOX_RESTRICTION",
              recipientDomain,
              sender: fromAddress,
            },
            "Resend sandbox restriction detected: Production domain verification is required to send emails to arbitrary recipients. Verify your domain at https://resend.com/domains."
          );
          if (process.env.NODE_ENV !== "production") {
            return;
          }
          throw new Error("Resend production domain verification is required before arbitrary user email addresses can reliably receive verification emails.");
        }

        throw new Error(error.message || "Failed to send email via Resend API");
      }

      logger.info(
        {
          provider: "resend",
          attempted: true,
          result: "SUCCESS",
          recipientDomain,
          sender: fromAddress,
          messageId: data?.id,
        },
        "Verification email delivered successfully via Resend API"
      );
    } catch (error: any) {
      logger.error(
        {
          provider: "resend",
          attempted: true,
          result: "FAILED",
          recipientDomain,
          sender: fromAddress,
          error: error?.message || error,
        },
        "Failed to send email via Resend API"
      );
      if (process.env.NODE_ENV === "production") {
        throw error;
      }
    }
  }
}
