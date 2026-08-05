"use server";

import { systemHealthService } from "../services/system-health.service";
import { verifyActionPermission } from "./action-utils";
import { returnFailure } from "../result";

export async function getSystemHealthAction() {
  const permCheck = await verifyActionPermission("MANAGE_SYSTEM");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  return await systemHealthService.getHealthStatus();
}
