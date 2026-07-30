import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import { PlatformCapacity } from "../domain/phase5-contracts";

/**
 * Service orchestrating platform limits, system scale plans, and storage bounds.
 */
export class CapacityPlanningService extends BaseService {
  /**
   * Asserts if active server allocations violate max threshold rules.
   */
  async checkCapacity(metrics: PlatformCapacity): Promise<Result<{ status: "OK" | "WARNING" | "CRITICAL"; recommendations: string[] }>> {
    const recommendations: string[] = [];
    let status: "OK" | "WARNING" | "CRITICAL" = "OK";

    if (metrics.cpuUsagePercent > 85 || metrics.memoryUsagePercent > 90) {
      status = "CRITICAL";
      recommendations.push("Trigger auto-scale group capacity increase. Allocate extra compute instances.");
    } else if (metrics.storageUsedBytes / (metrics.storageUsedBytes + metrics.storageFreeBytes) > 0.8) {
      status = "WARNING";
      recommendations.push("Trigger database table vacuum. Schedule cold data migration archives.");
    }

    return returnSuccess({
      status,
      recommendations
    });
  }
}
