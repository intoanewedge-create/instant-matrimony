import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";

/**
 * Service managing SLA/SLO monitoring budgets, reliability ratings, and incident counts.
 */
export class ReliabilityService extends BaseService {
  private incidents: Array<{ durationMin: number; failureTime: Date }> = [];

  /**
   * Records a service disruption event.
   */
  async logOutage(durationMin: number): Promise<Result<void>> {
    this.incidents.push({
      durationMin,
      failureTime: new Date()
    });
    return returnSuccess(undefined);
  }

  /**
   * Computes MTTR and MTBF statistics.
   */
  async calculateMetrics(totalPeriodHours: number): Promise<Result<{ mttrMin: number; mtbfHours: number; availability: number }>> {
    const totalOutageMin = this.incidents.reduce((acc, curr) => acc + curr.durationMin, 0);
    const incidentCount = this.incidents.length;

    const mttrMin = incidentCount > 0 ? (totalOutageMin / incidentCount) : 0;
    const mtbfHours = incidentCount > 0 ? (totalPeriodHours / incidentCount) : totalPeriodHours;

    const totalPeriodMin = totalPeriodHours * 60;
    const availability = totalPeriodMin > 0 ? ((totalPeriodMin - totalOutageMin) / totalPeriodMin) * 100 : 100;

    return returnSuccess({
      mttrMin,
      mtbfHours,
      availability
    });
  }
}
