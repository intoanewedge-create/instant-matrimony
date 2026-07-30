import { BaseService } from "./base.service";
import { Result } from "../result";
import { IUserRepository } from "../repositories/interfaces/user.repository";
import { IProfileRepository } from "../repositories/interfaces/profile.repository";
import { IUserSessionHistoryRepository } from "../repositories/interfaces/user-session-history.repository";
import { OtpService } from "./otp.service";
import { EmailProvider } from "../email/email-provider";
import { hashPassword, verifyPassword } from "../utils/crypto";
import { welcomeTemplate, resetPasswordTemplate } from "../email/templates";
import { logger } from "../logger/logger";

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
      const existingEmail = await this.userRepository.findByEmail(data.email);
      if (existingEmail) {
        return this.returnFailure("An account with this email already exists.", "DUPLICATE_EMAIL");
      }

      if (data.phone) {
        const existingPhone = await this.userRepository.findByPhone(data.phone);
        if (existingPhone) {
          return this.returnFailure("An account with this phone number already exists.", "DUPLICATE_PHONE");
        }
      }

      const hashedPassword = await hashPassword(data.password || "Password@123");
      const { emailService } = await import("../email");
      const cryptoModule = await import("crypto");
      const verificationToken = cryptoModule.randomBytes(32).toString("hex");
      const tokenHash = cryptoModule.createHash("sha256").update(verificationToken).digest("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const user = await this.executeTransaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: data.email,
            password: hashedPassword,
            name: data.name,
            phone: data.phone,
            role: "USER",
            isEmailVerified: false,
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
            identifier: data.email,
            token: verificationToken,
            tokenHash: tokenHash,
            expires: expiresAt,
          },
        });

        return newUser;
      });

      // Trigger 6-digit OTP generation and get the code
      const otpRes = await this.otpService.sendVerificationOtp(data.email, "EMAIL_VERIFICATION", "email");
      const otpCode = (otpRes as any).data?.code;

      // Send branded verification email containing link and 6-digit code
      emailService.sendVerificationEmail(data.email, verificationToken, otpCode)
        .catch(err => logger.error({ err: err.message }, "Failed to send verification email"));

      return this.returnSuccess({ ...user, verificationToken });
    } catch (e: any) {
      return this.returnFailure(e.message, "REGISTRATION_ERROR");
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
        return this.returnFailure("No user account matches this email address.", "USER_NOT_FOUND");
      }

      const otpResult = await this.otpService.sendVerificationOtp(email, "PASSWORD_RESET", "email");
      if (!otpResult.success) {
        return otpResult;
      }

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
