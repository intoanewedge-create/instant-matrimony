export interface IAnalyticsRepository {
  trackVisitor(visitorId: string, visitedId: string): Promise<any>;
  trackSearch(userId: string, query?: string, filters?: any): Promise<any>;
  getVisitorStats(userId: string): Promise<any>;
  getSearchHistory(userId: string, limit: number): Promise<any[]>;
  getAdminStats(): Promise<any>;

  getProfileViewsCount(userId: string): Promise<number>;
}
