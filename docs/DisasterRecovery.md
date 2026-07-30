# Disaster Recovery (DR) Plan

This plan documents actions to recover InstantMatrimony system operations in case of a critical failure or region outage.

## 1. RTO & RPO Targets

- **Recovery Time Objective (RTO):** < 15 minutes (duration allowed to restore services).
- **Recovery Point Objective (RPO):** < 5 minutes (data loss limit defined by backup intervals).

## 2. Multi-Region Replication

- **PostgreSQL Database:** Configure a hot-standby database in a secondary AWS region using streaming replication.
- **S3 / R2 Storage:** Configure active-passive cross-region replication for photos and document uploads.
- **DNS Failover:** Configure Route53 with active-passive failover and health checks routing to the standby region.

## 3. Failover Execution Runbook

In case the primary region goes offline:
1. **Verify Outage:** Check cloud console status pages and local monitoring dashboards.
2. **Promote Standby Database:** Execute database promotion command on the standby replica node:
   ```bash
   pg_ctl promote -D /var/lib/postgresql/data
   ```
3. **Trigger DNS Switch:** Update Route53 records to point traffic to the secondary load balancers.
4. **Initiate Verification:** Test liveness `/api/v1/live` and readiness `/api/v1/ready` endpoints in the failover region.
5. **Declare Operations Restored:** Notify operations and marketing teams.
