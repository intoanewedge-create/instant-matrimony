# Portal Administration & Platform Security

The InstantMatrimony Enterprise Console provides portal operators, content editors, and moderators with secure interfaces to manage system configurations, profile statuses, and marketing campaigns.

## 1. Security Architecture & Role Gating (RBAC)

All admin routes (`/admin/*`) and administrative server-side operations are secured using two verification layers:
1. **Server Actions Guard (`checkAuth`)**: Validates the active user's NextAuth session and checks their role against permission definitions.
2. **Layout Route Guard (`verifyAdminAccess`)**: Validates requests before rendering folders, ensuring unauthorized staff cannot load sensitive modules.

### Role to Permission Mapping
| Role | Allowed Action Permissions |
| :--- | :--- |
| **SUPER_ADMIN** | `MANAGE_SYSTEM`, `EXPORT_REPORTS`, `VIEW_ANALYTICS`, `MANAGE_MODERATION`, `MANAGE_VERIFICATION`, `MANAGE_MARKETING`, `MANAGE_CMS` |
| **ADMIN** | `EXPORT_REPORTS`, `VIEW_ANALYTICS`, `MANAGE_MODERATION`, `MANAGE_VERIFICATION`, `MANAGE_MARKETING`, `MANAGE_CMS` |
| **MODERATOR** | `MANAGE_MODERATION`, `MANAGE_VERIFICATION` |
| **MARKETING_MANAGER** | `MANAGE_MARKETING`, `VIEW_ANALYTICS` |
| **CONTENT_MANAGER** | `MANAGE_CMS` |
| **ANALYST** | `VIEW_ANALYTICS` |

## 2. Feature Flag Gating

Every admin workspace verifies that its corresponding module is active before rendering components.
- If a workspace key (e.g., `Verification`, `Moderation`, `Analytics`) is disabled in settings, routes automatically redirect operators to the fallback `/admin/disabled` route, preventing broken actions.
- The module states are verified server-side using the `FeatureFlagService` and persisted directly inside the PostgreSQL database.

## 3. Observability & Change Logging

All operations performed via the server actions layer are wrapper-logged. The logs capture:
- **`correlationId`**: Unique request UUID to trace events across services.
- **`adminId`**: Operator responsible for triggering the action.
- **`action`**: e.g., `USER_SUSPEND`, `CAMPAIGN_PUBLISH`, `CMS_ROLLBACK`.
- **`ipAddress` & `userAgent`**: Client details for compliance auditing.
- **`details`**: Before and after snapshots of affected configuration values.
