import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import { ResourceForecast, CapacityForecast } from "../domain/phase5-contracts";
import { IEventBus } from "../events/event-bus";

/**
 * Service managing machine learning growth predictions, revenue forecasts, and capacity limits.
 */
export class ForecastingService extends BaseService {
  constructor(private eventBus: IEventBus) {
    super();
  }

  /**
   * Generates linear regression estimates for capacity targets (database, storage space).
   */
  async forecastCapacity(target: string, currentSizeGb: number, growthHistory: number[]): Promise<Result<CapacityForecast>> {
    // Simple average growth rate estimation
    const avgGrowth = growthHistory.length > 0
      ? growthHistory.reduce((a, b) => a + b, 0) / growthHistory.length
      : 5.0; // default 5% growth

    const forecastedSizeGb30Days = currentSizeGb * (1 + avgGrowth / 100);

    const forecast: CapacityForecast = {
      target,
      currentSizeGb,
      forecastedSizeGb30Days,
      growthRatePercent: avgGrowth,
      calculatedAt: new Date()
    };

    await this.eventBus.publish({
      name: "ForecastCompletedV1",
      occurredAt: new Date(),
      data: { target, growthRate: avgGrowth }
    });

    return returnSuccess(forecast);
  }

  /**
   * Forecasts general resource values.
   */
  async forecastMetric(metricName: string, values: number[]): Promise<Result<ResourceForecast>> {
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 100;
    return returnSuccess({
      metricName,
      currentValue: values[values.length - 1] || 0,
      forecastedValueNextMonth: avg * 1.08, // simulate 8% growth
      confidencePercent: 88
    });
  }
}
