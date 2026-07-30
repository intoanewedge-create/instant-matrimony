import { OtpProvider } from "./otp-provider";
import { EmailProvider } from "../email/email-provider";

export class EmailOtpProvider implements OtpProvider {
  constructor(private emailProvider: EmailProvider) {}

  async sendOtp(target: string, code: string): Promise<void> {
    const subject = "Your InstantMatrimony OTP Code";
    const body = `
      <div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #be123c;">Verify your identity</h2>
        <p>Please use the following One-Time Password (OTP) to complete your verification request. This OTP is valid for 10 minutes.</p>
        <div style="font-size: 28px; font-weight: bold; background: #fff1f2; color: #be123c; padding: 12px 24px; border-radius: 8px; display: inline-block; letter-spacing: 4px; border: 1px solid #ffe4e6;">
          ${code}
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 10px;">If you did not request this code, please ignore this email.</p>
      </div>
    `;
    await this.emailProvider.send(target, subject, body);
  }
}
