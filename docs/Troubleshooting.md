# Troubleshooting and Recovery Guide

This guide describes issues, diagnostics steps, and recovery procedures.

## 1. Database Connection Lockouts

### Symptoms
- Application requests time out.
- Healthcheck endpoints (/api/v1/health) return DB Status DOWN.
- Error logs show `PrismaClientInitializationError: DB connections limit reached`.

### Recovery Steps
1. Log in to your database cluster.
2. Check active connections:
   ```sql
   SELECT pid, age(clock_timestamp(), query_start), usename, query, state 
   FROM pg_stat_activity 
   WHERE state != 'idle';
   ```
3. Terminate hung queries blocking tables:
   ```sql
   SELECT pg_terminate_backend(pid);
   ```
4. Scale up the connection pool limit inside `DATABASE_URL` by appending `&connection_limit=50`.

## 2. Rate-Limiting Lockouts

### Symptoms
- Clients receive `429 Too Many Requests` responses.
- API returns details on `Retry-After`.

### Recovery Steps
1. If the lockout is for a legitimate user or system test, flush their cache key:
   ```bash
   redis-cli del "ratelimit:login:user-identifier"
   ```
2. For IP blocks, verify if the client has dynamic IPs or is behind a proxy. Configure `TRUST_PROXY=true` in environment variables if necessary.

## 3. Cache Eviction / OOM Issues

### Symptoms
- Memory usage goes up to limit.
- Cache hit ratio drops to 0.

### Recovery Steps
1. Verify cache metrics:
   `GET /api/v1/metrics`
2. Flush cache keys to free memory:
   ```bash
   redis-cli flushall
   ```
3. If using memory-cache provider, restart the next.js process to free memory heap.
