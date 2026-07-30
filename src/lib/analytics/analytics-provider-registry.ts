import { AnalyticsDto } from "../domain/admin-contracts";
import { Result, returnSuccess } from "../result";

export interface AnalyticsProvider {
  name(): string;
  getAnalyticsData(): Promise<Result<AnalyticsDto>>;
}

export class MockAnalyticsProvider implements AnalyticsProvider {
  name() {
    return "MockAnalyticsProvider";
  }

  async getAnalyticsData(): Promise<Result<AnalyticsDto>> {
    const dummyData: AnalyticsDto = {
      revenue: {
        totalRevenue: 250000,
        subscriptionRevenue: 200000,
        addonsRevenue: 50000,
        averageOrderValue: 2500,
        growthPercent: 12,
      },
      funnel: [
        { stage: "Signups", count: 1000, conversionRate: 100, dropOffRate: 0 },
        { stage: "Profile Completed", count: 750, conversionRate: 75, dropOffRate: 25 },
        { stage: "Active Subscribers", count: 150, conversionRate: 20, dropOffRate: 80 },
      ],
      cohorts: [
        { cohortName: "2026-07-01", size: 100, retentionRates: [100, 80, 60, 45, 30] },
        { cohortName: "2026-07-08", size: 120, retentionRates: [100, 85, 65, 50, 0] },
      ],
      retentionCurve: [100, 82, 62, 47, 32],
      churn: [
        { period: "2026-M06", activeCount: 500, lostCount: 25, churnRate: 5 },
        { period: "2026-M07", activeCount: 600, lostCount: 36, churnRate: 6 },
      ],
      messaging: {
        totalMessages: 5420,
        conversationsCount: 340,
        averageMessagesPerUser: 16,
      },
      searches: {
        totalSearches: 1840,
        popularQueries: [
          { query: "Software Engineer", count: 245 },
          { query: "Doctor in Bangalore", count: 182 },
        ],
      },
      verifications: {
        totalVerified: 450,
        pendingCount: 18,
        rejectionRate: 8,
      },
    };
    return returnSuccess(dummyData);
  }
}

export class AnalyticsProviderRegistry {
  private providers: Map<string, AnalyticsProvider> = new Map();
  private activeProviderName = "MockAnalyticsProvider";

  registerProvider(provider: AnalyticsProvider) {
    this.providers.set(provider.name(), provider);
  }

  setActiveProvider(name: string) {
    if (this.providers.has(name)) {
      this.activeProviderName = name;
    }
  }

  getActiveProvider(): AnalyticsProvider {
    return this.providers.get(this.activeProviderName) || new MockAnalyticsProvider();
  }
}

export const analyticsProviderRegistry = new AnalyticsProviderRegistry();
analyticsProviderRegistry.registerProvider(new MockAnalyticsProvider());
