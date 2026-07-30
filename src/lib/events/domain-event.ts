export interface DomainEvent<T = any> {
  name: string;
  occurredAt: Date;
  data: T;
}
