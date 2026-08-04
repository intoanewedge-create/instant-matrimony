"use server";

import { systemHealthService } from "../services/system-health.service";

export async function getSystemHealthAction() {
  return await systemHealthService.getHealthStatus();
}
