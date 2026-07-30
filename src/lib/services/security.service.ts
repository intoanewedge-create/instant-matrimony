import bcrypt from "bcryptjs";
import { BaseService } from "./base.service";
import { Result } from "../result";
import { IPasswordHistoryRepository } from "../repositories/interfaces/password-history.repository";
import { IAuditRepository } from "../repositories/interfaces/audit.repository";
import { IUserRepository } from "../repositories/interfaces/user.repository";
import { loggerService } from "./logger.service";

export class SecurityService extends BaseService {
  constructor(
    private passwordHistoryRepository: IPasswordHistoryRepository,
    private auditRepository: IAuditRepository,
    private userRepository: IUserRepository
  ) {
    super();
  }

  validatePasswordComplexity(password: string): Result<boolean> {
    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!complexityRegex.test(password)) {
      return this.returnFailure(
        "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
        "WEAK_PASSWORD"
      );
    }
    return this.returnSuccess(true);
  }

  async validatePasswordHistory(userId: string, newPasswordPlain: string): Promise<Result<boolean>> {
    try {
      const history = await this.passwordHistoryRepository.getByUserId(userId, 5);
      for (const entry of history) {
        const matches = await bcrypt.compare(newPasswordPlain, entry.password);
        if (matches) {
          return this.returnFailure(
            "You cannot reuse any of your last 5 passwords.",
            "PASSWORD_REUSE_FORBIDDEN"
          );
        }
      }
      return this.returnSuccess(true);
    } catch (e: any) {
      loggerService.error("Error checking password history", { userId }, e);
      return this.returnFailure(e.message, "PASSWORD_HISTORY_VALIDATION_ERROR");
    }
  }

  async savePasswordHistory(userId: string, hashedNewPassword: string, tx?: any): Promise<Result<boolean>> {
    try {
      await this.passwordHistoryRepository.create(userId, hashedNewPassword, tx);
      await this.passwordHistoryRepository.deleteOldest(userId, 5, tx);
      return this.returnSuccess(true);
    } catch (e: any) {
      loggerService.error("Error saving password history", { userId }, e);
      return this.returnFailure(e.message, "PASSWORD_HISTORY_SAVE_ERROR");
    }
  }

  async updatePassword(
    userId: string,
    newPasswordPlain: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<Result<boolean>> {
    const complexityCheck = this.validatePasswordComplexity(newPasswordPlain);
    if (!complexityCheck.success) {
      return this.returnFailure(complexityCheck.error || "Weak password", complexityCheck.code);
    }

    const historyCheck = await this.validatePasswordHistory(userId, newPasswordPlain);
    if (!historyCheck.success) {
      return this.returnFailure(historyCheck.error || "Password reuse forbidden", historyCheck.code);
    }

    try {
      const hashedPassword = await bcrypt.hash(newPasswordPlain, 10);
      await this.executeTransaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: {
            password: hashedPassword,
            lastPasswordChangedAt: new Date(),
          },
        });

        await this.passwordHistoryRepository.create(userId, hashedPassword, tx);
        await this.passwordHistoryRepository.deleteOldest(userId, 5, tx);

        await this.auditRepository.create(
          userId,
          "PASSWORD_CHANGED",
          ipAddress || undefined,
          userAgent || undefined,
          "Password updated successfully inside transaction",
          tx
        );
      });

      return this.returnSuccess(true);
    } catch (e: any) {
      loggerService.error("Password update transaction failed", { userId }, e);
      return this.returnFailure(e.message, "PASSWORD_UPDATE_FAILED");
    }
  }
}
