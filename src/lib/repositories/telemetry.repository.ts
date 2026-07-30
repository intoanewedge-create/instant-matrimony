import { ITelemetryRepository } from "./interfaces/telemetry.repository";
import { TelemetryMetric } from "../domain/admin/contracts";

export class PrismaTelemetryRepository implements ITelemetryRepository {
  private static metricsBuffer: TelemetryMetric[] = [];
  private maxBufferSize = 5000; // Limit memory usage

  async logMetric(metric: TelemetryMetric): Promise<void> {
    PrismaTelemetryRepository.metricsBuffer.push({ ...metric });
    if (PrismaTelemetryRepository.metricsBuffer.length > this.maxBufferSize) {
      PrismaTelemetryRepository.metricsBuffer.shift(); // Evict oldest
    }
  }

  async getMetrics(metricName: string, fromDate: Date, toDate: Date): Promise<TelemetryMetric[]> {
    return PrismaTelemetryRepository.metricsBuffer.filter(
      (m) =>
        m.metricName === metricName &&
        m.timestamp.getTime() >= fromDate.getTime() &&
        m.timestamp.getTime() <= toDate.getTime()
    ).map((m) => ({ ...m }));
  }

  async getAggregateMetrics(category: string, fromDate: Date, toDate: Date): Promise<TelemetryMetric[]> {
    return PrismaTelemetryRepository.metricsBuffer.filter(
      (m) =>
        m.category === category &&
        m.timestamp.getTime() >= fromDate.getTime() &&
        m.timestamp.getTime() <= toDate.getTime()
    ).map((m) => ({ ...m }));
  }
}
