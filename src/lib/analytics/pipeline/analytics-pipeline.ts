import { prisma } from "../../prisma";
import { FunnelStage, CohortData, ChurnTrend } from "../../domain/admin-contracts";

export interface ICollector {
  collectSignups(days: number): Promise<any[]>;
  collectPayments(days: number): Promise<any[]>;
  collectMessages(days: number): Promise<any[]>;
  collectSearches(days: number): Promise<any[]>;
}

export interface IAggregator {
  aggregateByDay(data: any[], dateField: string): Record<string, number>;
  aggregateByWeek(data: any[], dateField: string): Record<string, number>;
}

export interface ICalculator {
  calculateConversionFunnel(signups: number, profileCompleted: number, activeSubscribers: number): FunnelStage[];
  calculateCohortRetention(cohortWeeks: Record<string, string[]>, activeWeeks: Record<string, Set<string>>): CohortData[];
}

export interface ITrendEngine {
  calculateGrowth(current: number, previous: number): number;
  calculateMovingAverage(data: number[], windowSize: number): number[];
}

export interface IForecastProvider {
  forecastNextValue(historical: number[]): number;
}

export interface IChartSerializer {
  serializeToChart(data: Record<string, number>): { labels: string[]; values: number[] };
}

// 1. Collector
export class DbCollector implements ICollector {
  async collectSignups(days: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return prisma.user.findMany({
      where: { createdAt: { gte: cutoff }, deletedAt: null },
      select: { id: true, createdAt: true },
    });
  }

  async collectPayments(days: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return prisma.payment.findMany({
      where: { createdAt: { gte: cutoff }, status: "PAID", deletedAt: null },
      select: { amount: true, createdAt: true },
    });
  }

  async collectMessages(days: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return prisma.message.findMany({
      where: { createdAt: { gte: cutoff }, isDeleted: false },
      select: { id: true, createdAt: true },
    });
  }

  async collectSearches(days: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return prisma.searchHistory.findMany({
      where: { createdAt: { gte: cutoff } },
      select: { id: true, createdAt: true },
    });
  }
}

// 2. Aggregator
export class TimeAggregator implements IAggregator {
  aggregateByDay(data: any[], dateField: string): Record<string, number> {
    const result: Record<string, number> = {};
    for (const item of data) {
      const date = new Date(item[dateField]).toISOString().split("T")[0];
      result[date] = (result[date] || 0) + 1;
    }
    return result;
  }

  aggregateByWeek(data: any[], dateField: string): Record<string, number> {
    const result: Record<string, number> = {};
    for (const item of data) {
      const date = new Date(item[dateField]);
      const startOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
      const weekStr = startOfWeek.toISOString().split("T")[0];
      result[weekStr] = (result[weekStr] || 0) + 1;
    }
    return result;
  }
}

// 3. Calculator
export class AnalyticsCalculator implements ICalculator {
  calculateConversionFunnel(signups: number, profileCompleted: number, activeSubscribers: number): FunnelStage[] {
    const stages = [
      { name: "Signups", count: signups },
      { name: "Profile Completed", count: profileCompleted },
      { name: "Active Subscribers", count: activeSubscribers },
    ];

    const funnel: FunnelStage[] = [];
    for (let i = 0; i < stages.length; i++) {
      const current = stages[i];
      let conversionRate = 100;
      let dropOffRate = 0;

      if (i > 0) {
        const prev = stages[i - 1];
        conversionRate = prev.count > 0 ? Math.round((current.count / prev.count) * 100) : 0;
        dropOffRate = 100 - conversionRate;
      }

      funnel.push({
        stage: current.name,
        count: current.count,
        conversionRate,
        dropOffRate,
      });
    }
    return funnel;
  }

  calculateCohortRetention(cohortWeeks: Record<string, string[]>, activeWeeks: Record<string, Set<string>>): CohortData[] {
    const cohorts: CohortData[] = [];
    const cohortKeys = Object.keys(cohortWeeks).sort();

    for (const cohortName of cohortKeys) {
      const userIds = cohortWeeks[cohortName];
      const size = userIds.length;
      if (size === 0) continue;

      const retentionRates: number[] = [100]; // Period 0 is always 100%

      // Calculate for 4 subsequent periods (weeks)
      for (let period = 1; period <= 4; period++) {
        // e.g. target week is cohort week + period weeks
        const cohortDate = new Date(cohortName);
        const targetWeekDate = new Date(cohortDate.setDate(cohortDate.getDate() + period * 7));
        const targetWeekStr = targetWeekDate.toISOString().split("T")[0];

        let activeCount = 0;
        for (const userId of userIds) {
          const userActivity = activeWeeks[userId];
          if (userActivity && userActivity.has(targetWeekStr)) {
            activeCount++;
          }
        }

        retentionRates.push(Math.round((activeCount / size) * 100));
      }

      cohorts.push({
        cohortName,
        size,
        retentionRates,
      });
    }

    return cohorts;
  }
}

// 4. Trend Engine
export class TrendEngine implements ITrendEngine {
  calculateGrowth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  calculateMovingAverage(data: number[], windowSize: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < windowSize - 1) {
        result.push(data[i]); // not enough data, return value itself
      } else {
        const sum = data.slice(i - windowSize + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(Math.round((sum / windowSize) * 100) / 100);
      }
    }
    return result;
  }
}

// 5. Forecast Provider
export class LinearForecastProvider implements IForecastProvider {
  forecastNextValue(historical: number[]): number {
    if (historical.length === 0) return 0;
    if (historical.length === 1) return historical[0];

    // Simple Linear Extrapolation based on last few data points
    const points = historical.slice(-5);
    let totalDiff = 0;
    for (let i = 1; i < points.length; i++) {
      totalDiff += points[i] - points[i - 1];
    }
    const avgGrowth = totalDiff / (points.length - 1 || 1);
    return Math.max(0, Math.round(points[points.length - 1] + avgGrowth));
  }
}

// 6. Chart Serializer
export class ChartSerializer implements IChartSerializer {
  serializeToChart(data: Record<string, number>): { labels: string[]; values: number[] } {
    const sortedKeys = Object.keys(data).sort();
    return {
      labels: sortedKeys,
      values: sortedKeys.map((k) => data[k]),
    };
  }
}

// Orchestrator BI Pipeline
export class AnalyticsPipeline {
  constructor(
    public collector: ICollector,
    public aggregator: IAggregator,
    public calculator: ICalculator,
    public trendEngine: ITrendEngine,
    public forecast: IForecastProvider,
    public serializer: IChartSerializer
  ) {}
}
