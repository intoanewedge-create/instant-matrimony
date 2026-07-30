import { BaseService } from "./base.service";
import { Result } from "../result";
import { IAuditRepository } from "../repositories/interfaces/audit.repository";

export class AuditService extends BaseService {
  constructor(private auditRepository: IAuditRepository) {
    super();
  }

  async log(
    userId: string | null,
    action: string,
    ipAddress?: string,
    userAgent?: string,
    details?: string
  ): Promise<Result<any>> {
    try {
      const log = await this.auditRepository.create(userId, action, ipAddress, userAgent, details);
      return this.returnSuccess(log);
    } catch (e: any) {
      return this.returnFailure(e.message, "AUDIT_LOG_ERROR");
    }
  }

  // Advanced audit logger method supporting change comparisons, roles, endpoints, and correlation tracking
  async logActionDetails(params: {
    userId: string | null;
    action: string;
    role?: string;
    ipAddress?: string;
    userAgent?: string;
    endpoint?: string;
    correlationId?: string;
    previousValues?: any;
    newValues?: any;
    message?: string;
  }): Promise<Result<any>> {
    try {
      const correlationId = params.correlationId || `corr_${Math.random().toString(36).substring(2, 15)}`;
      const payload = {
        message: params.message || "",
        role: params.role || "USER",
        endpoint: params.endpoint || "N/A",
        correlationId,
        previousValues: params.previousValues ? JSON.parse(JSON.stringify(params.previousValues)) : null,
        newValues: params.newValues ? JSON.parse(JSON.stringify(params.newValues)) : null,
      };

      const log = await this.auditRepository.create(
        params.userId,
        params.action,
        params.ipAddress || undefined,
        params.userAgent || undefined,
        JSON.stringify(payload)
      );

      return this.returnSuccess(log);
    } catch (e: any) {
      return this.returnFailure(e.message, "AUDIT_LOG_ADVANCED_ERROR");
    }
  }
}
