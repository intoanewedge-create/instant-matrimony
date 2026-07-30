export interface SearchContext {
  query?: string;
  types?: string[];
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  cursor?: string;
}

export interface SearchResult {
  id: string;
  type: string; // 'user' | 'profile' | 'membership' | 'payment' | 'transaction' | 'cms_page' | 'blog_post' | 'audit_log' | 'fraud_case' | 'appeal' | 'campaign' | 'coupon' | 'report' | 'notification'
  title: string;
  description: string;
  status?: string | null;
  createdAt: Date;
  metadata?: Record<string, any>;
  score?: number;
}

export interface JobDetails {
  name: string;
  status: "idle" | "running" | "paused" | "failed";
  intervalMs: number;
  runCount: number;
  failureCount: number;
  consecutiveFailures: number;
  averageRuntimeMs: number;
  lastRunStart: Date | null;
  lastRunEnd: Date | null;
  nextRunAt: Date | null;
  lastErrorMessage?: string | null;
}

export interface QueueStatistics {
  activeJobsCount: number;
  queuedJobsCount: number;
  retryQueueCount: number;
  dlqCount: number;
  averageProcessingTimeMs: number;
  throughputJobsPerSec: number;
}

export interface BulkOperation {
  id: string;
  type: "APPROVE" | "REJECT" | "SUSPEND" | "RESTORE" | "DELETE" | "ARCHIVE" | "PUBLISH" | "RETRY" | "CANCEL" | "BULK_NOTIFICATION";
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "PARTIAL_SUCCESS";
  totalCount: number;
  processedCount: number;
  successCount: number;
  failureCount: number;
  correlationId: string;
  createdAt: Date;
}

export interface BulkOperationResult {
  operationId: string;
  successCount: number;
  failureCount: number;
  errors: Array<{ id: string; error: string }>;
  rolledBack: boolean;
}

export interface SystemConfiguration {
  appName: string;
  appUrl: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  security: {
    passwordExpiryDays: number;
    maxLoginAttempts: number;
    sessionTimeoutMinutes: number;
  };
  email: {
    provider: "smtp" | "resend" | "mock";
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    fromAddress: string;
  };
  sms: {
    provider: "twilio" | "mock";
    twilioSid?: string;
    twilioToken?: string;
    twilioPhone?: string;
  };
  storage: {
    provider: "local" | "cloudinary" | "s3" | "r2" | "minio" | "mock";
    bucketName?: string;
    accessKey?: string;
    secretKey?: string;
    region?: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  scheduler: {
    provider: "memory" | "bullmq" | "triggerdev" | "inngest";
  };
  payments: {
    provider: "stripe" | "razorpay" | "mock";
    stripeApiKey?: string;
    razorpayKeyId?: string;
    razorpayKeySecret?: string;
  };
  ai: {
    activeProvider: string;
    openAiKey?: string;
    geminiKey?: string;
  };
  notifications: {
    enablePush: boolean;
    enableSms: boolean;
    enableEmail: boolean;
  };
  cdn: {
    enableCdn: boolean;
    cdnUrl?: string;
  };
  rateLimits: {
    maxRequestsPerMin: number;
    windowMs: number;
  };
}

export interface ProviderHealth {
  name: string;
  status: "UP" | "DEGRADED" | "DOWN";
  latencyMs: number;
  details?: Record<string, any>;
}

export interface DashboardLayout {
  userId: string;
  widgetsLayout: Array<{
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    isPinned: boolean;
    isCollapsed: boolean;
  }>;
}

export interface WidgetConfiguration {
  id: string;
  title: string;
  description: string;
  permissions: string[];
  featureFlag?: string;
  defaultSize: { w: number; h: number };
  refreshInterval: number; // in seconds
  requiredServices: string[];
  visibilityRules?: Record<string, any>;
}

export interface FeatureFlagContext {
  userId?: string;
  role?: string;
  isPremium?: boolean;
  environment?: string;
}

export interface FeatureFlagEvaluation {
  key: string;
  enabled: boolean;
  value: string;
  reason: string;
}

export interface NotificationSummary {
  totalCount: number;
  unreadCount: number;
  categories: Record<string, number>;
}

export interface PerformanceSnapshot {
  cpuUsagePercent: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  dbLatencyMs: number;
  cacheLatencyMs: number;
  queueDepth: number;
  apiLatencyMs: number;
  networkRxKbps: number;
  networkTxKbps: number;
  uptimeSec: number;
  timestamp: Date;
}

export interface TelemetryMetric {
  metricName: string;
  category: "request" | "service" | "repository" | "scheduler" | "cache" | "database" | "api" | "background_job";
  value: number;
  durationMs: number;
  timestamp: Date;
  tags?: Record<string, string>;
}
