import { logger } from "./logger";

export function logAudit(
  userId: string | null,
  action: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, any>
) {
  logger.info({
    userId,
    action,
    success,
    ipAddress,
    userAgent,
    metadata,
    event: "audit_log",
  }, `Audit Event: ${action} - Success: ${success}`);
}
