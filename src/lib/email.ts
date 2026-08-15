import { getEmailConfig } from "../config/email.config";
import { logger } from "./logger/logger";
import { getRecipientDomain } from "./email/email-utils";
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
      process.env.NEXTAUTH_URL ||
      process.env.AUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
      "http://localhost:3000"
    );
  }

  public async sendEmail({
    to,
    subject,
    html,
  }: EmailSendOptions): Promise<boolean> {
    const config = getEmailConfig();
    const provider = config.provider;
    const fromAddress = config.from;
    const recipientDomain = getRecipientDomain(to);

    if (process.env.NODE_ENV === "production" && provider === "mock") {
      logger.warn(
        {
          provider: "mock",
          recipientDomain,
          sender: fromAddress,
        },
        "WARNING: No active production email provider configured (Mock provider in use). Set RESEND_API_KEY or SMTP credentials in environment variables."
      );
    }

    logger.info(
      {
        provider,
        attempted: true,
        recipientDomain,
        sender: fromAddress,
        subject,
      },
      `Attempting email dispatch via ${provider.toUpperCase()}`
    );

    try {
      if (provider === "smtp") {
        const { host, port, secure, user, pass } = config.smtp;

        const transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: user && pass ? { user, pass } : undefined,
        });

        const info = await transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          html,
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
          "Verification email dispatched successfully via SMTP"
        );
        return true;
      } else if (provider === "resend") {
        const apiKey = config.resend.apiKey;
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
              "RESEND_API_KEY missing in production environment."
            );
            return false;
          }
          this.logMockEmail(to, subject, html);
          return true;
        }

        try {
          const resendModule = await import("resend" as any);
          const resend = new resendModule.Resend(apiKey);
          const { data, error } = await resend.emails.send({
            from: fromAddress,
            to: [to],
            subject,
            html,
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
              "Resend provider returned error response"
            );

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
                "Resend sandbox restriction: Production domain verification required at https://resend.com/domains to deliver to non-registered emails."
              );
            }

            if (process.env.NODE_ENV !== "production") {
              this.logMockEmail(to, subject, html);
            }
            return false;
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
          return true;
        } catch (e: any) {
          logger.error(
            {
              provider: "resend",
              attempted: true,
              result: "FAILED",
              recipientDomain,
              sender: fromAddress,
              error: e.message,
            },
            "Resend provider exception while sending email"
          );
          if (process.env.NODE_ENV !== "production") {
            this.logMockEmail(to, subject, html);
          }
          return false;
        }
      } else {
        // Mock Provider for development/testing
        this.logMockEmail(to, subject, html);
        return true;
      }
    } catch (error: any) {
      logger.error(
        {
          provider,
          attempted: true,
          result: "FAILED",
          recipientDomain,
          sender: fromAddress,
          error: error.message,
        },
        "Failed to send email via configured provider. Logging email content as fallback."
      );
      if (process.env.NODE_ENV !== "production") {
        this.logMockEmail(to, subject, html);
      }
      return false;
    }
  }

  private logMockEmail(to: string, subject: string, html: string) {
    const recipientDomain = getRecipientDomain(to);
    logger.info(
      {
        provider: "mock",
        attempted: true,
        result: "SIMULATED",
        recipientDomain,
        preview: html.replace(/<[^>]*>?/gm, "").substring(0, 120) + "...",
      },
      "[MOCK EMAIL SERVICE] Email dispatched successfully to recipient"
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
      console.log("To (masked):", email.replace(/^(.{2})(.*)(@.*)$/, "$1***$3"));
      console.log("Verification URL:", verifyUrl);

      if (code) {
        console.log("Verification Code:", code);
      }

      console.log("==============================================\n");
    }

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #ffffff; color: #0f172a; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #e11d48; font-size: 26px; font-weight: 800; margin: 0;">InstantMatrimony</h1>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Enterprise Matchmaking & Partner Search</p>
        </div>
        <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; font-size: 18px; margin-top: 0; font-weight: 700;">Verify Your Email Address</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            Welcome to <strong>InstantMatrimony</strong>! Please confirm your email address to activate your account and start matching with verified profiles.
          </p>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #e11d48, #db2777); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block;">
              Verify Email Address
            </a>
          </div>

          ${
            code
              ? `
          <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; text-align: center; margin-top: 20px; border: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">Or enter this 6-digit verification code:</p>
            <span style="font-family: monospace; font-size: 28px; font-weight: 800; color: #e11d48; letter-spacing: 6px;">${code}</span>
          </div>
          `
              : ""
          }

          <p style="color: #94a3b8; font-size: 12px; margin-top: 20px; line-height: 1.5;">
            If the button above does not work, copy and paste this link into your browser:<br/>
            <a href="${verifyUrl}" style="color: #e11d48; word-break: break-all;">${verifyUrl}</a>
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
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
      console.log("To (masked):", email.replace(/^(.{2})(.*)(@.*)$/, "$1***$3"));
      console.log("Reset URL:", resetUrl);

      if (code) {
        console.log("Reset Code:", code);
      }

      console.log("==========================================\n");
    }

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background-color: #ffffff; color: #0f172a; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #e11d48; font-size: 26px; font-weight: 800; margin: 0;">InstantMatrimony</h1>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Password Reset Request</p>
        </div>
        <div style="background-color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0f172a; font-size: 18px; margin-top: 0; font-weight: 700;">Reset Your Password</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to choose a new password.
          </p>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #e11d48, #db2777); color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block;">
              Reset Password
            </a>
          </div>

          ${
            code
              ? `
          <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; text-align: center; margin-top: 20px; border: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">Verification code:</p>
            <span style="font-family: monospace; font-size: 28px; font-weight: 800; color: #e11d48; letter-spacing: 6px;">${code}</span>
          </div>
          `
              : ""
          }
        </div>
        <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
          <p>© ${new Date().getFullYear()} InstantMatrimony. All rights reserved.</p>
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
