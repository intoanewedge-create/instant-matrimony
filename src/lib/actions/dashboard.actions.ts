"use server";

import { auth } from "../auth";
import { container } from "../container";

export async function getDashboardDataAction() {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }
  const userId = (session.user as any).id;

  const res = await container.services.dashboardAggregateService.getDashboardData(userId);
  if (!res.success) {
    return { success: false, error: res.error };
  }

  return { success: true, data: res.data };
}
