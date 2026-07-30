import { BaseService } from "./base.service";
import { ISearchIndexRepository } from "../repositories/interfaces/search-index.repository";
import { TelemetryService } from "./telemetry.service";
import { SearchContext, SearchResult } from "../domain/admin/contracts";
import { returnSuccess, Result } from "../result";
import { loggerService } from "./logger.service";

export class SearchIndexService extends BaseService {
  constructor(
    private repository: ISearchIndexRepository,
    private telemetryService: TelemetryService
  ) {
    super();
  }

  async search(userId: string, context: SearchContext): Promise<Result<SearchResult[]>> {
    const start = Date.now();
    try {
      const results = await this.repository.search(context);
      const duration = Date.now() - start;

      // 1. Log search telemetry
      const term = context.query || "";
      await this.telemetryService.track("admin_search_query", "request", duration, 1, {
        term,
        entitiesCount: results.length.toString(),
        filtersApplied: (context.types || []).join(","),
      });

      // 2. Save to history
      if (term) {
        await this.repository.saveSearchHistory(userId, term, context.types);
        
        // Track zero search results
        if (results.length === 0) {
          await this.telemetryService.track("admin_search_zero_results", "request", 0, 1, { term });
        }
      }

      return returnSuccess(results);
    } catch (err: any) {
      loggerService.error("Global search failed", {}, err);
      return this.returnFailure(err.message, "SEARCH_INDEX_ERROR");
    }
  }

  async getSearchSuggestions(term: string): Promise<Result<string[]>> {
    try {
      const suggestions = await this.repository.getSearchSuggestions(term);
      return returnSuccess(suggestions);
    } catch (err: any) {
      return this.returnFailure(err.message, "SEARCH_SUGGESTIONS_ERROR");
    }
  }

  async getHistory(userId: string, limit: number = 10): Promise<Result<any[]>> {
    try {
      const history = await this.repository.getSearchHistory(userId, limit);
      return returnSuccess(history);
    } catch (err: any) {
      return this.returnFailure(err.message, "SEARCH_HISTORY_ERROR");
    }
  }
}
