# InstantMatrimony V2 Enterprise - API Documentation

## REST Endpoints
- `GET /api/health` - Diagnostic system health status
- `GET /api/v1/health` - API readiness check
- `GET /api/docs` - OpenAPI 3.0 specification json

## Server Actions Summary
- `getSettingsAction()` / `updateSettingsAction()` - White-label settings management
- `getRolePermissionsAction()` / `assignPermissionAction()` - RBAC administration
- `getEmailTemplatesAction()` / `updateEmailTemplateAction()` - Template builder
- `getOverviewMetricsAction()` / `getRevenueTrendAction()` - Analytics reports
- `getAuditLogsAction()` - Audit Trail inspector
- `getSystemHealthAction()` - System Health check
- `createBackupAction()` / `restoreBackupAction()` - Backup manager
- `runSetupWizardAction()` - First-run installer
