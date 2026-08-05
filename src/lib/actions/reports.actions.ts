"use server";

import { reportsAnalyticsService } from "../services/reports-analytics.service";
import { verifyActionPermission } from "./action-utils";
import { returnFailure } from "../result";

export async function getOverviewMetricsAction() {
  const permCheck = await verifyActionPermission("VIEW_ANALYTICS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  return await reportsAnalyticsService.getOverviewMetrics();
}

export async function getRevenueTrendAction(days: number = 30) {
  const permCheck = await verifyActionPermission("VIEW_ANALYTICS");
  if (!permCheck.success) {
    return returnFailure("Unauthorized access", "FORBIDDEN");
  }
  return await reportsAnalyticsService.getRevenueTrend(days);
}
