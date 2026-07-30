import { container } from "../container";
import { logger } from "../logger";

export interface ValidationReport {
  success: boolean;
  errors: string[];
  registeredServicesCount: number;
  registeredRepositoriesCount: number;
  registeredProvidersCount: number;
}

/**
 * Enterprise Production Validation Engine.
 * Programmatically checks container dependency injection registrations,
 * verifies active providers, and ensures core pipelines are loaded.
 */
export async function validateEnterpriseProduction(): Promise<ValidationReport> {
  const errors: string[] = [];

  logger.info("[ValidationEngine] Starting enterprise self-diagnostic validation...");

  // 1. Verify DI Repositories
  const expectedRepos = [
    "userRepository", "profileRepository", "interestRepository", "messageRepository",
    "membershipRepository", "notificationRepository", "auditRepository", "searchRepository",
    "verificationOtpRepository", "userSessionHistoryRepository", "mediaRepository",
    "photoRepository", "verificationRepository", "imageMetadataRepository",
    "moderationRepository", "orderRepository", "paymentRepository", "invoiceRepository",
    "transactionRepository", "webhookRepository", "conversationRepository",
    "conversationParticipantRepository", "messageReactionRepository", "recommendationRepository",
    "cmsRepository", "featureFlagRepository", "analyticsRepository", "savedSearchRepository",
    "searchIndexRepository", "systemConfigurationRepository", "jobRepository",
    "bulkOperationRepository", "telemetryRepository"
  ];

  expectedRepos.forEach((repoName) => {
    if (!(container.repositories as any)[repoName]) {
      errors.push(`Missing DI Repository registration: ${repoName}`);
    }
  });

  // 2. Verify DI Providers
  const expectedProviders = [
    "storageProvider", "emailProvider", "emailOtpProvider", "smsOtpProvider",
    "paymentProvider", "realtimeProvider", "cacheProvider", "lockProvider", "eventStore"
  ];

  expectedProviders.forEach((providerName) => {
    if (!(container.providers as any)[providerName]) {
      errors.push(`Missing DI Provider registration: ${providerName}`);
    }
  });

  // 3. Verify DI Services
  const expectedServices = [
    "authService", "profileService", "searchService", "interestService", "messagingService",
    "membershipService", "notificationService", "auditService", "compatibilityService",
    "completionService", "permissionService", "imageService", "otpService", "storageService",
    "verificationService", "moderationService", "billingAggregate", "recommendationService",
    "cmsService", "featureFlagService", "analyticsService", "savedSearchService",
    "securityService", "rateLimitService", "csrfService", "sessionSecurityService",
    "securityAuditService", "schedulerService", "searchRankingService",
    "dashboardAggregateService", "fraudDetectionService", "marketingCampaignService",
    "reportService", "telemetryService", "searchIndexService", "bulkOperationService",
    "systemConfigService", "workflowService", "idempotencyService", "webhookService",
    "complianceService", "releaseService", "billingService", "aiService",
    "localizationService", "maintenanceService", "mediaPipelineService", "healthService"
  ];

  expectedServices.forEach((serviceName) => {
    if (!(container.services as any)[serviceName]) {
      errors.push(`Missing DI Service registration: ${serviceName}`);
    }
  });

  const success = errors.length === 0;

  if (success) {
    logger.info("[ValidationEngine] All DI registrations verified successfully!");
  } else {
    logger.error({ errors }, `[ValidationEngine] Validation failed with ${errors.length} errors:`);
  }

  return {
    success,
    errors,
    registeredServicesCount: Object.keys(container.services).length,
    registeredRepositoriesCount: Object.keys(container.repositories).length,
    registeredProvidersCount: Object.keys(container.providers).length
  };
}
