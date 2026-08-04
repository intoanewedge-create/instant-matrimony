"use server";

import { reportsAnalyticsService } from "../services/reports-analytics.service";

export async function getOverviewMetricsAction() {
  return await reportsAnalyticsService.getOverviewMetrics();
}

export async function getRevenueTrendAction(days: number = 30) {
  return await reportsAnalyticsService.getRevenueTrend(days);
}
