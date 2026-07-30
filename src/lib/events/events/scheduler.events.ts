import { DomainEvent } from "../domain-event";

export class JobStartedEvent implements DomainEvent<{ jobName: string; timestamp: Date }> {
  name = "JobStarted";
  occurredAt = new Date();
  constructor(public data: { jobName: string; timestamp: Date }) {}
}

export class JobCompletedEvent implements DomainEvent<{ jobName: string; durationMs: number; timestamp: Date }> {
  name = "JobCompleted";
  occurredAt = new Date();
  constructor(public data: { jobName: string; durationMs: number; timestamp: Date }) {}
}

export class JobFailedEvent implements DomainEvent<{ jobName: string; error: string; timestamp: Date }> {
  name = "JobFailed";
  occurredAt = new Date();
  constructor(public data: { jobName: string; error: string; timestamp: Date }) {}
}

export class JobRetriedEvent implements DomainEvent<{ jobName: string; retryCount: number; maxRetries: number; error: string; timestamp: Date }> {
  name = "JobRetried";
  occurredAt = new Date();
  constructor(public data: { jobName: string; retryCount: number; maxRetries: number; error: string; timestamp: Date }) {}
}

export class QueueOverflowEvent implements DomainEvent<{ queueDepth: number; maxLimit: number; timestamp: Date }> {
  name = "QueueOverflow";
  occurredAt = new Date();
  constructor(public data: { queueDepth: number; maxLimit: number; timestamp: Date }) {}
}

export class DLQEvent implements DomainEvent<{ jobName: string; error: string; timestamp: Date }> {
  name = "DLQPush";
  occurredAt = new Date();
  constructor(public data: { jobName: string; error: string; timestamp: Date }) {}
}
