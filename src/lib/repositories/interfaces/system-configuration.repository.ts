import { SystemConfiguration } from "../../domain/admin/contracts";

export interface ISystemConfigurationRepository {
  getLatest(): Promise<SystemConfiguration | null>;
  save(config: SystemConfiguration, updatedBy: string): Promise<SystemConfiguration>;
  getHistory(limit?: number): Promise<any[]>;
  getVersion(version: number): Promise<SystemConfiguration | null>;
}
