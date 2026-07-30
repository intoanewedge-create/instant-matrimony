import { DomainEvent } from "../domain-event";

export class VerificationCompletedEvent implements DomainEvent<{ userId: string; status: string }> {
  name = "VerificationCompleted";
  occurredAt = new Date();
  constructor(public data: { userId: string; status: string }) {}
}
