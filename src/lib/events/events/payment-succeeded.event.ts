import { DomainEvent } from "../domain-event";

export class PaymentSucceededEvent implements DomainEvent<{ userId: string; orderId: string; amount: number }> {
  name = "PaymentSucceeded";
  occurredAt = new Date();
  constructor(public data: { userId: string; orderId: string; amount: number }) {}
}
