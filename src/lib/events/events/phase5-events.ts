import { DomainEvent } from "../domain-event";

export interface Phase5DomainEvent<T = any> extends DomainEvent<T> {
  correlationId?: string;
  causationId?: string;
  schemaVersion: number;
}

export class RecommendationGeneratedEventV1 implements Phase5DomainEvent<{ userId: string; candidates: string[] }> {
  name = "RecommendationGeneratedV1";
  occurredAt = new Date();
  schemaVersion = 1;
  constructor(
    public data: { userId: string; candidates: string[] },
    public correlationId?: string,
    public causationId?: string
  ) {}
}

export class RecommendationGeneratedEventV2 implements Phase5DomainEvent<{ userId: string; candidates: string[]; algorithmUsed: string }> {
  name = "RecommendationGeneratedV2";
  occurredAt = new Date();
  schemaVersion = 2;
  constructor(
    public data: { userId: string; candidates: string[]; algorithmUsed: string },
    public correlationId?: string,
    public causationId?: string
  ) {}
}

export class RecommendationFeedbackReceivedEventV1 implements Phase5DomainEvent<{ userId: string; targetId: string; feedbackType: string }> {
  name = "RecommendationFeedbackReceivedV1";
  occurredAt = new Date();
  schemaVersion = 1;
  constructor(
    public data: { userId: string; targetId: string; feedbackType: string },
    public correlationId?: string,
    public causationId?: string
  ) {}
}

export class EmbeddingCreatedEventV1 implements Phase5DomainEvent<{ contentId: string; modelName: string }> {
  name = "EmbeddingCreatedV1";
  occurredAt = new Date();
  schemaVersion = 1;
  constructor(
    public data: { contentId: string; modelName: string },
    public correlationId?: string,
    public causationId?: string
  ) {}
}

export class FeatureSnapshotCreatedEventV1 implements Phase5DomainEvent<{ userId: string; version: string }> {
  name = "FeatureSnapshotCreatedV1";
  occurredAt = new Date();
  schemaVersion = 1;
  constructor(
    public data: { userId: string; version: string },
    public correlationId?: string,
    public causationId?: string
  ) {}
}

export class ModelDeployedEventV1 implements Phase5DomainEvent<{ modelId: string; version: string; environment: string }> {
  name = "ModelDeployedV1";
  occurredAt = new Date();
  schemaVersion = 1;
  constructor(
    public data: { modelId: string; version: string; environment: string },
    public correlationId?: string,
    public causationId?: string
  ) {}
}

export class ModelRolledBackEventV1 implements Phase5DomainEvent<{ modelId: string; rolledBackFromVersion: string; targetVersion: string }> {
  name = "ModelRolledBackV1";
  occurredAt = new Date();
  schemaVersion = 1;
  constructor(
    public data: { modelId: string; rolledBackFromVersion: string; targetVersion: string },
    public correlationId?: string,
    public causationId?: string
  ) {}
}

export class PromptExecutedEventV1 implements Phase5DomainEvent<{ promptId: string; version: string; cost: number }> {
  name = "PromptExecutedV1";
  occurredAt = new Date();
  schemaVersion = 1;
  constructor(
    public data: { promptId: string; version: string; cost: number },
    public correlationId?: string,
    public causationId?: string
  ) {}
}

export class AIBudgetExceededEventV1 implements Phase5DomainEvent<{ budgetType: string; limit: number; currentUsage: number }> {
  name = "AIBudgetExceededV1";
  occurredAt = new Date();
  schemaVersion = 1;
  constructor(
    public data: { budgetType: string; limit: number; currentUsage: number },
    public correlationId?: string,
    public causationId?: string
  ) {}
}

export class KnowledgeBaseUpdatedEventV1 implements Phase5DomainEvent<{ articleId: string; action: string }> {
  name = "KnowledgeBaseUpdatedV1";
  occurredAt = new Date();
  schemaVersion = 1;
  constructor(
    public data: { articleId: string; action: string },
    public correlationId?: string,
    public causationId?: string
  ) {}
}

export class ExperimentStartedEventV1 implements Phase5DomainEvent<{ experimentId: string; name: string }> {
  name = "ExperimentStartedV1";
  occurredAt = new Date();
  schemaVersion = 1;
  constructor(
    public data: { experimentId: string; name: string },
    public correlationId?: string,
    public causationId?: string
  ) {}
}

export class ExperimentCompletedEventV1 implements Phase5DomainEvent<{ experimentId: string; winningVariant: string }> {
  name = "ExperimentCompletedV1";
  occurredAt = new Date();
  schemaVersion = 1;
  constructor(
    public data: { experimentId: string; winningVariant: string },
    public correlationId?: string,
    public causationId?: string
  ) {}
}

export class PolicyViolationEventV1 implements Phase5DomainEvent<{ policyId: string; userId: string; violationDetails: string }> {
  name = "PolicyViolationV1";
  occurredAt = new Date();
  schemaVersion = 1;
  constructor(
    public data: { policyId: string; userId: string; violationDetails: string },
    public correlationId?: string,
    public causationId?: string
  ) {}
}

export class SecurityThreatDetectedEventV1 implements Phase5DomainEvent<{ userId: string; threatType: string; score: number }> {
  name = "SecurityThreatDetectedV1";
  occurredAt = new Date();
  schemaVersion = 1;
  constructor(
    public data: { userId: string; threatType: string; score: number },
    public correlationId?: string,
    public causationId?: string
  ) {}
}

export class ForecastCompletedEventV1 implements Phase5DomainEvent<{ target: string; growthRate: number }> {
  name = "ForecastCompletedV1";
  occurredAt = new Date();
  schemaVersion = 1;
  constructor(
    public data: { target: string; growthRate: number },
    public correlationId?: string,
    public causationId?: string
  ) {}
}

export class ReportGeneratedEventV1 implements Phase5DomainEvent<{ snapshotId: string; reportType: string }> {
  name = "ReportGeneratedV1";
  occurredAt = new Date();
  schemaVersion = 1;
  constructor(
    public data: { snapshotId: string; reportType: string },
    public correlationId?: string,
    public causationId?: string
  ) {}
}

export class UserVerifiedEventV1 implements Phase5DomainEvent<{ userId: string }> {
  name = "UserVerifiedV1";
  occurredAt = new Date();
  schemaVersion = 1;
  constructor(
    public data: { userId: string },
    public correlationId?: string,
    public causationId?: string
  ) {}
}

export class SubscriptionActivatedEventV1 implements Phase5DomainEvent<{ userId: string; planName: string }> {
  name = "SubscriptionActivatedV1";
  occurredAt = new Date();
  schemaVersion = 1;
  constructor(
    public data: { userId: string; planName: string },
    public correlationId?: string,
    public causationId?: string
  ) {}
}
