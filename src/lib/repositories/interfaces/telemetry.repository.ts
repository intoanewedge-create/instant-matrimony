import { TelemetryMetric } from "../../domain/admin/contracts";

export interface ITelemetryRepository {
  logMetric(metric: TelemetryMetric): Promise<void>;
  getMetrics(metricName: string, fromDate: Date, toDate: Date): Promise<TelemetryMetric[]>;
  getAggregateMetrics(category: string, fromDate: Date, toDate: Date): Promise<TelemetryMetric[]>;
}
