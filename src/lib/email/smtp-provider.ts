import { EmailProvider } from "./email-provider";
import { emailConfig } from "../../config/email.config";
import nodemailer from "nodemailer";
import { logger } from "../logger/logger";

export class SmtpEmailProvider implements EmailProvider {
  private transporter: nodemailer.Transporter;

  constructor() {
    const { host, port, user, pass } = emailConfig.smtp;
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async send(to: string, subject: string, body: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: emailConfig.from,
        to,
        subject,
        html: body,
      });
      logger.info({ to, subject }, "Email sent successfully via SMTP");
    } catch (error: any) {
      logger.error({ to, error: error.message }, "Failed to send email via SMTP");
      throw error;
    }
  }
}
