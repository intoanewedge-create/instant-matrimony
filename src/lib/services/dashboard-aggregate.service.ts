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

export class DashboardAggregateService extends BaseService {
  constructor(
    private profileService: ProfileService,
    private membershipService: MembershipService,
    private searchService: SearchService,
    private messagingService: MessagingService,
    private notificationService: NotificationService,
    private savedSearchService: SavedSearchService,
    private aiProviderRegistry: AiProviderRegistry,
  ) {
    super();
  }

  async getDashboardData(userId: string): Promise<Result<any>> {
    try {
      const { container } = await import("../container");
      // 1. Fetch Profile first as it's required for matching gender oppositesuggestions
      const profileResult =
        await this.profileService.getProfileByUserId(userId);
      if (!profileResult.success) {
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
        container.repositories.interestRepository
          .findReceived(userId, undefined, 5)
          .catch(() => []),
        // Sent Interests
        container.repositories.interestRepository
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
        container.repositories.notificationRepository
          .findUserNotifications(userId, undefined, 5)
          .catch(() => []),
        // Saved searches
        this.savedSearchService
          .getSavedSearches(userId)
          .catch(() => returnSuccess([])),
        // Visitors count

        container.repositories.analyticsRepository?.getProfileViewsCount
          ? container.repositories.analyticsRepository.getProfileViewsCount(
              userId,
            )
          : Promise.resolve(0),
      ]);

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
        isPremium: membershipRes?.data ? true : false,
        lastLoginAt: profile.user?.lastLoginAt || null,
      };

      const activeAiProvider =
        await this.aiProviderRegistry.getActiveProvider();

      const aiAnalysis = await activeAiProvider
        .getProfileSuggestions(profileDetails)
        .catch(() => ({
          suggestions: ["Upload identity document to get verified."],
          missingFields: [],
          improvements: ["Maintain up-to-date photo list."],
        }));

      const improvedBioSuggestion = await activeAiProvider
        .improveBiography(profile.bio || "", profile.occupation || undefined)
        .catch(() => "");

      const aggregateDto = {
        profile: profileDto,
        membership: membershipRes.success ? membershipRes.data : null,
        receivedInterests: receivedInterestsRes,
        sentInterests: sentInterestsRes,
        suggestions: suggestionsRes.success ? suggestionsRes.data : [],
        conversations: conversationsRes.success ? conversationsRes.data : [],
        notifications: notificationsRes,
        savedSearches: savedSearchesRes.success ? savedSearchesRes.data : [],
        analytics: {
          viewsCount: visitorsCount || 0,
          interestAcceptRate: 75, // mock rate
          profileCompletion: profile.completionPercent || 0,
          unresolvedModerationCount: 0,
        },
        aiInsights: {
          completionSuggestions: aiAnalysis.suggestions,
          bioImprovementSuggestion: improvedBioSuggestion,
          profileStrengthScore: profile.completionPercent || 0,
        },
      };

      return returnSuccess(aggregateDto);
    } catch (e: any) {
      return returnFailure(e.message, "DASHBOARD_AGGREGATE_ERROR");
    }
  }
}
