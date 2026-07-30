import { BaseService } from "./base.service";
import { prisma } from "../prisma";
import { RedisCacheProvider } from "../cache/redis-cache-provider";
import { MockRealtimeProvider } from "../realtime/mock-realtime-provider";
import { MockNotificationProvider } from "../notifications/providers/mock-notification-provider";
import { PostgresSearchProvider } from "../search/postgres-search-provider";
import { SecretProvider } from "../secrets/secret-provider";
import { logger } from "../logger";

export interface HealthReport {
  status: "UP" | "DOWN";
  timestamp: Date;
  components: Record<string, { status: "UP" | "DOWN"; latencyMs: number; details?: any }>;
}

/**
 * Enterprise Production Health Center Service.
 * Runs diagnostic checks against all core platform components:
 * Database, cache, search cluster, event bus, notification gateways, and secret providers.
 */
export class HealthService extends BaseService {
  private redisCache = new RedisCacheProvider();
  private realtime = new MockRealtimeProvider();
  private notifier = new MockNotificationProvider();
  private search = new PostgresSearchProvider();
  private secrets = new SecretProvider();

  /**
   * Generates a complete system liveness & readiness check report.
   */
  public async getHealthReport(): Promise<HealthReport> {
    const report: HealthReport = {
      status: "UP",
      timestamp: new Date(),
      components: {}
    };

    // 1. Database Check
    const dbStart = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      report.components.database = { status: "UP", latencyMs: Date.now() - dbStart };
    } catch (err: any) {
      report.components.database = { status: "DOWN", latencyMs: Date.now() - dbStart, details: err.message };
      report.status = "DOWN";
    }

    // 2. Cache Check
    const cacheStart = Date.now();
    try {
      const cacheHealth = await this.redisCache.getHealth();
      report.components.cache = { status: cacheHealth.status, latencyMs: Date.now() - cacheStart };
      if (cacheHealth.status === "DOWN") report.status = "DOWN";
    } catch (err: any) {
      report.components.cache = { status: "DOWN", latencyMs: Date.now() - cacheStart, details: err.message };
      report.status = "DOWN";
    }

    // 3. Realtime Event Bus/Socket Check
    const rtStart = Date.now();
    try {
      const rtHealth = await this.realtime.getHealth();
      report.components.realtime = { status: rtHealth.status, latencyMs: Date.now() - rtStart };
    } catch (err: any) {
      report.components.realtime = { status: "DOWN", latencyMs: Date.now() - rtStart, details: err.message };
    }

    // 4. Notifications Check
    const nfStart = Date.now();
    try {
      const nfHealth = await this.notifier.getHealth();
      report.components.notifications = { status: nfHealth.status, latencyMs: Date.now() - nfStart };
    } catch (err: any) {
      report.components.notifications = { status: "DOWN", latencyMs: Date.now() - nfStart, details: err.message };
    }

    // 5. Search Check
    const searchStart = Date.now();
    try {
      const searchHealth = await this.search.getHealth();
      report.components.search = { status: searchHealth.status, latencyMs: Date.now() - searchStart };
    } catch (err: any) {
      report.components.search = { status: "DOWN", latencyMs: Date.now() - searchStart, details: err.message };
    }

    // 6. Secrets Check
    const secStart = Date.now();
    try {
      const secHealth = await this.secrets.getHealth();
      report.components.secrets = { status: secHealth.status, latencyMs: Date.now() - secStart };
    } catch (err: any) {
      report.components.secrets = { status: "DOWN", latencyMs: Date.now() - secStart, details: err.message };
    }

    logger.info(`[HealthService] Diagnostics executed. Status: ${report.status}`);
    return report;
  }

  public async getHealth(): Promise<{ status: "UP" | "DOWN"; services: Record<string, { status: "UP" | "DOWN" }> }> {
    const report = await this.getHealthReport();
    return {
      status: report.status,
      services: {
        database: { status: report.components.database?.status || "DOWN" },
        cache: { status: report.components.cache?.status || "DOWN" },
        realtime: { status: report.components.realtime?.status || "DOWN" },
        notifications: { status: report.components.notifications?.status || "DOWN" },
        search: { status: report.components.search?.status || "DOWN" },
        secrets: { status: report.components.secrets?.status || "DOWN" }
      }
    };
  }
}

export const healthService = new HealthService();
