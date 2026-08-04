# InstantMatrimony V2 Enterprise - Database ER Diagram

## Primary Entity Relationships
- **User** (1:1) -> **Profile**
- **User** (1:N) -> **Membership**, **Order**, **Payment**, **AuditLog**
- **Profile** (1:N) -> **Photo**
- **EmailTemplate** (1:N) -> **EmailTemplateVersion**
- **Permission** (N:M via **RolePermission**) -> **Role**
- **SiteSettings** (Key-Value Key store for runtime white-labeling)
- **BackupRecord**, **License**, **Plugin**, **DynamicMenu**
