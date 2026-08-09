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
      page?: number;
      limit?: number;
      sortBy?: string;
    }
  ): Promise<Result<any>> {
    try {
      const viewerProfile = await this.profileRepository.findByUserId(viewerUserId);
      if (!viewerProfile) {
        return this.returnFailure("Viewer profile not found", "PROFILE_NOT_FOUND");
      }

      if (viewerProfile.status !== "APPROVED") {
        return this.returnFailure("Only approved profiles are authorized to search", "UNAUTHORIZED_STATUS");
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

      const pageVal = params.page || 1;
      const limitVal = params.limit || 12;
      const searchRes = await this.searchRepository.search({
        viewerId: viewerUserId,
        filters: parsedFilters,
        page: pageVal,
        limit: limitVal,
        sortBy: params.sortBy,
      });

      // Rank using SearchRankingService
      const rankedCandidates = this.rankingService.rankCandidates(viewerProfile, searchRes.data);

      const mappedResults = rankedCandidates.map((candidate: any) => {
        const dto = ProfileMapper.toResponse(candidate as any);
        return {
          profile: dto,
          compatibility: candidate.compatibility,
          rankingScore: candidate.rankingScore,
          privacy: candidate.privacy,
          user: candidate.user ? {
            identityVerification: candidate.user.identityVerification ? {
              status: candidate.user.identityVerification.status
            } : null
          } : null,
        };
      });

      return this.returnSuccess({
        data: mappedResults,
        totalRecords: searchRes.totalRecords,
        page: searchRes.page,
        totalPages: searchRes.totalPages,
      });
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

