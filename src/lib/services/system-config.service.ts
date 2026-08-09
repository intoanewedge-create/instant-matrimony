import { BaseService } from "./base.service";
import { ISystemConfigurationRepository } from "../repositories/interfaces/system-configuration.repository";
import { SystemConfiguration, ProviderHealth } from "../domain/admin/contracts";
import { Result, returnSuccess } from "../result";
import { z } from "zod";
import { healthProviderRegistry } from "./health/health-provider-registry";

// Zod System Settings Validator
export const SystemConfigurationSchema = z.object({
  appName: z.string().min(1),
  appUrl: z.string().url(),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().optional(),
  security: z.object({
    passwordExpiryDays: z.number().int().min(0),
    maxLoginAttempts: z.number().int().min(1),
    sessionTimeoutMinutes: z.number().int().min(1),
  }),
  email: z.object({
    provider: z.enum(["smtp", "resend", "mock"]),
    smtpHost: z.string().optional(),
    smtpPort: z.number().int().optional(),
    smtpUser: z.string().optional(),
    smtpPassword: z.string().optional(),
    fromAddress: z.string().email(),
  }),
  sms: z.object({
    provider: z.enum(["twilio", "mock"]),
    twilioSid: z.string().optional(),
    twilioToken: z.string().optional(),
    twilioPhone: z.string().optional(),
  }),
  storage: z.object({
    provider: z.enum(["local", "cloudinary", "s3", "r2", "minio", "mock"]),
    bucketName: z.string().optional(),
    accessKey: z.string().optional(),
    secretKey: z.string().optional(),
    region: z.string().optional(),
  }),
  redis: z.object({
    host: z.string().min(1),
    port: z.number().int().min(1),
    password: z.string().optional(),
  }),
  scheduler: z.object({
    provider: z.enum(["memory", "bullmq", "triggerdev", "inngest"]),
  }),
  payments: z.object({
    provider: z.enum(["stripe", "razorpay", "mock"]),
    stripeApiKey: z.string().optional(),
    razorpayKeyId: z.string().optional(),
    razorpayKeySecret: z.string().optional(),
  }),
  ai: z.object({
    activeProvider: z.string().min(1),
    openAiKey: z.string().optional(),
    geminiKey: z.string().optional(),
  }),
  notifications: z.object({
    enablePush: z.boolean(),
    enableSms: z.boolean(),
    enableEmail: z.boolean(),
  }),
  cdn: z.object({
    enableCdn: z.boolean(),
    cdnUrl: z.string().url().optional().or(z.literal("")),
  }),
  rateLimits: z.object({
    maxRequestsPerMin: z.number().int().min(1),
    windowMs: z.number().int().min(1000),
  }),
});

export class SystemConfigService extends BaseService {
  private defaultSettings: SystemConfiguration = {
    appName: "InstantMatrimony",
    appUrl: "https://instantmatrimony.com",
    maintenanceMode: false,
    maintenanceMessage: "System is undergoing scheduled maintenance.",
    security: { passwordExpiryDays: 90, maxLoginAttempts: 5, sessionTimeoutMinutes: 30 },
    email: { provider: "mock", fromAddress: "support@instantmatrimony.com" },
    sms: { provider: "mock" },
    storage: { provider: "mock" },
    redis: { host: "127.0.0.1", port: 6379 },
    scheduler: { provider: "memory" },
    payments: { provider: "mock" },
    ai: { activeProvider: "gemini" },
    notifications: { enablePush: true, enableSms: true, enableEmail: true },
    cdn: { enableCdn: false },
    rateLimits: { maxRequestsPerMin: 100, windowMs: 60000 },
  };

  constructor(private repository: ISystemConfigurationRepository) {
    super();
  }

  async getConfiguration(): Promise<Result<SystemConfiguration>> {
    try {
      const config = await this.repository.getLatest();
      if (!config) {
        // Seed default config if empty
        const seeded = await this.repository.save(this.defaultSettings, "system");
        return returnSuccess(seeded);
      }
      return returnSuccess(config);
    } catch (err: any) {
      return this.returnFailure(err.message, "LOAD_CONFIG_ERROR");
    }
  }

  async saveConfiguration(config: SystemConfiguration, updatedBy: string): Promise<Result<SystemConfiguration>> {
    try {
      // 1. Zod validation
      const parsed = SystemConfigurationSchema.safeParse(config);
      if (!parsed.success) {
        const errorMsg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
        return this.returnFailure(`Validation failed: ${errorMsg}`, "CONFIG_VALIDATION_FAILED");
      }

      const saved = await this.repository.save(parsed.data as any, updatedBy);
      return returnSuccess(saved);
    } catch (err: any) {
      return this.returnFailure(err.message, "SAVE_CONFIG_ERROR");
    }
  }

  async getHistory(limit: number = 20): Promise<Result<any[]>> {
    try {
      const history = await this.repository.getHistory(limit);
      return returnSuccess(history);
    } catch (err: any) {
      return this.returnFailure(err.message, "GET_CONFIG_HISTORY_ERROR");
    }
  }

  async rollback(version: number, updatedBy: string): Promise<Result<SystemConfiguration>> {
    try {
      const config = await this.repository.getVersion(version);
      if (!config) {
        return this.returnFailure(`Configuration version ${version} not found.`, "VERSION_NOT_FOUND");
      }
      const saved = await this.repository.save(config, `${updatedBy} (Rollback to v${version})`);
      return returnSuccess(saved);
    } catch (err: any) {
      return this.returnFailure(err.message, "ROLLBACK_CONFIG_ERROR");
    }
  }

  async getHealthReport(): Promise<Result<ProviderHealth[]>> {
    try {
      const report = await healthProviderRegistry.getHealthReport();
      return returnSuccess(report);
    } catch (err: any) {
      return this.returnFailure(err.message, "HEALTH_REPORT_ERROR");
    }
  }
}
