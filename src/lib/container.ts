import { PrismaUserRepository } from "./repositories/user.repository";
import { PrismaProfileRepository } from "./repositories/profile.repository";
import { PrismaInterestRepository } from "./repositories/interest.repository";
import { loggerService } from "./services/logger.service";

import { PrismaMessageRepository } from "./repositories/message.repository";
import { PrismaMembershipRepository } from "./repositories/membership.repository";
import { PrismaNotificationRepository } from "./repositories/notification.repository";
import { PrismaAuditRepository } from "./repositories/audit.repository";
import { PrismaSearchRepository } from "./repositories/search.repository";
import { PrismaVerificationOtpRepository } from "./repositories/verification-otp.repository";
import { PrismaUserSessionHistoryRepository } from "./repositories/user-session-history.repository";

import { LocalStorageProvider } from "./storage/local-storage";
import { MockEmailProvider } from "./email/mock-email-provider";
import { SmtpEmailProvider } from "./email/smtp-provider";
import { ResendEmailProvider } from "./email/resend-provider";
import { EmailProvider } from "./email/email-provider";
import { MockOtpProvider } from "./otp/mock-otp-provider";
import { SmsOtpProvider } from "./otp/sms-otp-provider";
import { EmailOtpProvider } from "./otp/email-otp-provider";

import { EmailNotificationProvider } from "./notifications/providers/email-notification-provider";
import { BrowserNotificationProvider } from "./notifications/providers/browser-notification-provider";
import { MockNotificationProvider } from "./notifications/providers/mock-notification-provider";
import { SmsNotificationProvider } from "./notifications/providers/sms-notification-provider";
import { PushNotificationProvider } from "./notifications/providers/push-notification-provider";
import { NotificationDispatcher } from "./notifications/pipeline/notification-pipeline";
import { SearchRankingService } from "./services/search-ranking.service";
import { DashboardAggregateService } from "./services/dashboard-aggregate.service";
import { aiProviderRegistry } from "./ai/ai-provider-registry";
import { recommendationProviderRegistry } from "./recommendation/recommendation-provider-factory";

import { AuthService } from "./services/auth.service";
import { ProfileService } from "./services/profile.service";
import { SearchService } from "./services/search.service";
import { InterestService } from "./services/interest.service";
import { MessagingService } from "./services/messaging.service";
import { MembershipService } from "./services/membership.service";
import { NotificationService } from "./services/notification.service";
import { AuditService } from "./services/audit.service";
import { CompatibilityService } from "./services/compatibility.service";
import { CompletionService } from "./services/completion.service";
import { PermissionService } from "./services/permission.service";
import { ImageService } from "./services/image.service";
import { OtpService } from "./services/otp.service";
import { initEventSubscribers } from "./events/subscribers";

import { PrismaMediaRepository } from "./repositories/media.repository";
import { PrismaPhotoRepository } from "./repositories/photo.repository";
import { PrismaVerificationRepository } from "./repositories/verification.repository";
import { PrismaImageMetadataRepository } from "./repositories/image-metadata.repository";
import { PrismaModerationRepository } from "./repositories/moderation.repository";

// New repositories
import { PrismaOrderRepository } from "./repositories/order.repository";
import { PrismaPaymentRepository } from "./repositories/payment.repository";
import { PrismaInvoiceRepository } from "./repositories/invoice.repository";
import { PrismaTransactionRepository } from "./repositories/transaction.repository";
import { PrismaWebhookRepository } from "./repositories/webhook.repository";
import { PrismaConversationRepository } from "./repositories/conversation.repository";
import { PrismaConversationParticipantRepository } from "./repositories/conversation-participant.repository";
import { PrismaMessageReactionRepository } from "./repositories/message-reaction.repository";

// New payment providers
import { PaymentProvider } from "./payments/payment-provider";
import { MockPaymentProvider } from "./payments/mock-payment-provider";
import { StripePaymentProvider } from "./payments/stripe-provider";
import { RazorpayPaymentProvider } from "./payments/razorpay-provider";

// New realtime providers
import { RealtimeProvider } from "./realtime/realtime-provider";
import { MockRealtimeProvider } from "./realtime/mock-realtime-provider";
import { SocketIOProvider } from "./realtime/socketio-provider";
import { SupabaseRealtimeProvider } from "./realtime/supabase-provider";
import { PusherProvider } from "./realtime/pusher-provider";

// New service
import { BillingAggregate } from "./services/billing-aggregate.service";

import { CloudinaryStorageProvider } from "./storage/cloudinary-provider";
import { S3StorageProvider } from "./storage/s3-provider";
import { R2StorageProvider } from "./storage/r2-provider";
import { MinioStorageProvider } from "./storage/minio-provider";
import { MockStorageProvider } from "./storage/mock-storage";
import { StorageProvider } from "./storage/storage-provider";

import { StorageService } from "./services/storage.service";
import { VerificationService } from "./services/verification.service";
import { ModerationService } from "./services/moderation.service";

// Milestone 4 imports
import { MemoryCacheProvider } from "./cache/memory-cache-provider";
import { DefaultRecommendationProvider } from "./recommendation/default-recommendation-provider";
import { PrismaRecommendationRepository } from "./repositories/recommendation.repository";
import { RecommendationService } from "./services/recommendation.service";
import { PrismaCmsRepository } from "./repositories/cms.repository";
import { CmsService } from "./services/cms.service";
import { PrismaFeatureFlagRepository } from "./repositories/feature-flag.repository";
import { FeatureFlagService } from "./services/feature-flag.service";
import { PrismaAnalyticsRepository } from "./repositories/analytics.repository";
import { AnalyticsService } from "./services/analytics.service";
import { PrismaSavedSearchRepository } from "./repositories/saved-search.repository";
import { SavedSearchService } from "./services/saved-search.service";
import { fraudDetectionService } from "./services/fraud-detection.service";
import { marketingCampaignService } from "./services/marketing-campaign.service";
import { reportService } from "./services/report.service";

import { PrismaPasswordHistoryRepository } from "./repositories/password-history.repository";
import { SecurityService } from "./services/security.service";
import { RateLimitService } from "./services/rate-limit.service";
import { CsrfService } from "./services/csrf.service";
import { SessionSecurityService } from "./services/session-security.service";
import { SecurityAuditService } from "./services/security-audit.service";
import { SchedulerService } from "./services/scheduler.service";

// Milestone 4 - Enterprise final enhancements
import { PrismaSearchIndexRepository } from "./repositories/search-index.repository";
import { PrismaSystemConfigurationRepository } from "./repositories/system-configuration.repository";
import { PrismaJobRepository } from "./repositories/job.repository";
import { PrismaBulkOperationRepository } from "./repositories/bulk-operation.repository";
import { PrismaTelemetryRepository } from "./repositories/telemetry.repository";

import { TelemetryService } from "./services/telemetry.service";
import { SearchIndexService } from "./services/search-index.service";
import { BulkOperationService } from "./services/bulk-operation.service";
import { SystemConfigService } from "./services/system-config.service";

import { emailConfig } from "../config/email.config";
import { smsConfig } from "../config/sms.config";
import { storageConfig } from "../config/storage.config";
import { paymentConfig } from "../config/payment.config";
import { realtimeConfig } from "../config/realtime.config";

const userRepository = new PrismaUserRepository();
const profileRepository = new PrismaProfileRepository();
const interestRepository = new PrismaInterestRepository();
const messageRepository = new PrismaMessageRepository();
const membershipRepository = new PrismaMembershipRepository();
const notificationRepository = new PrismaNotificationRepository();
const auditRepository = new PrismaAuditRepository();
const searchRepository = new PrismaSearchRepository();
const verificationOtpRepository = new PrismaVerificationOtpRepository();
const userSessionHistoryRepository = new PrismaUserSessionHistoryRepository();

const mediaRepository = new PrismaMediaRepository();
const photoRepository = new PrismaPhotoRepository();
const verificationRepository = new PrismaVerificationRepository();
const imageMetadataRepository = new PrismaImageMetadataRepository();
const moderationRepository = new PrismaModerationRepository();

const orderRepository = new PrismaOrderRepository();
const paymentRepository = new PrismaPaymentRepository();
const invoiceRepository = new PrismaInvoiceRepository();
const transactionRepository = new PrismaTransactionRepository();
const webhookRepository = new PrismaWebhookRepository();
const conversationRepository = new PrismaConversationRepository();
const conversationParticipantRepository = new PrismaConversationParticipantRepository();
const messageReactionRepository = new PrismaMessageReactionRepository();

// Milestone 4 repositories
const recommendationRepository = new PrismaRecommendationRepository();
const cmsRepository = new PrismaCmsRepository();
const featureFlagRepository = new PrismaFeatureFlagRepository();
const analyticsRepository = new PrismaAnalyticsRepository();
const savedSearchRepository = new PrismaSavedSearchRepository();
const passwordHistoryRepository = new PrismaPasswordHistoryRepository();

// Milestone 4 - Enterprise final repositories
const searchIndexRepository = new PrismaSearchIndexRepository();
const systemConfigurationRepository = new PrismaSystemConfigurationRepository();
const jobRepository = new PrismaJobRepository();
const bulkOperationRepository = new PrismaBulkOperationRepository();
const telemetryRepository = new PrismaTelemetryRepository();

// Select Email Provider based on config
let emailProvider: EmailProvider;
if (emailConfig.provider === "smtp") {
  emailProvider = new SmtpEmailProvider();
} else if (emailConfig.provider === "resend") {
  emailProvider = new ResendEmailProvider();
} else {
  emailProvider = new MockEmailProvider();
}

// Setup OTP Providers
const mockOtpProvider = new MockOtpProvider();
const emailOtpProvider = new EmailOtpProvider(emailProvider);
const smsOtpProvider = smsConfig.provider === "twilio" ? new SmsOtpProvider() : mockOtpProvider;

let storageProvider: StorageProvider;
if (storageConfig.provider === "local") {
  storageProvider = new LocalStorageProvider();
} else if (storageConfig.provider === "cloudinary") {
  storageProvider = new CloudinaryStorageProvider();
} else if (storageConfig.provider === "s3") {
  storageProvider = new S3StorageProvider();
} else if (storageConfig.provider === "r2") {
  storageProvider = new R2StorageProvider();
} else if (storageConfig.provider === "minio") {
  storageProvider = new MinioStorageProvider();
} else {
  storageProvider = new MockStorageProvider();
}

const emailNotificationProvider = new EmailNotificationProvider(emailProvider);
const browserNotificationProvider = new BrowserNotificationProvider();
const mockNotificationProvider = new MockNotificationProvider();
const pushNotificationProvider = new PushNotificationProvider();
const smsNotificationProvider = new SmsNotificationProvider();

const notificationDispatcher = new NotificationDispatcher([
  emailNotificationProvider,
  browserNotificationProvider,
  mockNotificationProvider,
  pushNotificationProvider,
  smsNotificationProvider,
]);

let paymentProvider: PaymentProvider;
if (paymentConfig.provider === "stripe") {
  paymentProvider = new StripePaymentProvider();
} else if (paymentConfig.provider === "razorpay") {
  paymentProvider = new RazorpayPaymentProvider();
} else {
  paymentProvider = new MockPaymentProvider();
}

let realtimeProvider: RealtimeProvider;
if (realtimeConfig.provider === "socketio") {
  realtimeProvider = new SocketIOProvider();
} else if (realtimeConfig.provider === "supabase") {
  realtimeProvider = new SupabaseRealtimeProvider();
} else if (realtimeConfig.provider === "pusher") {
  realtimeProvider = new PusherProvider();
} else {
  realtimeProvider = new MockRealtimeProvider();
}

export const auditService = new AuditService(auditRepository);
export const completionService = new CompletionService();
export const compatibilityService = new CompatibilityService();
export const permissionService = new PermissionService();
export const otpService = new OtpService(verificationOtpRepository, emailOtpProvider, smsOtpProvider);

export const notificationService = new NotificationService(notificationRepository, notificationDispatcher);

export const authService = new AuthService(
  userRepository,
  profileRepository,
  userSessionHistoryRepository,
  otpService,
  emailProvider
);

export const profileService = new ProfileService(profileRepository, completionService);
export const searchRankingService = new SearchRankingService(compatibilityService);
export const searchService = new SearchService(searchRepository, profileRepository, searchRankingService);
export const interestService = new InterestService(interestRepository, permissionService, notificationService);
export const messagingService = new MessagingService(
  messageRepository,
  permissionService,
  notificationService,
  conversationRepository,
  conversationParticipantRepository,
  messageReactionRepository,
  realtimeProvider
);
export const membershipService = new MembershipService(membershipRepository);
export const imageService = new ImageService();
export const storageService = new StorageService(storageProvider, mediaRepository);
export const verificationService = new VerificationService(verificationRepository);
export const moderationService = new ModerationService(verificationRepository, photoRepository, moderationRepository);

// Milestone 4 Services & Cache
export const cacheProvider = new MemoryCacheProvider();
export const recommendationService = new RecommendationService(recommendationProviderRegistry.getActiveProvider(), recommendationRepository);
export const cmsService = new CmsService(cmsRepository, cacheProvider);
export const featureFlagService = new FeatureFlagService(featureFlagRepository, cacheProvider);
export const analyticsService = new AnalyticsService(analyticsRepository);
export const savedSearchService = new SavedSearchService(savedSearchRepository);
export const dashboardAggregateService = new DashboardAggregateService(
  profileService,
  membershipService,
  searchService,
  messagingService,
  notificationService,
  savedSearchService,
  aiProviderRegistry
);

export const billingAggregate = new BillingAggregate(
  orderRepository,
  paymentRepository,
  invoiceRepository,
  transactionRepository,
  membershipRepository,
  paymentProvider,
  auditService
);

export const securityService = new SecurityService(passwordHistoryRepository, auditRepository, userRepository);
export const rateLimitService = new RateLimitService(cacheProvider);
export const csrfService = new CsrfService();
export const sessionSecurityService = new SessionSecurityService(userSessionHistoryRepository);
export const securityAuditService = new SecurityAuditService(auditRepository);
export const schedulerService = new SchedulerService();

// Milestone 4 - Enterprise final enhancements
export const telemetryService = new TelemetryService(telemetryRepository);
export const searchIndexService = new SearchIndexService(searchIndexRepository, telemetryService);
export const bulkOperationService = new BulkOperationService(bulkOperationRepository);
export const systemConfigService = new SystemConfigService(systemConfigurationRepository);

// Milestone 3 Production Services
import { WorkflowService } from "./services/workflow.service";
import { MemoryLockProvider } from "./locks/memory-lock-provider";
import { IdempotencyService } from "./services/idempotency.service";
import { WebhookService } from "./services/webhook.service";
import { EventStore } from "./events/event-store";
import { ComplianceService } from "./services/compliance.service";
import { ReleaseService } from "./services/release.service";
import { BillingService } from "./services/billing.service";
import { AIService } from "./services/ai.service";
import { LocalizationService } from "./services/localization.service";
import { MaintenanceService } from "./services/maintenance.service";
import { MediaPipelineService } from "./services/media-pipeline.service";
import { HealthService } from "./services/health.service";

// Phase 5 Imports
import { eventDispatcher } from "./events/event-dispatcher";
import {
  InMemoryAIFeedbackRepository,
  InMemoryFeatureStoreRepository,
  InMemoryModelRegistryRepository,
  InMemoryEmbeddingRepository,
  InMemoryDataCatalogRepository,
  InMemoryReportSnapshotRepository,
  InMemoryRuleRepository,
  InMemoryExperimentRepository,
  InMemoryAlertRepository,
  InMemoryKnowledgeRepository
} from "./repositories/implementations/phase5-repositories.impl";
import { TenantService } from "./services/tenant.service";
import { TenantBillingService } from "./services/tenant-billing.service";
import { TenantMigrationService } from "./services/tenant-migration.service";
import { EncryptionService } from "./services/encryption.service";
import { DisasterRecoveryService } from "./services/disaster-recovery.service";
import { AiPlatformService } from "./services/ai-platform.service";
import { AiOrchestrationService } from "./services/ai-orchestration.service";
import { EmbeddingService } from "./services/embedding.service";
import { PromptRegistryService } from "./services/prompt-registry.service";
import { ModelRegistryService } from "./services/model-registry.service";
import { AiEvaluationService } from "./services/ai-evaluation.service";
import { FeatureStoreService } from "./services/feature-store.service";
import { GovernanceService } from "./services/governance.service";
import { DataCatalogService } from "./services/data-catalog.service";
import { RuleEngineService } from "./services/rule-engine.service";
import { DecisionEngineService } from "./services/decision-engine.service";
import { PolicyEngineService } from "./services/policy-engine.service";
import { DataQualityService } from "./services/data-quality.service";
import { ReportBuilderService } from "./services/report-builder.service";
import { DashboardEngineService } from "./services/dashboard-engine.service";
import { ForecastingService } from "./services/forecasting.service";
import { CapacityPlanningService } from "./services/capacity-planning.service";
import { CostManagementService } from "./services/cost-management.service";
import { SaasMetricsService } from "./services/saas-metrics.service";
import { SecurityIntelligenceService } from "./services/security-intelligence.service";
import { IdentityService } from "./services/identity.service";
import { WebAuthnService } from "./services/webauthn.service";
import { MfaService } from "./services/mfa.service";
import { SessionRiskService } from "./services/session-risk.service";
import { AuthorizationService } from "./services/authorization.service";
import { PolicyEvaluatorService } from "./services/policy-evaluator.service";
import { OperationsAutomationService } from "./services/operations-automation.service";
import { PluginService } from "./services/plugin.service";
import { AgentPlatformService } from "./services/agent-platform.service";
import { ReliabilityService } from "./services/reliability.service";
import { DeveloperPlatformService } from "./services/developer-platform.service";

export const workflowService = new WorkflowService();
export const lockProvider = new MemoryLockProvider();
export const idempotencyService = new IdempotencyService(lockProvider);
export const webhookService = new WebhookService(idempotencyService);
export const eventStore = new EventStore();
export const complianceService = new ComplianceService();
export const releaseService = new ReleaseService();
export const billingService = new BillingService();
export const aiService = new AIService();
export const localizationService = new LocalizationService();
export const maintenanceService = new MaintenanceService();
export const mediaPipelineService = new MediaPipelineService();
export const healthService = new HealthService();

// Phase 5 Repository Instances
export const aiFeedbackRepository = new InMemoryAIFeedbackRepository();
export const featureStoreRepository = new InMemoryFeatureStoreRepository();
export const modelRegistryRepository = new InMemoryModelRegistryRepository();
export const embeddingRepository = new InMemoryEmbeddingRepository();
export const dataCatalogRepository = new InMemoryDataCatalogRepository();
export const reportSnapshotRepository = new InMemoryReportSnapshotRepository();
export const ruleRepository = new InMemoryRuleRepository();
export const experimentRepository = new InMemoryExperimentRepository();
export const alertRepository = new InMemoryAlertRepository();
export const knowledgeRepository = new InMemoryKnowledgeRepository();

// Phase 5 Service Instances
export const tenantService = new TenantService(telemetryService, eventDispatcher);
export const tenantBillingService = new TenantBillingService(telemetryService);
export const tenantMigrationService = new TenantMigrationService();
export const encryptionService = new EncryptionService();
export const disasterRecoveryService = new DisasterRecoveryService(telemetryService);
export const aiPlatformService = new AiPlatformService(telemetryService, eventDispatcher);
export const aiOrchestrationService = new AiOrchestrationService(aiPlatformService);
export const embeddingService = new EmbeddingService(embeddingRepository);
export const promptRegistryService = new PromptRegistryService(eventDispatcher);
export const modelRegistryService = new ModelRegistryService(modelRegistryRepository, eventDispatcher);
export const aiEvaluationService = new AiEvaluationService();
export const featureStoreService = new FeatureStoreService(featureStoreRepository, eventDispatcher);
export const governanceService = new GovernanceService();
export const dataCatalogService = new DataCatalogService(dataCatalogRepository);
export const ruleEngineService = new RuleEngineService(ruleRepository);
export const decisionEngineService = new DecisionEngineService(ruleEngineService);
export const policyEngineService = new PolicyEngineService(decisionEngineService);
export const dataQualityService = new DataQualityService();
export const reportBuilderService = new ReportBuilderService(reportSnapshotRepository, eventDispatcher);
export const dashboardEngineService = new DashboardEngineService();
export const forecastingService = new ForecastingService(eventDispatcher);
export const capacityPlanningService = new CapacityPlanningService();
export const costManagementService = new CostManagementService();
export const saasMetricsService = new SaasMetricsService();
export const securityIntelligenceService = new SecurityIntelligenceService(eventDispatcher);
export const identityService = new IdentityService(eventDispatcher);
export const webAuthnService = new WebAuthnService();
export const mfaService = new MfaService();
export const sessionRiskService = new SessionRiskService();
export const authorizationService = new AuthorizationService(permissionService);
export const policyEvaluatorService = new PolicyEvaluatorService(authorizationService);
export const operationsAutomationService = new OperationsAutomationService();
export const pluginService = new PluginService();
export const agentPlatformService = new AgentPlatformService();
export const reliabilityService = new ReliabilityService();
export const developerPlatformService = new DeveloperPlatformService();

export const container = {
  repositories: {
    userRepository,
    profileRepository,
    interestRepository,
    messageRepository,
    membershipRepository,
    notificationRepository,
    auditRepository,
    searchRepository,
    verificationOtpRepository,
    userSessionHistoryRepository,
    mediaRepository,
    photoRepository,
    verificationRepository,
    imageMetadataRepository,
    moderationRepository,
    orderRepository,
    paymentRepository,
    invoiceRepository,
    transactionRepository,
    webhookRepository,
    conversationRepository,
    conversationParticipantRepository,
    messageReactionRepository,
    recommendationRepository,
    cmsRepository,
    featureFlagRepository,
    analyticsRepository,
    savedSearchRepository,
    searchIndexRepository,
    systemConfigurationRepository,
    jobRepository,
    bulkOperationRepository,
    telemetryRepository,
    aiFeedbackRepository,
    featureStoreRepository,
    modelRegistryRepository,
    embeddingRepository,
    dataCatalogRepository,
    reportSnapshotRepository,
    ruleRepository,
    experimentRepository,
    alertRepository,
    knowledgeRepository,
  },
  providers: {
    storageProvider,
    emailProvider,
    emailOtpProvider,
    smsOtpProvider,
    paymentProvider,
    realtimeProvider,
    cacheProvider,
    lockProvider,
    eventStore,
  },
  services: {
    authService,
    profileService,
    searchService,
    interestService,
    messagingService,
    membershipService,
    notificationService,
    auditService,
    compatibilityService,
    completionService,
    permissionService,
    imageService,
    otpService,
    storageService,
    verificationService,
    moderationService,
    billingAggregate,
    recommendationService,
    cmsService,
    featureFlagService,
    analyticsService,
    savedSearchService,
    securityService,
    rateLimitService,
    csrfService,
    sessionSecurityService,
    securityAuditService,
    schedulerService,
    searchRankingService,
    dashboardAggregateService,
    fraudDetectionService,
    marketingCampaignService,
    reportService,
    telemetryService,
    searchIndexService,
    bulkOperationService,
    systemConfigService,
    workflowService,
    idempotencyService,
    webhookService,
    complianceService,
    releaseService,
    billingService,
    aiService,
    localizationService,
    maintenanceService,
    mediaPipelineService,
    healthService,
    tenantService,
    tenantBillingService,
    tenantMigrationService,
    encryptionService,
    disasterRecoveryService,
    aiPlatformService,
    aiOrchestrationService,
    embeddingService,
    promptRegistryService,
    modelRegistryService,
    aiEvaluationService,
    featureStoreService,
    governanceService,
    dataCatalogService,
    ruleEngineService,
    decisionEngineService,
    policyEngineService,
    dataQualityService,
    reportBuilderService,
    dashboardEngineService,
    forecastingService,
    capacityPlanningService,
    costManagementService,
    saasMetricsService,
    securityIntelligenceService,
    identityService,
    webAuthnService,
    mfaService,
    sessionRiskService,
    authorizationService,
    policyEvaluatorService,
    operationsAutomationService,
    pluginService,
    agentPlatformService,
    reliabilityService,
    developerPlatformService,
  },
  cache: cacheProvider,
};

// Initialize Domain Event Subscribers at startup
initEventSubscribers();

// Start background jobs scheduler
schedulerService.start().catch((err) => {
  loggerService.error("Failed to start scheduler at container initialization", {}, err);
});

export { fraudDetectionService, marketingCampaignService, reportService };

