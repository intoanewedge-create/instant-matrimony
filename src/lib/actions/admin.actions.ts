"use server";

import { auth } from "../auth";
import { container } from "../container";
const {
  permissionService,
  analyticsService,
  fraudDetectionService,
  cmsService,
  reportService,
  marketingCampaignService,
  moderationService,
  featureFlagService,
} = container.services;
import { prisma } from "../prisma";
import { Result, returnFailure, returnSuccess } from "../result";
import { AnalyticsDto, FraudCaseDto, CampaignDto, CouponDto } from "../domain/admin-contracts";
import { loggerService } from "../services/logger.service";
import { revalidatePath } from "next/cache";
import { healthService } from "../services/health.service";

// Helper to check permissions and session securely on the server
async function checkAuth(permission: any, adminIdOverride?: string): Promise<Result<{ id: string; email: string; ip: string }>> {
  const session = await auth();
  const userId = session?.user?.id || adminIdOverride;
  if (!userId) {
    return returnFailure("Unauthorized session", "UNAUTHORIZED");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });

  if (!user) {
    return returnFailure("User not found", "USER_NOT_FOUND");
  }

  const allowed = permissionService.hasPermission(user.role as any, permission);
  if (!allowed) {
    return returnFailure(`Access denied: Required permission ${permission}`, "ACCESS_DENIED");
  }

  return returnSuccess({
    id: user.id,
    email: user.email || "unknown@system.local",
    ip: "127.0.0.1", // Mocked client IP fallback
  });
}

// Wrapper for actions with latency timing and structured observability logging
async function runWithObservability<T>(
  actionName: string,
  permission: any,
  fn: (admin: { id: string; email: string; ip: string }) => Promise<Result<T>>,
  adminIdOverride?: string
): Promise<Result<T>> {
  const start = performance.now();
  const correlationId = `corr-${Math.random().toString(36).substring(2, 11)}`;

  try {
    const authRes = await checkAuth(permission, adminIdOverride);
    if (!authRes.success || !authRes.data) {
      loggerService.error(`[${actionName}] Auth failed. CorrelationId: ${correlationId}`);
      return authRes as any;
    }

    const admin = authRes.data;
    const result = await fn(admin);

    const duration = Math.round(performance.now() - start);
    loggerService.info(
      `[${actionName}] Completed in ${duration}ms. User: ${admin.email}, IP: ${admin.ip}, CorrelationId: ${correlationId}, Success: ${result.success}`
    );

    return result;
  } catch (e: any) {
    const duration = Math.round(performance.now() - start);
    loggerService.error(
      `[${actionName}] Exception in ${duration}ms. Error: ${e.message}, CorrelationId: ${correlationId}`
    );
    return returnFailure(e.message, "ACTION_EXCEPTION");
  }
}

// 1. BI Analytics Actions
export async function getBIAnalyticsSummaryAction(adminId?: string): Promise<Result<AnalyticsDto>> {
  return runWithObservability("getBIAnalyticsSummary", "VIEW_ANALYTICS", async () => {
    return analyticsService.getBIAnalyticsSummary();
  }, adminId);
}

// 2. Fraud Prevention Actions
export async function runFraudScanAction(userId: string, adminId?: string): Promise<Result<any>> {
  return runWithObservability("runFraudScan", "MANAGE_FRAUD", async (admin) => {
    const res = await fraudDetectionService.runFraudScan(userId);
    if (res.success) {
      await container.cache.invalidateTags(["analytics", "admin"]);
    }
    return res;
  }, adminId);
}

export async function getFraudCasesAction(adminId?: string, status?: string): Promise<Result<FraudCaseDto[]>> {
  return runWithObservability("getFraudCases", "MANAGE_FRAUD", async () => {
    return fraudDetectionService.getFraudCases(status);
  }, adminId);
}

export async function resolveFraudCaseAction(
  caseId: string,
  status: "RESOLVED_SUSPENDED" | "RESOLVED_CLEARED",
  adminId?: string
): Promise<Result<any>> {
  return runWithObservability("resolveFraudCase", "MANAGE_FRAUD", async (admin) => {
    const res = await fraudDetectionService.resolveFraudCase(caseId, status);
    if (res.success) {
      await container.cache.invalidateTags(["analytics", "admin"]);
      revalidatePath("/admin");
    }
    return res;
  }, adminId);
}

// 3. CMS Actions
export async function publishPageAction(pageId: string, adminId?: string): Promise<Result<any>> {
  return runWithObservability("publishPage", "MANAGE_CMS", async (admin) => {
    const res = await cmsService.publishPage(pageId, admin.id);
    if (res.success) {
      await container.cache.invalidateTags(["cms"]);
      revalidatePath("/admin/cms");
    }
    return res;
  }, adminId);
}

export async function rollbackPageVersionAction(
  pageId: string,
  versionNumber: number,
  adminId?: string
): Promise<Result<any>> {
  return runWithObservability("rollbackPageVersion", "MANAGE_CMS", async (admin) => {
    const res = await cmsService.rollbackPageVersion(pageId, versionNumber, admin.id);
    if (res.success) {
      await container.cache.invalidateTags(["cms"]);
      revalidatePath("/admin/cms");
    }
    return res;
  }, adminId);
}

export async function getPageVersionsAction(pageId: string, adminId?: string): Promise<Result<any[]>> {
  return runWithObservability("getPageVersions", "MANAGE_CMS", async () => {
    return cmsService.getPageVersions(pageId);
  }, adminId);
}

// 4. Export & Reporting Actions
export async function generateUsersReportAction(providerName: string, adminId?: string): Promise<Result<{ status: string; data?: string }>> {
  return runWithObservability("generateUsersReport", "EXPORT_REPORTS", async (admin) => {
    return reportService.generateUsersReport(providerName, admin.id);
  }, adminId);
}

export async function generatePaymentsReportAction(providerName: string, adminId?: string): Promise<Result<{ status: string; data?: string }>> {
  return runWithObservability("generatePaymentsReport", "EXPORT_REPORTS", async (admin) => {
    return reportService.generatePaymentsReport(providerName, admin.id);
  }, adminId);
}

export async function generateReportAction(type: "USERS" | "PAYMENTS", format: string): Promise<Result<{ status: string; data?: string }>> {
  const provider = format.toLowerCase() === "pdf"
    ? "PdfReportProvider"
    : format.toLowerCase() === "excel"
    ? "ExcelReportProvider"
    : "CsvReportProvider";

  if (type === "USERS") {
    return generateUsersReportAction(provider);
  } else {
    return generatePaymentsReportAction(provider);
  }
}

// 5. Marketing Automation Actions
export async function createCampaignAction(
  campaignData: {
    name: string;
    type: "EMAIL" | "SMS" | "PUSH" | "LANDING";
    targetSegment: string;
    content: string;
    scheduledAt?: Date;
  },
  adminId?: string
): Promise<Result<CampaignDto>> {
  return runWithObservability("createCampaign", "MANAGE_MARKETING", async (admin) => {
    const res = await marketingCampaignService.createCampaign(campaignData, admin.id);
    if (res.success) {
      await container.cache.invalidateTags(["analytics", "admin"]);
      revalidatePath("/admin/marketing");
    }
    return res;
  }, adminId);
}

export async function createCouponAction(
  couponData: {
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    startDate: Date;
    endDate: Date;
    maxRedemptions?: number;
  },
  adminId?: string
): Promise<Result<CouponDto>> {
  return runWithObservability("createCoupon", "MANAGE_MARKETING", async (admin) => {
    const res = await marketingCampaignService.createCoupon(couponData, admin.id);
    if (res.success) {
      await container.cache.invalidateTags(["analytics", "admin"]);
      revalidatePath("/admin/marketing");
    }
    return res;
  }, adminId);
}

export async function publishCampaignAction(campaignId: string): Promise<Result<any>> {
  return runWithObservability("publishCampaign", "MANAGE_MARKETING", async (admin) => {
    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "ACTIVE" },
    });
    await container.services.auditService.log(admin.id, "CAMPAIGN_PUBLISH", undefined, undefined, `Published campaign: ${campaignId}`);
    await container.cache.invalidateTags(["analytics", "admin"]);
    revalidatePath("/admin/marketing");
    return returnSuccess(updated);
  });
}

export async function archiveCampaignAction(campaignId: string): Promise<Result<any>> {
  return runWithObservability("archiveCampaign", "MANAGE_MARKETING", async (admin) => {
    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status: "COMPLETED" },
    });
    await container.services.auditService.log(admin.id, "CAMPAIGN_ARCHIVE", undefined, undefined, `Archived campaign: ${campaignId}`);
    await container.cache.invalidateTags(["analytics", "admin"]);
    revalidatePath("/admin/marketing");
    return returnSuccess(updated);
  });
}

// 6. Appeals & Blacklist actions
export async function submitAppealAction(userId: string, reason: string): Promise<Result<any>> {
  // Appeal submission doesn't require admin permission check
  const res = await moderationService.submitAppeal(userId, reason);
  if (res.success) {
    revalidatePath("/admin/moderation");
  }
  return res;
}

export async function getAppealsAction(adminId?: string, status?: string): Promise<Result<any[]>> {
  return runWithObservability("getAppeals", "MANAGE_MODERATION", async () => {
    return moderationService.getAppeals(status);
  }, adminId);
}

export async function resolveAppealAction(
  appealId: string,
  status: "APPROVED" | "REJECTED",
  response: string,
  adminId?: string
): Promise<Result<any>> {
  return runWithObservability("resolveAppeal", "MANAGE_MODERATION", async (admin) => {
    const res = await moderationService.resolveAppeal(appealId, status, response, admin.id);
    if (res.success) {
      await container.cache.invalidateTags(["analytics", "admin"]);
      revalidatePath("/admin/moderation");
    }
    return res;
  }, adminId);
}

export async function approveAppealAction(appealId: string, response: string): Promise<Result<any>> {
  return resolveAppealAction(appealId, "APPROVED", response);
}

export async function rejectAppealAction(appealId: string, response: string): Promise<Result<any>> {
  return resolveAppealAction(appealId, "REJECTED", response);
}

export async function addToBlacklistAction(
  type: "IP" | "EMAIL" | "DEVICE",
  value: string,
  reason: string,
  adminId?: string
): Promise<Result<any>> {
  return runWithObservability("addToBlacklist", "MANAGE_MODERATION", async (admin) => {
    const res = await moderationService.addToBlacklist(type, value, reason, admin.id);
    if (res.success) {
      revalidatePath("/admin/moderation");
    }
    return res;
  }, adminId);
}

// 7. Profile & Photo Moderation Controls
export async function approveProfileAction(profileId: string): Promise<Result<any>> {
  return runWithObservability("approveProfile", "MANAGE_MODERATION", async (admin) => {
    const updated = await prisma.profile.update({
      where: { id: profileId },
      data: { status: "APPROVED" },
    });

    await container.services.auditService.log(admin.id, "PROFILE_APPROVE", undefined, undefined, `Approved profile ${profileId}`);

    const user = await prisma.user.findFirst({
      where: { profile: { id: profileId } },
    });
    if (user) {
      await container.services.notificationService.enqueue(
        user.id,
        "Profile Approved",
        "Your matchmaking profile details have been approved by the moderator.",
        "SUCCESS",
        "PROFILE"
      );
    }

    await container.cache.invalidateTags(["analytics", "admin"]);
    revalidatePath("/admin/moderation");
    return returnSuccess(updated);
  });
}

export async function rejectProfileAction(profileId: string, reason: string): Promise<Result<any>> {
  return runWithObservability("rejectProfile", "MANAGE_MODERATION", async (admin) => {
    const updated = await prisma.profile.update({
      where: { id: profileId },
      data: { status: "REJECTED" },
    });

    await container.services.auditService.log(admin.id, "PROFILE_REJECT", undefined, undefined, `Rejected profile ${profileId}. Reason: ${reason}`);

    const user = await prisma.user.findFirst({
      where: { profile: { id: profileId } },
    });
    if (user) {
      await container.services.notificationService.enqueue(
        user.id,
        "Profile Details Flagged",
        `Your profile detail updates were flagged. Reason: ${reason}. Please update your parameters.`,
        "WARNING",
        "PROFILE"
      );
    }

    await container.cache.invalidateTags(["analytics", "admin"]);
    revalidatePath("/admin/moderation");
    return returnSuccess(updated);
  });
}

// 8. User Suspension & Bans Controls
export async function suspendUserAction(userId: string, reason: string): Promise<Result<any>> {
  return runWithObservability("suspendUser", "MANAGE_MODERATION", async (admin) => {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    await container.services.auditService.log(admin.id, "USER_SUSPEND", undefined, undefined, `Suspended user ${userId}. Reason: ${reason}`);
    await container.services.notificationService.enqueue(
      userId,
      "Account Suspended",
      `Your account is suspended due to: ${reason}. You can appeal this suspension.`,
      "ERROR",
      "SECURITY"
    );

    await container.cache.invalidateTags(["analytics", "admin"]);
    revalidatePath("/admin");
    revalidatePath("/admin/moderation");
    return returnSuccess(updated);
  });
}

export async function restoreUserAction(userId: string): Promise<Result<any>> {
  return runWithObservability("restoreUser", "MANAGE_MODERATION", async (admin) => {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });

    await container.services.auditService.log(admin.id, "USER_RESTORE", undefined, undefined, `Restored suspended user ${userId}`);
    await container.services.notificationService.enqueue(
      userId,
      "Account Restored",
      "Your account access has been fully restored. Welcome back!",
      "SUCCESS",
      "SECURITY"
    );

    await container.cache.invalidateTags(["analytics", "admin"]);
    revalidatePath("/admin");
    revalidatePath("/admin/moderation");
    return returnSuccess(updated);
  });
}

export async function banUserAction(userId: string, reason: string): Promise<Result<any>> {
  return runWithObservability("banUser", "MANAGE_MODERATION", async (admin) => {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    await container.services.auditService.log(admin.id, "USER_BAN", undefined, undefined, `Banned user ${userId}. Reason: ${reason}`);

    if (user.email) {
      await moderationService.addToBlacklist("EMAIL", user.email, `Banned: ${reason}`, admin.id);
    }

    await container.cache.invalidateTags(["analytics", "admin"]);
    revalidatePath("/admin");
    revalidatePath("/admin/moderation");
    return returnSuccess(user);
  });
}

// 9. Bulk Operations
export async function bulkApproveProfilesAction(profileIds: string[]): Promise<Result<void>> {
  return runWithObservability("bulkApproveProfiles", "MANAGE_MODERATION", async () => {
    for (const id of profileIds) {
      await approveProfileAction(id);
    }
    return returnSuccess(undefined);
  });
}

export async function bulkRejectProfilesAction(profileIds: string[], reason: string): Promise<Result<void>> {
  return runWithObservability("bulkRejectProfiles", "MANAGE_MODERATION", async () => {
    for (const id of profileIds) {
      await rejectProfileAction(id, reason);
    }
    return returnSuccess(undefined);
  });
}

export async function bulkSuspendUsersAction(userIds: string[], reason: string): Promise<Result<void>> {
  return runWithObservability("bulkSuspendUsers", "MANAGE_MODERATION", async () => {
    for (const id of userIds) {
      await suspendUserAction(id, reason);
    }
    return returnSuccess(undefined);
  });
}

export async function bulkApproveVerificationsAction(verificationIds: string[]): Promise<Result<void>> {
  return runWithObservability("bulkApproveVerifications", "MANAGE_VERIFICATION", async (admin) => {
    for (const id of verificationIds) {
      await moderationService.approveVerification(id, admin.id);
    }
    revalidatePath("/admin/verification");
    return returnSuccess(undefined);
  });
}

export async function bulkRejectVerificationsAction(verificationIds: string[], reason: string): Promise<Result<void>> {
  return runWithObservability("bulkRejectVerifications", "MANAGE_VERIFICATION", async (admin) => {
    for (const id of verificationIds) {
      await moderationService.rejectVerification(id, admin.id, reason);
    }
    revalidatePath("/admin/verification");
    return returnSuccess(undefined);
  });
}

export async function bulkApprovePhotosAction(photoIds: string[]): Promise<Result<void>> {
  return runWithObservability("bulkApprovePhotos", "MANAGE_MODERATION", async (admin) => {
    return moderationService.bulkApprovePhotos(photoIds, admin.id);
  });
}

export async function bulkRejectPhotosAction(photoIds: string[], reason: string): Promise<Result<void>> {
  return runWithObservability("bulkRejectPhotos", "MANAGE_MODERATION", async (admin) => {
    return moderationService.bulkRejectPhotos(photoIds, admin.id, reason);
  });
}

export async function toggleFeatureFlagAction(key: string, enabled: boolean): Promise<Result<any>> {
  return runWithObservability("toggleFeatureFlag", "MANAGE_SYSTEM", async (admin) => {
    const res = await container.services.featureFlagService.setFlag(key, enabled);
    if (res.success) {
      await container.cache.invalidateTags(["feature_flags"]);
      revalidatePath("/admin/settings");
    }
    return res;
  });
}

export async function getLiveStatsAction(): Promise<Result<any>> {
  return runWithObservability("getLiveStats", "VIEW_ANALYTICS", async () => {
    const userCount = await prisma.user.count();
    const pendingCount = await prisma.profile.count({ where: { status: "PENDING" } });
    const membershipCount = await prisma.membership.count({ where: { status: "ACTIVE" } });
    
    const payments = await prisma.payment.findMany({ where: { status: "PAID" } });
    const revenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    const dbUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { profile: true },
    });
    const recentUsers = dbUsers.map(u => ({
      id: u.id,
      name: u.name || "Unnamed User",
      email: u.email,
      city: u.profile?.city || "Not set",
      status: u.profile?.status || "DRAFT",
      date: new Date(u.createdAt).toLocaleDateString(),
    }));

    const dbLogs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });
    const auditLogs = dbLogs.map(l => ({
      action: l.action,
      details: l.details || "",
      date: new Date(l.createdAt).toLocaleDateString(),
    }));

    const health = await healthService.getHealth();

    return returnSuccess({
      stats: {
        totalUsers: userCount,
        pendingProfiles: pendingCount,
        activeMemberships: membershipCount,
        totalRevenue: revenue || 0,
      },
      recentUsers,
      auditLogs,
      health,
    });
  });
}
