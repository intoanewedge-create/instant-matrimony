export interface RecommendationExplanation {
  primaryReason: string;
  contributingFactors: string[];
  compatibilityMatchPercent: number;
}

export interface RecommendationModel {
  modelId: string;
  name: string;
  version: string;
  algorithm: "COLLABORATIVE_FILTERING" | "LEARNING_TO_RANK" | "HYBRID" | "CONTENT_BASED";
  isActive: boolean;
}

export interface ModelMetadata {
  trainedAt: Date;
  accuracyScore: number;
  f1Score: number;
  featuresUsed: string[];
}

export interface FeatureVector {
  userId: string;
  features: Record<string, number | string | boolean>;
  timestamp: Date;
  version: string;
}

export interface ModelPrediction {
  predictionId: string;
  userId: string;
  targetId: string;
  predictedScore: number;
  modelVersion: string;
  featureVersion: string;
  confidenceScore: number;
  explanation: RecommendationExplanation;
  timestamp: Date;
}

export interface ExperimentResult {
  experimentId: string;
  variantId: string;
  conversions: number;
  totalTrials: number;
  conversionRate: number;
  confidenceInterval: [number, number];
  isWinner: boolean;
}

export interface SegmentDefinition {
  segmentId: string;
  name: string;
  rules: string[];
  memberCount: number;
}

export interface FraudRiskAssessment {
  userId: string;
  riskScore: number; // 0 to 100
  factors: string[];
  reasons: string[];
  botProbability: number;
  fingerprintHash: string;
  detectedAt: Date;
}

export interface BehaviorProfile {
  userId: string;
  clickRate: number;
  averageSessionLengthSec: number;
  impossibleTravelDetected: boolean;
  lastKnownIp: string;
  lastKnownDevice: string;
}

export interface ContentEmbedding {
  id: string;
  vector: number[];
  textPayload: string;
  model: string;
  version: string;
  createdAt: Date;
}

export interface SemanticSearchResult {
  id: string;
  score: number;
  payload: string;
  metadata?: Record<string, any>;
}

export interface WarehouseJob {
  jobId: string;
  type: "ETL" | "ELT" | "CLEANUP";
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  recordsProcessed: number;
  startedAt: Date;
  completedAt: Date | null;
  errorMessage?: string;
}

export interface AnalyticsSnapshot {
  snapshotId: string;
  timestamp: Date;
  mrr: number;
  arr: number;
  ltv: number;
  cac: number;
  churnRate: number;
}

export interface CustomerHealth {
  userId: string;
  healthScore: number; // 0-100
  ticketCount: number;
  lastActivityAt: Date;
  status: "HEALTHY" | "RISKY" | "CRITICAL";
}

export interface CampaignMetrics {
  campaignId: string;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  conversions: number;
  cost: number;
}

export interface PricingStrategy {
  strategyId: string;
  region: string;
  basePrice: number;
  discountPercentage: number;
  finalPrice: number;
  effectiveFrom: Date;
  effectiveTo: Date;
}

export interface GovernancePolicy {
  policyId: string;
  name: string;
  rules: string[];
  classification: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "PII";
  retentionPeriodMonths: number;
  isActive: boolean;
}

export interface KnowledgeArticle {
  articleId: string;
  title: string;
  content: string;
  category: string;
  version: number;
  updatedAt: Date;
}

export interface LocalizationBundle {
  locale: string;
  translations: Record<string, string>;
  rtl: boolean;
  version: string;
}

export interface TranslationJob {
  jobId: string;
  sourceText: string;
  targetLocale: string;
  translatedText?: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
}

export interface PlatformCapacity {
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  storageUsedBytes: number;
  storageFreeBytes: number;
  queueDepth: number;
  activeWorkers: number;
}

export interface ResourceForecast {
  metricName: string;
  currentValue: number;
  forecastedValueNextMonth: number;
  confidencePercent: number;
}

export interface ModelDeployment {
  deploymentId: string;
  modelId: string;
  version: string;
  status: "SHADOW" | "CANARY" | "ACTIVE" | "INACTIVE";
  trafficWeight: number; // percentage
  deployedAt: Date;
}

export interface ModelEvaluation {
  evaluationId: string;
  modelId: string;
  version: string;
  datasetId: string;
  accuracy: number;
  latencyMs: number;
  evaluatedAt: Date;
}

export interface ModelDriftReport {
  reportId: string;
  modelId: string;
  version: string;
  driftScore: number; // 0 to 1
  isDrifted: boolean;
  checkedAt: Date;
}

export interface PromptDefinition {
  promptId: string;
  name: string;
  template: string;
  version: string;
  approved: boolean;
  createdAt: Date;
}

export interface PromptExecution {
  executionId: string;
  promptId: string;
  version: string;
  tokensUsed: number;
  cost: number;
  latencyMs: number;
  success: boolean;
  timestamp: Date;
}

export interface PromptCostSummary {
  promptId: string;
  totalCost: number;
  totalTokens: number;
  executionsCount: number;
}

export interface RecommendationExperiment {
  experimentId: string;
  name: string;
  championModelId: string;
  challengerModelId: string;
  trafficSplit: number; // e.g. 90 represents 90% champion, 10% challenger
  status: "RUNNING" | "COMPLETED" | "DRAFT";
  startedAt: Date;
  endedAt?: Date;
}

export interface EmbeddingMetadata {
  id: string;
  dimension: number;
  modelName: string;
  payloadText: string;
}

export interface KnowledgeChunk {
  chunkId: string;
  articleId: string;
  text: string;
  embeddingId?: string;
}

export interface KnowledgeSearchResult {
  chunkId: string;
  articleId: string;
  title: string;
  text: string;
  similarityScore: number;
}

export interface DataLineageRecord {
  recordId: string;
  sourceTable: string;
  targetTable: string;
  operation: string;
  timestamp: Date;
  user: string;
}

export interface DataClassification {
  tableName: string;
  columnName: string;
  classification: "PII" | "CONFIDENTIAL" | "RESTRICTED" | "PUBLIC";
  owner: string;
}

export interface CapacityForecast {
  target: string; // e.g. "DATABASE" | "STORAGE"
  currentSizeGb: number;
  forecastedSizeGb30Days: number;
  growthRatePercent: number;
  calculatedAt: Date;
}

export interface InfrastructureCost {
  costId: string;
  provider: string; // e.g. "AWS" | "VERCEL" | "OPENAI"
  category: "COMPUTE" | "STORAGE" | "AI" | "CDN" | "NOTIFICATION";
  amount: number;
  billingPeriod: string; // e.g. "2026-07"
}

export interface AlertDefinition {
  alertId: string;
  name: string;
  metric: string;
  threshold: number;
  comparison: "GREATER_THAN" | "LESS_THAN";
  severity: "INFO" | "WARNING" | "CRITICAL";
}

export interface AlertIncident {
  incidentId: string;
  alertId: string;
  metricValue: number;
  status: "OPEN" | "RESOLVED" | "ACKNOWLEDGED";
  triggeredAt: Date;
  resolvedAt?: Date;
}

export interface PlatformPolicy {
  policyId: string;
  name: string;
  expression: string; // evaluated via rule engine
  action: "ALLOW" | "DENY" | "FLAG";
  isActive: boolean;
}

export interface PlatformAuditRecord {
  auditId: string;
  actor: string;
  action: string;
  target: string;
  previousValues: string;
  newValues: string;
  timestamp: Date;
}

export interface ReportSnapshot {
  snapshotId: string;
  reportType: string;
  dataJson: string;
  generatedBy: string;
  hash: string;
  createdAt: Date;
}

export interface EnterpriseDashboard {
  dashboardId: string;
  name: string;
  layoutJson: string;
  rolesAllowed: string[];
}

export interface RecommendationFeedback {
  feedbackId: string;
  predictionId: string;
  userId: string;
  rating: number;
  comments?: string;
  createdAt: Date;
}
