# Architecture Design Guide

This guide details the Clean Architecture patterns, structural folders, and event handling layers of the platform.

## 1. Clean Architecture Layers

The request processing pipeline flows through the following layers:

```
[React Components / Server Actions]
               │
               ▼
[Authentication & Zod Validators]
               │
               ▼
      [Domain Services]
               │
               ▼
    [Repository Interfaces]
               │
               ▼
[Prisma Repository Implementations]
               │
               ▼
         [PostgreSQL]
```

- **Domain Services:** Contains orchestrating business rules (e.g. `AuthService`, `SecurityService`, `BillingAggregate`). Does not access database tables directly.
- **Repository Implementations:** Encapsulates raw database queries within the repository pattern. No business logic belongs here.

## 2. Event-Driven Architecture

The application decouples cross-domain side effects using a formal `EventBus` design:
- Domain events are declared under `src/lib/events/events/`.
- The `EventDispatcher` implements `EventBus` and handles publishing to subscribers.
- In `src/lib/events/subscribers.ts`, listeners are registered on start to run tasks like triggering billing receipts, notifications, OTP sms, and analytics logs.

## 3. Database Transaction (tx) Flow

To prevent database inconsistencies, repositories and services accept an optional `tx` argument to join a transaction:
```typescript
await this.executeTransaction(async (tx) => {
  await tx.user.update(...);
  await this.passwordHistoryRepository.create(userId, hashedPassword, tx);
  await this.auditRepository.create(userId, "ACTION", ip, ua, details, tx);
});
```
This guarantees atomicity across multiple repository modifications.
