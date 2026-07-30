import { ISystemConfigurationRepository } from "./interfaces/system-configuration.repository";
import { SystemConfiguration } from "../domain/admin/contracts";
import { prisma } from "../prisma";
import { loggerService } from "../services/logger.service";

export class PrismaSystemConfigurationRepository implements ISystemConfigurationRepository {
  private configKey = "enterprise_system_config";
  private historyKey = "enterprise_system_config_history";

  async getLatest(): Promise<SystemConfiguration | null> {
    try {
      const row = await prisma.siteSettings.findUnique({
        where: { key: this.configKey },
      });
      if (!row) return null;
      return JSON.parse(row.value) as SystemConfiguration;
    } catch (err: any) {
      loggerService.error("Failed to load latest system config", {}, err);
      return null;
    }
  }

  async save(config: SystemConfiguration, updatedBy: string): Promise<SystemConfiguration> {
    try {
      const configStr = JSON.stringify(config);

      // Save main config
      await prisma.siteSettings.upsert({
        where: { key: this.configKey },
        create: {
          key: this.configKey,
          value: configStr,
          description: "Production System configuration settings Zod-validated",
        },
        update: {
          value: configStr,
        },
      });

      // Update history list
      const historyRow = await prisma.siteSettings.findUnique({
        where: { key: this.historyKey },
      });

      let history: any[] = [];
      if (historyRow) {
        try {
          history = JSON.parse(historyRow.value);
        } catch {
          history = [];
        }
      }

      const nextVersion = history.length + 1;
      const historyItem = {
        version: nextVersion,
        updatedBy,
        updatedAt: new Date().toISOString(),
        config,
      };

      history.unshift(historyItem); // Newest first

      await prisma.siteSettings.upsert({
        where: { key: this.historyKey },
        create: {
          key: this.historyKey,
          value: JSON.stringify(history),
          description: "System configuration versions history ledger",
        },
        update: {
          value: JSON.stringify(history),
        },
      });

      return config;
    } catch (err: any) {
      loggerService.error("Failed to save system config", { updatedBy }, err);
      throw err;
    }
  }

  async getHistory(limit: number = 20): Promise<any[]> {
    try {
      const historyRow = await prisma.siteSettings.findUnique({
        where: { key: this.historyKey },
      });
      if (!historyRow) return [];
      const list = JSON.parse(historyRow.value) as any[];
      return list.slice(0, limit);
    } catch (err: any) {
      loggerService.error("Failed to load system config history", {}, err);
      return [];
    }
  }

  async getVersion(version: number): Promise<SystemConfiguration | null> {
    try {
      const history = await this.getHistory(100);
      const found = history.find((h) => h.version === version);
      return found ? found.config : null;
    } catch (err: any) {
      loggerService.error("Failed to fetch system config version", { version }, err);
      return null;
    }
  }
}
