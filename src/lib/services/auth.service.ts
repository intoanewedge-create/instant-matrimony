import { BaseService } from "./base.service";
import { Result } from "../result";
import { IUserRepository } from "../repositories/interfaces/user.repository";
import { IProfileRepository } from "../repositories/interfaces/profile.repository";
import { IUserSessionHistoryRepository } from "../repositories/interfaces/user-session-history.repository";
import { OtpService } from "./otp.service";
import { EmailProvider } from "../email/email-provider";
import { hashPassword, verifyPassword } from "../utils/crypto";
import { resetPasswordTemplate } from "../email/templates";
import { logger } from "../logger/logger";
import { assignPublicId } from "../utils/public-id";

export class AuthService extends BaseService {
  constructor(
    private userRepository: IUserRepository,
    private profileRepository: IProfileRepository,
    private sessionHistoryRepository: IUserSessionHistoryRepository,
    private otpService: OtpService,
    private emailProvider: EmailProvider
  ) {
    super();
  }

  async register(data: { email: string; password?: string; name: string; phone?: string }): Promise<Result<any>> {
    try {
      const normalizedEmail = data.email?.trim().toLowerCase();
      if (!normalizedEmail) {
        return this.returnFailure("A valid email address is required.", "INVALID_EMAIL");
      }

      const existingEmail = await this.userRepository.findByEmail(normalizedEmail);
      if (existingEmail) {
        return this.returnFailure(
          "An account with this email already exists. Please use a different email or log in to your existing account.",
          "DUPLICATE_EMAIL"
        );
      }

      const normalizedPhone = data.phone?.trim() ? data.phone.trim() : null;
      if (!normalizedPhone) {
        return this.returnFailure(
          "Phone number is required for account verification.",
          "REQUIRED_PHONE"
        );
      }

      const existingPhone = await this.userRepository.findByPhone(normalizedPhone);
      if (existingPhone) {
        return this.returnFailure(
          "An account with this phone number already exists. Please use a different phone number or log in to your existing account.",
          "DUPLICATE_PHONE"
        );
      }

      const hashedPassword = await hashPassword(data.password || "Password@123");
      const { emailService } = await import("../email");
      const cryptoModule = await import("crypto");
      const verificationToken = cryptoModule.randomBytes(32).toString("hex");
      const tokenHash = cryptoModule.createHash("sha256").update(verificationToken).digest("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const user = await this.executeTransaction(async (tx) => {
        // In the same transaction: safely archive any soft-deleted account holding this email/phone to free unique constraints
        const deletedUsersWithEmail = await tx.user.findMany({
          where: {
            email: { equals: normalizedEmail, mode: "insensitive" },
            deletedAt: { not: null },
          },
        });

        for (const delUser of deletedUsersWithEmail) {
          const timestamp = Date.now();
          const cleanId = delUser.id.replace(/-/g, "").slice(0, 8);
          const anonymizedEmail = `deleted_${timestamp}_${cleanId}_${delUser.email}`;
          await tx.user.update({
            where: { id: delUser.id },
            data: { email: anonymizedEmail },
          });
        }

        if (normalizedPhone) {
          const phoneVariants = [normalizedPhone];
          if (normalizedPhone.startsWith("+91")) {
            phoneVariants.push(normalizedPhone.slice(3).trim());
          } else if (normalizedPhone.length === 10) {
            phoneVariants.push(`+91${normalizedPhone}`);
          }

          const deletedUsersWithPhone = await tx.user.findMany({
            where: {
              phone: { in: phoneVariants },
              deletedAt: { not: null },
            },
          });

          for (const delUser of deletedUsersWithPhone) {
            const timestamp = Date.now();
            const cleanId = delUser.id.replace(/-/g, "").slice(0, 8);
            const anonymizedPhone = `deleted_${timestamp}_${cleanId}_${delUser.phone}`;
            await tx.user.update({
              where: { id: delUser.id },
              data: { phone: anonymizedPhone },
            });
          }
        }

        const newUser = await tx.user.create({
          data: {
            email: normalizedEmail,
            password: hashedPassword,
            name: data.name?.trim() || "User",
            phone: normalizedPhone,
            role: "USER",
            isEmailVerified: true,
            emailVerified: new Date(),
            isPhoneVerified: false,
          },
        });

        await tx.profile.create({
          data: {
            userId: newUser.id,
            status: "DRAFT",
            completionPercent: 0,
          },
        });

        // Store VerificationToken with SHA-256 tokenHash
        await tx.verificationToken.create({
          data: {
            identifier: normalizedEmail,
            token: verificationToken,
            tokenHash: tokenHash,
            expires: expiresAt,
          },
        });

        return newUser;
      });

      // Safely assign unique public Profile ID (IM########) after main registration transaction
      // Gracefully handles missing column if DB migration hasn't run on production yet
      try {
        const { prisma } = await import("../prisma");
        await assignPublicId(prisma, user.id);
      } catch (err: any) {
        logger.warn({ err: err.message, userId: user.id }, "Skipped publicId assignment (DB schema migration may be pending)");
      }

      // Trigger 6-digit OTP generation and get the code
      const otpRes = await this.otpService.sendVerificationOtp(normalizedEmail, "EMAIL_VERIFICATION", "email");
      const otpCode = (otpRes as any).data?.code;

      // Send branded verification email containing link and 6-digit code
      emailService.sendVerificationEmail(normalizedEmail, verificationToken, otpCode)
        .catch(err => logger.error({ err: err.message }, "Failed to send verification email"));

      return this.returnSuccess({ ...user, verificationToken });
    } catch (e: any) {
      logger.error({ err: e.message, code: e.code }, "Registration error occurred");
      if (
        e.code === "P2002" ||
        e.message?.includes("Unique constraint failed") ||
        e.message?.includes("(phone)") ||
        e.message?.includes("(email)")
      ) {
        if (e.meta?.target?.includes("phone") || e.message?.includes("phone")) {
          return this.returnFailure(
            "An account with this phone number already exists. Please use a different phone number or log in to your existing account.",
            "DUPLICATE_PHONE"
          );
        }
        if (e.meta?.target?.includes("email") || e.message?.includes("email")) {
          return this.returnFailure(
            "An account with this email already exists. Please use a different email or log in to your existing account.",
            "DUPLICATE_EMAIL"
          );
        }
      }
      return this.returnFailure(
        "Registration failed. Please check your details and try again.",
        "REGISTRATION_ERROR"
      );
    }
  }

  async verifyEmailByToken(email: string, token: string): Promise<Result<boolean>> {
    try {
      const { prisma } = await import("../prisma");
      const cryptoModule = await import("crypto");
      const incomingHash = cryptoModule.createHash("sha256").update(token).digest("hex");

      const record = await prisma.verificationToken.findFirst({
        where: {
          identifier: email,
          OR: [
            { token: token },
            { tokenHash: incomingHash }
          ]
        },
      });

      if (!record) {
        return this.returnFailure("Verification link is invalid or already used.", "INVALID_TOKEN");
      }

      if (new Date(record.expires) < new Date()) {
        await prisma.verificationToken.delete({ where: { id: record.id } }).catch(() => {});
        return this.returnFailure("Verification link has expired. Please request a new code.", "EXPIRED_TOKEN");
      }

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return this.returnFailure("User not found.", "USER_NOT_FOUND");
      }

      await this.userRepository.update(user.id, {
        isEmailVerified: true,
        emailVerified: new Date(),
      });

      // Delete used token
      await prisma.verificationToken.delete({ where: { id: record.id } }).catch(() => {});
      logger.info({ userId: user.id, email }, "User email verified via link token successfully");

      return this.returnSuccess(true);
    } catch (e: any) {
      return this.returnFailure(e.message, "TOKEN_VERIFICATION_ERROR");
    }
  }

  async verifyEmail(email: string, code: string): Promise<Result<boolean>> {
    try {
      const verifyResult = await this.otpService.verifyOtp(email, code, "EMAIL_VERIFICATION");
      if (!verifyResult.success) {
        return verifyResult;
      }

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return this.returnFailure("User not found.", "USER_NOT_FOUND");
      }

      await this.userRepository.update(user.id, {
        isEmailVerified: true,
        emailVerified: new Date(),
      });
      logger.info({ userId: user.id }, "User email verified successfully");

      return this.returnSuccess(true);
    } catch (e: any) {
      return this.returnFailure(e.message, "EMAIL_VERIFICATION_ERROR");
    }
  }

  async verifyPhone(phone: string, code: string): Promise<Result<boolean>> {
    try {
      const verifyResult = await this.otpService.verifyOtp(phone, code, "PHONE_VERIFICATION");
      if (!verifyResult.success) {
        return verifyResult;
      }

      const user = await this.userRepository.findByPhone(phone);
      if (!user) {
        return this.returnFailure("User not found.", "USER_NOT_FOUND");
      }

      await this.userRepository.update(user.id, { isPhoneVerified: true });
      logger.info({ userId: user.id }, "User phone verified successfully");

      return this.returnSuccess(true);
    } catch (e: any) {
      return this.returnFailure(e.message, "PHONE_VERIFICATION_ERROR");
    }
  }

  async forgotPassword(email: string): Promise<Result<boolean>> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        // Return generic success to prevent email/account enumeration
        logger.info({ email }, "Forgot password requested for non-existent email");
        return this.returnSuccess(true);
      }

      const cryptoModule = await import("crypto");
      const resetToken = cryptoModule.randomBytes(32).toString("hex");
      const tokenHash = cryptoModule.createHash("sha256").update(resetToken).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      const { prisma } = await import("../prisma");
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: resetToken,
          tokenHash: tokenHash,
          expires: expiresAt,
        },
      }).catch((err) => logger.warn({ err: err.message }, "Could not store reset verification token"));

      const otpResult = await this.otpService.sendVerificationOtp(email, "PASSWORD_RESET", "email");
      const otpCode = (otpResult as any).data?.code;

      const { emailService } = await import("../email");
      emailService.sendPasswordResetEmail(email, resetToken, otpCode)
        .catch(err => logger.error({ err: err.message }, "Failed to send password reset email"));

      return this.returnSuccess(true);
    } catch (e: any) {
      return this.returnFailure(e.message, "FORGOT_PASSWORD_ERROR");
    }
  }

  async resetPassword(email: string, code: string, passwordNew: string): Promise<Result<boolean>> {
    try {
      const verifyResult = await this.otpService.verifyOtp(email, code, "PASSWORD_RESET");
      if (!verifyResult.success) {
        return verifyResult;
      }

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return this.returnFailure("User not found.", "USER_NOT_FOUND");
      }

      const hashedPassword = await hashPassword(passwordNew);
      await this.userRepository.update(user.id, {
        password: hashedPassword,
        lastPasswordChangedAt: new Date(),
      });

      this.emailProvider.send(email, "Password Changed Successfully", resetPasswordTemplate(user.name || "User"))
        .catch(err => logger.error({ err: err.message }, "Failed to send reset confirmation email"));

      logger.info({ userId: user.id }, "Password reset completed successfully");
      return this.returnSuccess(true);
    } catch (e: any) {
      return this.returnFailure(e.message, "PASSWORD_RESET_ERROR");
    }
  }

  async changePassword(userId: string, passwordOld: string, passwordNew: string): Promise<Result<boolean>> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return this.returnFailure("User not found.", "USER_NOT_FOUND");
      }

      const isOldPasswordMatch = await verifyPassword(passwordOld, user.password);
      if (!isOldPasswordMatch) {
        return this.returnFailure("The current password you entered is incorrect.", "INVALID_CURRENT_PASSWORD");
      }

      const hashedPassword = await hashPassword(passwordNew);
      await this.userRepository.update(userId, {
        password: hashedPassword,
        lastPasswordChangedAt: new Date(),
      });

      this.emailProvider.send(user.email, "Password Changed Successfully", resetPasswordTemplate(user.name || "User"))
        .catch(err => logger.error({ err: err.message }, "Failed to send password change notification"));

      logger.info({ userId }, "Password changed successfully");
      return this.returnSuccess(true);
    } catch (e: any) {
      return this.returnFailure(e.message, "CHANGE_PASSWORD_ERROR");
    }
  }

  async logLoginSession(userId: string, data: { ipAddress?: string; userAgent?: string; deviceName?: string }): Promise<Result<any>> {
    try {
      const session = await this.sessionHistoryRepository.logLogin(userId, data);
      return this.returnSuccess(session);
    } catch (e: any) {
      return this.returnFailure(e.message, "SESSION_LOGIN_LOG_ERROR");
    }
  }

  async logLogoutSession(sessionId: string): Promise<Result<any>> {
    try {
      const session = await this.sessionHistoryRepository.logLogout(sessionId);
      return this.returnSuccess(session);
    } catch (e: any) {
      return this.returnFailure(e.message, "SESSION_LOGOUT_LOG_ERROR");
    }
  }

  async revokeSession(sessionId: string): Promise<Result<any>> {
    try {
      const session = await this.sessionHistoryRepository.revokeSession(sessionId);
      return this.returnSuccess(session);
    } catch (e: any) {
      return this.returnFailure(e.message, "SESSION_REVOCATION_ERROR");
    }
  }

  async getUserSessions(userId: string): Promise<Result<any[]>> {
    try {
      const sessions = await this.sessionHistoryRepository.getUserSessions(userId);
      return this.returnSuccess(sessions);
    } catch (e: any) {
      return this.returnFailure(e.message, "GET_USER_SESSIONS_ERROR");
    }
  }
}
