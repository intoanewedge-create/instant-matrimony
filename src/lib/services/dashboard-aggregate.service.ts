import { BaseService } from "./base.service";
import { Result, returnSuccess, returnFailure } from "../result";
import { ProfileService } from "./profile.service";
import { MembershipService } from "./membership.service";
import { SearchService } from "./search.service";
import { MessagingService } from "./messaging.service";
import { NotificationService } from "./notification.service";
import { SavedSearchService } from "./saved-search.service";
import { AiProviderRegistry } from "../ai/ai-provider-registry";
import { ProfileMapper } from "../mappers/profile.mapper";
import { IInterestRepository } from "../repositories/interfaces/interest.repository";
import { INotificationRepository } from "../repositories/interfaces/notification.repository";
import { IAnalyticsRepository } from "../repositories/interfaces/analytics.repository";

export class DashboardAggregateService extends BaseService {
  constructor(
    private profileService: ProfileService,
    private membershipService: MembershipService,
    private searchService: SearchService,
    private messagingService: MessagingService,
    private notificationService: NotificationService,
    private savedSearchService: SavedSearchService,
    private aiProviderRegistry: AiProviderRegistry,
    private interestRepository: IInterestRepository,
    private notificationRepository: INotificationRepository,
    private analyticsRepository: IAnalyticsRepository,
  ) {
    super();
  }

  async getDashboardData(userId: string): Promise<Result<any>> {
    try {
      // 1. Fetch Profile first as it's required for matching gender opposite suggestions
      const profileResult =
        await this.profileService.getProfileByUserId(userId);
      if (!profileResult.success || !profileResult.data) {
        return returnFailure("Profile not found", "PROFILE_NOT_FOUND");
      }
      const profile = profileResult.data;
      const profileDto = ProfileMapper.toResponse(profile);

      // Opposite gender query suggestion parameter
      const opponentGender = profile.gender === "MALE" ? "FEMALE" : "MALE";

      // Execute subsequent queries concurrently using Promise.all
      const [
        membershipRes,
        receivedInterestsRes,
        sentInterestsRes,
        suggestionsRes,
        conversationsRes,
        notificationsRes,
        savedSearchesRes,
        visitorsCount,
      ] = await Promise.all([
        // Membership
        this.membershipService
          .getActiveMembership(userId)
          .catch(() => returnSuccess(null)),
        // Received Interests
        this.interestRepository
          .findReceived(userId, undefined, 5)
          .catch(() => []),
        // Sent Interests
        this.interestRepository
          .findSent(userId, undefined, 5)
          .catch(() => []),
        // Suggestions matches
        this.searchService
          .searchMatches(userId, {
            filters: { gender: opponentGender },
            limit: 3,
          })
          .catch(() => returnSuccess([])),
        // Conversations
        this.messagingService
          .getConversations(userId)
          .catch(() => returnSuccess([])),
        // Notifications
        this.notificationRepository
          .findUserNotifications(userId, undefined, 5)
          .catch(() => []),
        // Saved searches
        this.savedSearchService
          .getSavedSearches(userId)
          .catch(() => returnSuccess([])),
        // Visitors count
        this.analyticsRepository?.getProfileViewsCount
          ? this.analyticsRepository
              .getProfileViewsCount(userId)
              .catch(() => 0)
          : Promise.resolve(0),
      ]);

      // Normalize suggestions list safely to a clean flat array
      let suggestionsList: any[] = [];
      const suggPayload = (suggestionsRes as any)?.data;
      if (suggPayload) {
        if (Array.isArray(suggPayload)) {
          suggestionsList = suggPayload;
        } else if (Array.isArray(suggPayload?.data)) {
          suggestionsList = suggPayload.data;
        }
      }

      // Normalize conversations list safely to a clean flat array
      let conversationsList: any[] = [];
      const convPayload = (conversationsRes as any)?.data;
      if (convPayload) {
        if (Array.isArray(convPayload)) {
          conversationsList = convPayload;
        } else if (Array.isArray(convPayload?.data)) {
          conversationsList = convPayload.data;
        }
      }

      // Normalize received and sent interests
      const receivedInterests = Array.isArray(receivedInterestsRes)
        ? receivedInterestsRes
        : (receivedInterestsRes as any)?.data || [];

      const sentInterests = Array.isArray(sentInterestsRes)
        ? sentInterestsRes
        : (sentInterestsRes as any)?.data || [];

      // Normalize notifications
      const notifications = Array.isArray(notificationsRes)
        ? notificationsRes
        : (notificationsRes as any)?.notifications || (notificationsRes as any)?.data || [];

      // Normalize saved searches
      let savedSearchesList: any[] = [];
      const savedSearchPayload = (savedSearchesRes as any)?.data;
      if (savedSearchPayload) {
        if (Array.isArray(savedSearchPayload)) {
          savedSearchesList = savedSearchPayload;
        } else if (Array.isArray(savedSearchPayload?.data)) {
          savedSearchesList = savedSearchPayload.data;
        }
      }

      // Calculate AI Insights
      const profileDetails = {
        id: profile.id,
        userId: profile.userId,
        name: profile.user?.name || "User",
        gender: profile.gender,
        religion: profile.religion,
        caste: profile.caste,
        motherTongue: profile.motherTongue,
        maritalStatus: profile.maritalStatus,
        dateOfBirth: profile.dateOfBirth,
        height: profile.height,
        country: profile.country,
        state: profile.state,
        city: profile.city,
        education: profile.education,
        occupation: profile.occupation,
        income: profile.income ? Number(profile.income) : null,
        completionPercent: profile.completionPercent || 0,
        isVerified: profile.user?.identityVerification?.status === "APPROVED",
        isPremium: !!(membershipRes?.success && membershipRes?.data),
        lastLoginAt: profile.user?.lastLoginAt || null,
      };

      let aiAnalysis = {
        suggestions: ["Upload identity document to get verified."],
        missingFields: [] as string[],
        improvements: ["Maintain up-to-date photo list."],
      };
      let improvedBioSuggestion = "";

      try {
        const activeAiProvider =
          await this.aiProviderRegistry.getActiveProvider();

        if (activeAiProvider) {
          aiAnalysis = await activeAiProvider
            .getProfileSuggestions(profileDetails)
            .catch(() => aiAnalysis);

          improvedBioSuggestion = await activeAiProvider
            .improveBiography(profile.bio || "", profile.occupation || undefined)
            .catch(() => "");
        }
      } catch {
        // AI fallback silent handling
      }

      const aggregateDto = {
        profile: profileDto,
        membership: membershipRes?.success ? membershipRes.data : null,
        receivedInterests,
        sentInterests,
        suggestions: suggestionsList,
        conversations: conversationsList,
        notifications,
        savedSearches: savedSearchesList,
        analytics: {
          viewsCount: visitorsCount || 0,
          interestAcceptRate: 75, // default rate
          profileCompletion: profile.completionPercent || 0,
          unresolvedModerationCount: 0,
        },
        aiInsights: {
          completionSuggestions: aiAnalysis?.suggestions || ["Upload identity document to get verified."],
          bioImprovementSuggestion: improvedBioSuggestion || "",
          profileStrengthScore: profile.completionPercent || 0,
        },
      };

      return returnSuccess(aggregateDto);
    } catch (e: any) {
      return returnFailure(e.message || "Failed to load dashboard data", "DASHBOARD_AGGREGATE_ERROR");
    }
  }
}

