import { AuditLog } from "@prisma/client";

export interface IAuditRepository {
  create(userId: string | null, action: string, ipAddress?: string, userAgent?: string, details?: string, tx?: any): Promise<AuditLog>;
  findLogs(params: { userId?: string; action?: string; cursor?: string; limit: number }): Promise<AuditLog[]>;
}
