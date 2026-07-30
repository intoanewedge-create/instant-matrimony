import { Profile } from "@prisma/client";

export interface ISearchRepository {
  search(params: {
    viewerId: string;
    filters: any;
    cursor?: string;
    limit: number;
    sortBy?: string;
  }): Promise<Profile[]>;
  saveSearchHistory(userId: string, query?: string, filters?: any): Promise<any>;
  getRecentSearches(userId: string, limit: number): Promise<any[]>;
  getPopularSearches(limit: number): Promise<any[]>;
  getSearchAnalytics(limit: number): Promise<any[]>;
}

