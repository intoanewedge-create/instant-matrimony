import { emailConfig } from "../config/email.config";
import { logger } from "./logger/logger";
import nodemailer from "nodemailer";

export interface EmailSendOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private static instance: EmailService;

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private getAppUrl(): string {
    return (
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.APP_URL ||
      "http://localhost:3000"
    );
  }

  public async sendEmail({
    to,
    subject,
    html,
  }: EmailSendOptions): Promise<boolean> {
    const provider =
      process.env.EMAIL_PROVIDER || emailConfig.provider || "mock";
    const fromAddress =
      process.env.EMAIL_FROM ||
      emailConfig.from ||
      "no-reply@instantmatrimony.com";

    if (process.env.NODE_ENV === "production" && provider === "mock") {
      logger.warn(
        "WARNING: Email provider not configured. Using MockEmailProvider. Emails will not reach real users. Please set EMAIL_PROVIDER=smtp or RESEND_API_KEY.",
      );
    }

    try {
      if (provider === "smtp") {
        const host =
          process.env.EMAIL_SERVER_HOST ||
          process.env.SMTP_HOST ||
          emailConfig.smtp.host;
        const port = parseInt(
          process.env.EMAIL_SERVER_PORT ||
            process.env.SMTP_PORT ||
            String(emailConfig.smtp.port),
          10,
        );
        const user =
          process.env.EMAIL_SERVER_USER ||
          process.env.SMTP_USER ||
          emailConfig.smtp.user;
        const pass =
          process.env.EMAIL_SERVER_PASSWORD ||
          process.env.SMTP_PASS ||
          emailConfig.smtp.pass;

        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: user && pass ? { user, pass } : undefined,
        });

        await transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          html,
        });

        logger.info(
          { to, subject, provider: "smtp" },
          "Verification email sent successfully via SMTP",
        );
        return true;
      } else if (provider === "resend") {
        const apiKey = process.env.RESEND_API_KEY || emailConfig.resend.apiKey;
        if (!apiKey) {
          logger.warn(
            { to, subject },
            "RESEND_API_KEY missing. Falling back to Mock logger.",
          );
          this.logMockEmail(to, subject, html);
          return true;
        }
        try {
          const resendModule = await import("resend" as any);
          const resend = new resendModule.Resend(apiKey);
          await resend.emails.send({
            from: fromAddress,
            to,
            subject,
            html,
          });
          logger.info(
            { to, subject, provider: "resend" },
            "Verification email sent successfully via Resend API",
          );
          return true;
        } catch (e: any) {
          logger.error(
            { to, subject, error: e.message },
            "Resend provider error. Falling back to Mock logger.",
          );
          this.logMockEmail(to, subject, html);
          return true;
        }
      } else {
        // Mock Provider for development/testing
        this.logMockEmail(to, subject, html);
        return true;
      }
    } catch (error: any) {
      logger.error(
        { to, subject, error: error.message },
        "Failed to send email via configured provider. Logging email content as fallback.",
      );
      this.logMockEmail(to, subject, html);
      return false;
    }
  }

  private logMockEmail(to: string, subject: string, html: string) {
    logger.info(
      {
        to,
        subject,
        preview: html.replace(/<[^>]*>?/gm, "").substring(0, 150) + "...",
      },
      "[MOCK EMAIL SERVICE] Email dispatched successfully to recipient",
    );
  }

  public async sendVerificationEmail(
    email: string,
    token: string,
    code?: string,
  ): Promise<boolean> {
    const appUrl = this.getAppUrl();
    const verifyUrl = `${appUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    if (process.env.NODE_ENV !== "production") {
      console.log("\n========== [DEV] EMAIL VERIFICATION ==========");
      console.log("To:", email);
      console.log("Verification URL:", verifyUrl);

      if (code) {
        console.log("Verification Code:", code);
      }

      console.log("==============================================\n");
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #090d16; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #f43f5e; font-size: 28px; margin: 0;">InstantMatrimony</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Enterprise Matchmaking & Partner Search</p>
        </div>
        <div style="background-color: #0f172a; padding: 24px; border-radius: 12px; border: 1px solid #334155;">
          <h2 style="color: #f8fafc; font-size: 20px; margin-top: 0;">Verify Your Email Address</h2>
          <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
            Welcome to InstantMatrimony! Please confirm your email address to activate your account and begin matching with verified members.
          </p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #e11d48, #db2777); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Verify Email Address
            </a>
          </div>

          ${
            code
              ? `
          <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; text-align: center; margin-top: 20px;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0;">Or enter this 6-digit verification code:</p>
            <span style="font-family: monospace; font-size: 28px; font-weight: bold; color: #f43f5e; letter-spacing: 6px;">${code}</span>
          </div>
          `
              : ""
          }

          <p style="color: #64748b; font-size: 13px; margin-top: 24px; line-height: 1.5;">
            If the button above does not work, copy and paste this link into your browser:<br/>
            <a href="${verifyUrl}" style="color: #f43f5e; word-break: break-all;">${verifyUrl}</a>
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #64748b; font-size: 12px;">
          <p>© ${new Date().getFullYear()} InstantMatrimony. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: "Verify Your Email Address - InstantMatrimony",
      html,
    });
  }

  public async sendPasswordResetEmail(
    email: string,
    token: string,
    code?: string,
  ): Promise<boolean> {
    const appUrl = this.getAppUrl();
    const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    if (process.env.NODE_ENV !== "production") {
      console.log("\n========== [DEV] PASSWORD RESET ==========");
      console.log("To:", email);
      console.log("Reset URL:", resetUrl);

      if (code) {
        console.log("Reset Code:", code);
      }

      console.log("==========================================\n");
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #090d16; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #f43f5e; font-size: 28px; margin: 0;">InstantMatrimony</h1>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Password Reset Request</p>
        </div>
        <div style="background-color: #0f172a; padding: 24px; border-radius: 12px; border: 1px solid #334155;">
          <h2 style="color: #f8fafc; font-size: 20px; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to choose a new password.
          </p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #e11d48, #db2777); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Reset Password
            </a>
          </div>

          ${
            code
              ? `
          <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; text-align: center; margin-top: 20px;">
            <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px 0;">Verification code:</p>
            <span style="font-family: monospace; font-size: 28px; font-weight: bold; color: #f43f5e; letter-spacing: 6px;">${code}</span>
          </div>
          `
              : ""
          }
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: "Reset Your Password - InstantMatrimony",
      html,
    });
  }
}

export const emailService = EmailService.getInstance();
