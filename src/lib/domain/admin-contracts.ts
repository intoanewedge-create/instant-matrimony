export interface DashboardWidget {
  id: string;
  title: string;
  type: "REVENUE" | "GROWTH" | "MODERATION" | "PAYMENTS" | "MARKETING" | "VERIFICATION" | "SYSTEM_HEALTH";
  value: string | number;
  changePercent?: number; // comparison period growth
  trend: Array<{ date: string; value: number }>;
  status?: "UP" | "DOWN" | "STABLE";
}

export interface FunnelStage {
  stage: string;
  count: number;
  conversionRate: number; // conversion from previous stage
  dropOffRate: number;
}

export interface CohortData {
  cohortName: string; // e.g. "2026-W01" or "2026-M07"
  size: number;
  retentionRates: number[]; // Index maps to Period 0, 1, 2...
}

export interface ChurnTrend {
  period: string;
  activeCount: number;
  lostCount: number;
  churnRate: number;
}

export interface AnalyticsDto {
  revenue: {
    totalRevenue: number;
    subscriptionRevenue: number;
    addonsRevenue: number;
    averageOrderValue: number;
    growthPercent: number;
  };
  funnel: FunnelStage[];
  cohorts: CohortData[];
  retentionCurve: number[];
  churn: ChurnTrend[];
  messaging: {
    totalMessages: number;
    conversationsCount: number;
    averageMessagesPerUser: number;
  };
  searches: {
    totalSearches: number;
    popularQueries: Array<{ query: string; count: number }>;
  };
  verifications: {
    totalVerified: number;
    pendingCount: number;
    rejectionRate: number;
  };
}

export interface FraudScoreDto {
  userId: string;
  score: number; // 0 to 100
  reasons: string[];
  isHighRisk: boolean;
  autoSuspended: boolean;
}

export interface FraudCaseDto {
  id: string;
  userId: string;
  userName: string;
  email: string;
  score: number;
  reasons: string[];
  status: "PENDING" | "INVESTIGATING" | "RESOLVED_SUSPENDED" | "RESOLVED_CLEARED";
  detectedAt: Date;
}

export interface CampaignDto {
  id: string;
  name: string;
  type: "EMAIL" | "SMS" | "PUSH" | "LANDING";
  status: "DRAFT" | "SCHEDULED" | "ACTIVE" | "COMPLETED";
  targetSegment: string;
  content: string;
  scheduledAt: Date | null;
  sentCount: number;
  clickCount: number;
  createdAt: Date;
}

export interface CouponDto {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  startDate: Date;
  endDate: Date;
  maxRedemptions: number;
  currentRedemptions: number;
  isActive: boolean;
}

export type AdminRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "FINANCE"
  | "MODERATOR"
  | "MARKETING_MANAGER"
  | "CONTENT_MANAGER"
  | "CUSTOMER_SUPPORT"
  | "OPERATIONS"
  | "ANALYST"
  | "USER";

export type AdminPermission =
  | "VIEW_ANALYTICS"
  | "EXPORT_REPORTS"
  | "MANAGE_MODERATION"
  | "MANAGE_VERIFICATION"
  | "MANAGE_FRAUD"
  | "MANAGE_MARKETING"
  | "MANAGE_CMS"
  | "MANAGE_PERMISSIONS"
  | "MANAGE_SYSTEM";

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    "VIEW_ANALYTICS",
    "EXPORT_REPORTS",
    "MANAGE_MODERATION",
    "MANAGE_VERIFICATION",
    "MANAGE_FRAUD",
    "MANAGE_MARKETING",
    "MANAGE_CMS",
    "MANAGE_PERMISSIONS",
    "MANAGE_SYSTEM",
  ],
  ADMIN: [
    "VIEW_ANALYTICS",
    "EXPORT_REPORTS",
    "MANAGE_MODERATION",
    "MANAGE_VERIFICATION",
    "MANAGE_FRAUD",
    "MANAGE_MARKETING",
    "MANAGE_CMS",
    "MANAGE_SYSTEM",
  ],
  FINANCE: ["VIEW_ANALYTICS", "EXPORT_REPORTS"],
  MODERATOR: ["MANAGE_MODERATION", "MANAGE_VERIFICATION"],
  MARKETING_MANAGER: ["VIEW_ANALYTICS", "MANAGE_MARKETING"],
  CONTENT_MANAGER: ["MANAGE_CMS"],
  CUSTOMER_SUPPORT: ["MANAGE_MODERATION", "MANAGE_VERIFICATION"],
  OPERATIONS: ["VIEW_ANALYTICS", "MANAGE_MODERATION", "MANAGE_VERIFICATION", "MANAGE_FRAUD", "MANAGE_CMS"],
  ANALYST: ["VIEW_ANALYTICS", "EXPORT_REPORTS"],
  USER: [],
};
