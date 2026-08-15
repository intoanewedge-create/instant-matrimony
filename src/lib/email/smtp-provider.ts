import { EmailProvider } from "./email-provider";
import { getEmailConfig } from "../../config/email.config";
import nodemailer from "nodemailer";
import { logger } from "../logger/logger";
import { getRecipientDomain } from "./email-utils";

export class SmtpEmailProvider implements EmailProvider {
  private getTransporter() {
    const config = getEmailConfig();
    const { host, port, secure, user, pass } = config.smtp;

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async send(to: string, subject: string, body: string): Promise<void> {
    const config = getEmailConfig();
    const fromAddress = config.from;
    const recipientDomain = getRecipientDomain(to);

    logger.info(
      {
        provider: "smtp",
        attempted: true,
        recipientDomain,
        sender: fromAddress,
        subject,
      },
      "Attempting email delivery via SMTP"
    );

    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html: body,
      });

      logger.info(
        {
          provider: "smtp",
          attempted: true,
          result: "SUCCESS",
          recipientDomain,
          sender: fromAddress,
          messageId: info?.messageId,
        },
        "Verification email delivered successfully via SMTP"
      );
    } catch (error: any) {
      logger.error(
        {
          provider: "smtp",
          attempted: true,
          result: "FAILED",
          recipientDomain,
          sender: fromAddress,
          error: error?.message || error,
        },
        "Failed to send email via SMTP"
      );
      throw error;
    }
  }
}
