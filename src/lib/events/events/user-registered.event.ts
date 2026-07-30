import { DomainEvent } from "../domain-event";

export class UserRegisteredEvent implements DomainEvent<{ userId: string; email: string }> {
  name = "UserRegistered";
  occurredAt = new Date();
  constructor(public data: { userId: string; email: string }) {}
}
