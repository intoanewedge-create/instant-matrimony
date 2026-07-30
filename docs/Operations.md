# Operations and Maintenance Guide

This document covers daily maintenance tasks and scheduler executions.

## 1. Background Job Scheduler

The background scheduler is managed by `SchedulerService` wrapping an `IScheduler` interface. In production, this can be configured to use Redis-backed BullMQ or Trigger.dev.

Core jobs registered on startup:
1. `membership-expiration` (2 hours): Checks and updates user account access status.
2. `premium-downgrade` (4 hours): Downgrades expired accounts to standard tier.
3. `notification-cleanup` (24 hours): Purges old read system notifications.
4. `otp-cleanup` (1 hour): Deletes expired OTP records.
5. `session-cleanup` (6 hours): Marks inactive session histories as logged out.
6. `cache-cleanup` (12 hours): Evicts stale items from cache providers.
7. `audit-log-archival` (24 hours): Archives logs older than 90 days.
8. `analytics-aggregation` (2 hours): Consolidates user usage statistics.
9. `recommendation-refresh` (30 minutes): Refreshes user recommendation matches cache.
10. `cms-cache-warming` (1 hour): Re-caches popular CMS pages slug contents.

## 2. Database Maintenance

Execute index optimizations periodically:
```sql
VACUUM ANALYZE;
```
Verify table size and vacuum health regularly.
