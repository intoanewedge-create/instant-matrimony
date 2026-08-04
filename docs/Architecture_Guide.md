# InstantMatrimony V2 Enterprise - Architecture Guide

```
+-----------------------------------------------------------------------+
|                             USER CLIENT                               |
|       (Next.js React 19 App Router + Dynamic CSS Custom Properties)   |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------+-----------------------------------+
|                    SERVER ACTIONS & API LAYER                         |
|   (settings.actions, rbac.actions, reports.actions, /api/health)      |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------+-----------------------------------+
|                    MODULAR SERVICES & PROVIDERS                       |
|   (WebsiteSettingsService, RbacService, StorageProvider, Payments)   |
+-----------------------------------+-----------------------------------+
                                    |
                                    v
+-----------------------------------+-----------------------------------+
|                    PRISMA ORM & POSTGRESQL DB                         |
+-----------------------------------------------------------------------+
```
