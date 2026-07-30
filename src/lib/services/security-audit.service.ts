import { BaseService } from "./base.service";
import { Result } from "../result";
import { IAuditRepository } from "../repositories/interfaces/audit.repository";
import { loggerService } from "./logger.service";

export class SecurityAuditService extends BaseService {
  constructor(private auditRepository: IAuditRepository) {
    super();
  }

  private async logSecurityEvent(
    userId: string | null,
    action: string,
    ipAddress?: string,
    userAgent?: string,
    details?: string
  ): Promise<Result<any>> {
    try {
      const log = await this.auditRepository.create(userId, action, ipAddress, userAgent, details);
      loggerService.info(`Security Audit Log [${action}] created`, { userId, action, ipAddress, userAgent });
      return this.returnSuccess(log);
    } catch (e: any) {
      loggerService.error(`Failed to create security audit log [${action}]`, { userId }, e);
      return this.returnFailure(e.message, "SECURITY_AUDIT_LOG_ERROR");
    }
  }

  async logLogin(userId: string, ip?: string, ua?: string): Promise<Result<any>> {
    return this.logSecurityEvent(userId, "SECURITY_LOGIN", ip, ua, "User logged in successfully");
  }

  async logLogout(userId: string, ip?: string, ua?: string): Promise<Result<any>> {
    return this.logSecurityEvent(userId, "SECURITY_LOGOUT", ip, ua, "User logged out successfully");
  }

  async logPasswordReset(userId: string, ip?: string, ua?: string): Promise<Result<any>> {
    return this.logSecurityEvent(userId, "SECURITY_PASSWORD_RESET", ip, ua, "Password reset event completed");
  }

  async logPayment(userId: string, orderId: string, amount: number, ip?: string, ua?: string): Promise<Result<any>> {
    return this.logSecurityEvent(
      userId,
      "SECURITY_PAYMENT_SUCCESS",
      ip,
      ua,
      JSON.stringify({ orderId, amount })
    );
  }

  async logAdminModeration(
    adminId: string,
    targetId: string,
    action: string,
    reason?: string,
    ip?: string,
    ua?: string
  ): Promise<Result<any>> {
    return this.logSecurityEvent(
      adminId,
      "SECURITY_ADMIN_MODERATION",
      ip,
      ua,
      JSON.stringify({ targetId, action, reason })
    );
  }

  async logFeatureFlagChange(
    adminId: string,
    flagKey: string,
    oldVal: string,
    newVal: string,
    ip?: string,
    ua?: string
  ): Promise<Result<any>> {
    return this.logSecurityEvent(
      adminId,
      "SECURITY_FEATURE_FLAG_CHANGE",
      ip,
      ua,
      JSON.stringify({ flagKey, oldVal, newVal })
    );
  }

  async logCmsEdit(adminId: string, pageSlug: string, action: string, ip?: string, ua?: string): Promise<Result<any>> {
    return this.logSecurityEvent(
      adminId,
      "SECURITY_CMS_EDIT",
      ip,
      ua,
      JSON.stringify({ pageSlug, action })
    );
  }

  async logVerificationApproval(
    adminId: string,
    userId: string,
    status: string,
    ip?: string,
    ua?: string
  ): Promise<Result<any>> {
    return this.logSecurityEvent(
      adminId,
      "SECURITY_VERIFICATION_APPROVAL",
      ip,
      ua,
      JSON.stringify({ targetUserId: userId, status })
    );
  }
}
