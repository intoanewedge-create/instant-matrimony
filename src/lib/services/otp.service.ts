import { BaseService } from "./base.service";
import { Result } from "../result";
import { IVerificationOtpRepository } from "../repositories/interfaces/verification-otp.repository";
import { OtpProvider } from "../otp/otp-provider";
import crypto from "crypto";

export class OtpService extends BaseService {
  constructor(
    private otpRepository: IVerificationOtpRepository,
    private emailOtpProvider: OtpProvider,
    private smsOtpProvider: OtpProvider,
  ) {
    super();
  }

  private hashCode(code: string): string {
    return crypto.createHash("sha256").update(code).digest("hex");
  }

  async sendVerificationOtp(
    target: string,
    purpose: string,
    type: "email" | "sms",
  ): Promise<Result<any>> {
    try {
      // 1. Rate limiting check (60 seconds)
      const latest = await this.otpRepository.findLatest(target, purpose);

      if (
        latest &&
        !latest.verified &&
        Date.now() - latest.createdAt.getTime() < 60000
      ) {
        return this.returnFailure(
          "Please wait 60 seconds before requesting a new OTP.",
          "RATE_LIMIT_EXCEEDED",
        );
      }

      // 2. Generate secure 6-digit OTP
      const code = crypto.randomInt(100000, 999999).toString();
      const hashedCode = this.hashCode(code);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // 3. Save OTP
      await this.otpRepository.create({
        target,
        purpose,
        hashedCode,
        expiresAt,
      });

      // 4. Send OTP
      if (type === "email") {
        await this.emailOtpProvider.sendOtp(target, code);
      } else {
        await this.smsOtpProvider.sendOtp(target, code);
      }

      // Development logging
      if (process.env.NODE_ENV !== "production") {
        console.log(`\n========== [DEV] OTP (${purpose}) ==========`);
        console.log("Target:", target);
        console.log("Code:", code);
        console.log("Expires:", expiresAt.toISOString());
        console.log("=============================================\n");
      }

      return this.returnSuccess({ code });
    } catch (e: any) {
      return this.returnFailure(
        e.message ?? "Failed to generate OTP.",
        "OTP_GENERATION_FAILED",
      );
    }
  }

  async verifyOtp(
    target: string,
    code: string,
    purpose: string,
  ): Promise<Result<boolean>> {
    try {
      const latest = await this.otpRepository.findLatest(target, purpose);

      if (!latest || latest.verified) {
        return this.returnFailure(
          "No active verification code found.",
          "OTP_NOT_FOUND",
        );
      }

      // Check expiry
      if (Date.now() > latest.expiresAt.getTime()) {
        return this.returnFailure(
          "OTP code has expired. Please request a new one.",
          "OTP_EXPIRED",
        );
      }

      // Maximum attempts
      if (latest.attempts >= 3) {
        return this.returnFailure(
          "Too many incorrect attempts. Please request a new OTP.",
          "OTP_ATTEMPTS_EXCEEDED",
        );
      }

      // Verify code
      const hashedInput = this.hashCode(code);

      if (latest.hashedCode !== hashedInput) {
        await this.otpRepository.incrementAttempts(latest.id);

        const remaining = 3 - (latest.attempts + 1);

        if (remaining <= 0) {
          return this.returnFailure(
            "Too many incorrect attempts. Please request a new OTP.",
            "OTP_ATTEMPTS_EXCEEDED",
          );
        }

        return this.returnFailure(
          `Incorrect code. You have ${remaining} attempts remaining.`,
          "OTP_INVALID",
        );
      }

      // Mark OTP as verified
      await this.otpRepository.markAsVerified(latest.id);

      return this.returnSuccess(true);
    } catch (e: any) {
      return this.returnFailure(
        e.message ?? "Failed to verify OTP.",
        "OTP_VERIFICATION_FAILED",
      );
    }
  }
}
