import { DomainEvent } from "../domain-event";

export class ProfileApprovedEvent implements DomainEvent<{ userId: string; approvedBy: string }> {
  name = "ProfileApproved";
  occurredAt = new Date();
  constructor(public data: { userId: string; approvedBy: string }) {}
}
