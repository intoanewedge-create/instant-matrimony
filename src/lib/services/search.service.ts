import { BaseService } from "./base.service";
import { Result } from "../result";
import { ISearchRepository } from "../repositories/interfaces/search.repository";
import { IProfileRepository } from "../repositories/interfaces/profile.repository";
import { SearchRankingService } from "./search-ranking.service";
import { SearchQueryPipeline } from "../search/pipeline/search-query-pipeline";
import { ProfileMapper } from "../mappers/profile.mapper";

export class SearchService extends BaseService {
  private nlpPipeline = new SearchQueryPipeline();

  constructor(
    private searchRepository: ISearchRepository,
    private profileRepository: IProfileRepository,
    private rankingService: SearchRankingService
  ) {
    super();
  }

  async searchMatches(
    viewerUserId: string,
    params: {
      queryText?: string;
      filters?: any;
      cursor?: string;
      limit?: number;
      sortBy?: string;
    }
  ): Promise<Result<any>> {
    try {
      const viewerProfile = await this.profileRepository.findByUserId(viewerUserId);
      if (!viewerProfile) {
        return this.returnFailure("Viewer profile not found", "PROFILE_NOT_FOUND");
      }

      let parsedFilters = params.filters || {};
      
      // NLP Parse if natural query text is provided
      if (params.queryText && params.queryText.trim().length > 0) {
        const { filters: extractedFilters } = this.nlpPipeline.parse(params.queryText);
        parsedFilters = {
          ...parsedFilters,
          ...extractedFilters,
        };

        // Save query to history
        await this.searchRepository.saveSearchHistory(viewerUserId, params.queryText, parsedFilters);
      }

      const limitVal = params.limit || 10;
      const candidates = await this.searchRepository.search({
        viewerId: viewerUserId,
        filters: parsedFilters,
        cursor: params.cursor,
        limit: limitVal,
        sortBy: params.sortBy,
      });

      // Rank using SearchRankingService
      const rankedCandidates = this.rankingService.rankCandidates(viewerProfile, candidates);

      const mappedResults = rankedCandidates.map((candidate) => {
        const dto = ProfileMapper.toResponse(candidate as any);
        return {
          profile: dto,
          compatibility: candidate.compatibility,
          rankingScore: candidate.rankingScore,
        };
      });

      return this.returnSuccess(mappedResults);
    } catch (e: any) {
      return this.returnFailure(e.message, "SEARCH_ERROR");
    }
  }

  async getRecentSearches(userId: string, limit: number = 5): Promise<Result<any[]>> {
    try {
      const recent = await this.searchRepository.getRecentSearches(userId, limit);
      return this.returnSuccess(recent);
    } catch (e: any) {
      return this.returnFailure(e.message, "RECENT_SEARCHES_ERROR");
    }
  }

  async getPopularSearches(limit: number = 5): Promise<Result<any[]>> {
    try {
      const popular = await this.searchRepository.getPopularSearches(limit);
      return this.returnSuccess(popular);
    } catch (e: any) {
      return this.returnFailure(e.message, "POPULAR_SEARCHES_ERROR");
    }
  }

  async getSuggestions(queryText: string): Promise<Result<string[]>> {
    try {
      const lowercase = queryText.toLowerCase().trim();
      const allSuggestions = [
        "Software Engineer",
        "Doctor",
        "Hindu",
        "Muslim",
        "Bangalore",
        "Mumbai",
        "Premium Verified Profiles",
        "Looking for doctor in Bangalore",
      ];
      
      const filtered = allSuggestions.filter((s) => s.toLowerCase().includes(lowercase));
      return this.returnSuccess(filtered);
    } catch (e: any) {
      return this.returnFailure(e.message, "SEARCH_SUGGESTIONS_ERROR");
    }
  }
}

