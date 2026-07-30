import { Result } from "../result";

export interface SearchQueryParams {
  query: string;
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SearchQueryResult<T = any> {
  hits: T[];
  totalCount: number;
  facets?: Record<string, Record<string, number>>;
  suggestions?: string[];
  highlights?: Record<string, string[]>[];
  nextCursor?: string;
}

/**
 * Interface representing the pluggable Enterprise Search Provider.
 * Allows querying index structures with support for facets, suggestions, highlighting,
 * autocomplete, synonyms, and cursor-based pagination.
 */
export interface ISearchProvider {
  /**
   * Performs a full-text search across the provider index.
   */
  search<T = any>(params: SearchQueryParams): Promise<Result<SearchQueryResult<T>>>;

  /**
   * Retrieves autocomplete search term suggestions.
   */
  suggest(query: string): Promise<Result<string[]>>;

  /**
   * Generates autocomplete term completions.
   */
  autocomplete(query: string): Promise<Result<string[]>>;

  /**
   * Indexes a document into the search provider index.
   */
  indexDocument(indexName: string, documentId: string, document: any): Promise<Result<boolean>>;

  /**
   * Removes a document from the search provider index.
   */
  removeDocument(indexName: string, documentId: string): Promise<Result<boolean>>;

  /**
   * Exposes provider diagnostics checks.
   */
  getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }>;
}
