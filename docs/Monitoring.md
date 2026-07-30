# Monitoring and Observability Guide

InstantMatrimony Enterprise features comprehensive observability through structured logging and Prometheus-compatible metrics endpoints.

## 1. Metrics Endpoint

The application exposes a Prometheus metric format endpoint at:
`GET /api/v1/metrics`

This endpoint outputs performance indicators:
- **Infrastructure Metrics:** Memory RSS, CPU user/system times, and heap size metrics.
- **Application Metrics:** Cache hit ratios, cache hit counts, cache misses counts.
- **Business Metrics:** Active session counts, user registration counts, total verification OTP requests, chat messages sent, and successful/failed payments count.

### Scraping config (Prometheus)

Add the following job configuration to your `/etc/prometheus/prometheus.yml`:
```yaml
scrape_configs:
  - job_name: 'instant-matrimony'
    scrape_interval: 15s
    metrics_path: '/api/v1/metrics'
    static_configs:
      - targets: ['localhost:3000']
```

## 2. Structured JSON Logging

All logs are written to stdout in JSON format using `Pino`. Sensitive data (passwords, OTPs, identity numbers) are automatically masked before write.

Example log output:
```json
{"level":30,"time":1690022201042,"msg":"Security Audit Log [SECURITY_LOGIN] created","userId":"user-uuid-123","action":"SECURITY_LOGIN","ipAddress":"127.0.0.1"}
```

## 3. Alerts Recommendations

We recommend setting up alerts for:
- Memory usage (`node_memory_heap_used_bytes > 850MB`)
- Failed payments (`rate(app_payment_failure_total[5m]) > 5`)
- Cache hit ratio dropping (`app_cache_hit_ratio < 0.5`)
- Pod Down time (`up == 0`)
