# Operations Runbook

This runbook describes step-by-step procedures for platform initialization and configuration tuning.

## 1. Startup Configurations Validation

Before starting up the application, verify that your environment parameters are correct:
```bash
# Check database connectivity
pg_isready -h localhost -p 5432 -U postgres

# Check redis ping status
redis-cli -h localhost ping
```

## 2. Dynamic Log Level Modifications

The `LoggerService` supports trace, debug, info, warn, error, and fatal levels. You can override the default level dynamically by modifying the `LOG_LEVEL` environment variable and restarting/reloading the application container:
```bash
LOG_LEVEL=DEBUG npm run start
```

## 3. Triggering Manual Job Executions

To trigger a background job (such as membership check or OTP purge) manually, execute the corresponding task command or make a secured API request:
- Access the admin panel dashboard.
- Invoke the secured webhook route under `src/app/api/webhooks/scheduler` (configured with authorization tokens verification).
- Alternatively, run the sandbox runner script:
```bash
npx tsx src/lib/scheduler/run-job.ts --job=otp-cleanup
```
