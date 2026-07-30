import { DomainEvent } from "../domain-event";

export class MembershipPurchasedEvent implements DomainEvent<{ userId: string; membershipId: string; tier: string }> {
  name = "MembershipPurchased";
  occurredAt = new Date();
  constructor(public data: { userId: string; membershipId: string; tier: string }) {}
}
