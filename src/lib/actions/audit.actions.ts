"use server";

import { container } from "../container";
import { verifyActionPermission } from "./action-utils";
import { returnFailure } from "../result";

export async function getAuditLogsAction(filters?: any) {
  const permCheck = await verifyActionPermission("MANAGE_SYSTEM");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  return await container.services.auditService.getLogs(filters);
}
