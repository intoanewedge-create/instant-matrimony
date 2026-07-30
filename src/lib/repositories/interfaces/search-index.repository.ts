import { SearchContext, SearchResult } from "../../domain/admin/contracts";

export interface ISearchIndexRepository {
  search(context: SearchContext): Promise<SearchResult[]>;
  saveSearchHistory(userId: string, term: string, filters?: any): Promise<void>;
  getSearchHistory(userId: string, limit?: number): Promise<any[]>;
  getSearchSuggestions(term: string): Promise<string[]>;
}
