import { OtpProvider } from "./otp-provider";
import { EmailProvider } from "../email/email-provider";

export class EmailOtpProvider implements OtpProvider {
  constructor(private emailProvider: EmailProvider) {}

  async sendOtp(target: string, code: string): Promise<void> {
    const subject = "Verify your InstantMatrimony account";
    const body = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px 24px; color: #0f172a; max-width: 540px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #e11d48; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">InstantMatrimony</h1>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Enterprise Matchmaking & Partner Search</p>
        </div>
        <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
          <p style="font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 12px 0;">Hello,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155; margin: 0 0 20px 0;">
            Thank you for registering with <strong>InstantMatrimony</strong>. Please use the following 6-digit verification code to complete your registration and activate your account:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <div style="font-size: 34px; font-weight: 800; font-family: monospace; background: #fff1f2; color: #e11d48; padding: 14px 28px; border-radius: 12px; display: inline-block; letter-spacing: 8px; border: 1px solid #fecdd3;">
              ${code}
            </div>
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 20px 0 0 0;">
            ⏳ <strong>This verification code will expire in 10 minutes.</strong>
          </p>
          <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 12px 0 0 0;">
            If you did not create this account, you can safely ignore this email.
          </p>
        </div>
        <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #f1f5f9; text-align: center;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">
            Regards,<br/>
            <strong>InstantMatrimony Team</strong>
          </p>
        </div>
      </div>
    `;
    await this.emailProvider.send(target, subject, body);
  }
}
