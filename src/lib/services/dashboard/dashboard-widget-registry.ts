import { WidgetConfiguration } from "../../domain/admin/contracts";
import { ROLE_PERMISSIONS, AdminRole, AdminPermission } from "../../domain/admin-contracts";

export class DashboardWidgetRegistry {
  private widgets = new Map<string, WidgetConfiguration>();

  register(widget: WidgetConfiguration) {
    this.widgets.set(widget.id, widget);
  }

  unregister(id: string) {
    this.widgets.delete(id);
  }

  resolve(id: string): WidgetConfiguration | undefined {
    return this.widgets.get(id);
  }

  list(): WidgetConfiguration[] {
    return Array.from(this.widgets.values());
  }

  permissions(id: string): string[] {
    const w = this.resolve(id);
    return w ? w.permissions : [];
  }

  featureFlags(id: string): string[] {
    const w = this.resolve(id);
    return w && w.featureFlag ? [w.featureFlag] : [];
  }

  async visibility(id: string, userRole: string): Promise<boolean> {
    const w = this.resolve(id);
    if (!w) return false;

    // 1. Role permission checks
    const requiredPerms = w.permissions as AdminPermission[];
    const rolePerms = ROLE_PERMISSIONS[userRole as AdminRole] || [];
    const hasPerms = requiredPerms.every((p) => rolePerms.includes(p));
    if (!hasPerms && userRole !== "SUPER_ADMIN") {
      return false;
    }

    // 2. Feature flag check
    if (w.featureFlag) {
      const { container } = await import("../../container");
      const flagRes = await container.services.featureFlagService.isEnabled(w.featureFlag.toLowerCase(), true);
      if (!flagRes.success || flagRes.data === false) {
        return false;
      }
    }

    return true;
  }
}

export const dashboardWidgetRegistry = new DashboardWidgetRegistry();

// Register Default System Widgets
dashboardWidgetRegistry.register({
  id: "revenue",
  title: "Revenue Ledger",
  description: "Total invoice payments and growth margins",
  permissions: ["VIEW_ANALYTICS"],
  defaultSize: { w: 1, h: 1 },
  refreshInterval: 30,
  requiredServices: ["paymentService"],
});

dashboardWidgetRegistry.register({
  id: "users",
  title: "User Signups Flow",
  description: "Recent user registrations and status charts",
  permissions: ["VIEW_ANALYTICS"],
  defaultSize: { w: 2, h: 1 },
  refreshInterval: 10,
  requiredServices: ["userService"],
});

dashboardWidgetRegistry.register({
  id: "moderation",
  title: "Moderation Queue",
  description: "Profile edits and reports waiting for review",
  permissions: ["MANAGE_MODERATION"],
  defaultSize: { w: 1, h: 1 },
  refreshInterval: 15,
  requiredServices: ["moderationService"],
});

dashboardWidgetRegistry.register({
  id: "verification",
  title: "Identity Verifications",
  description: "Government ID validation backlog status",
  permissions: ["MANAGE_VERIFICATION"],
  defaultSize: { w: 1, h: 1 },
  refreshInterval: 20,
  requiredServices: ["verificationService"],
});

dashboardWidgetRegistry.register({
  id: "scheduler",
  title: "Background Engine",
  description: "Status and runtime logs of memory tasks",
  permissions: ["MANAGE_SYSTEM"],
  defaultSize: { w: 2, h: 1 },
  refreshInterval: 5,
  requiredServices: ["schedulerService"],
});

dashboardWidgetRegistry.register({
  id: "health",
  title: "System Health Map",
  description: "Diagnostics map of database, Redis, storage",
  permissions: ["MANAGE_SYSTEM"],
  defaultSize: { w: 1, h: 1 },
  refreshInterval: 15,
  requiredServices: ["healthService"],
});

dashboardWidgetRegistry.register({
  id: "fraud",
  title: "Fraud Threat Radar",
  description: "Suspicious pattern cases flagged automatically",
  permissions: ["MANAGE_FRAUD"],
  defaultSize: { w: 1, h: 1 },
  refreshInterval: 30,
  requiredServices: ["fraudService"],
});

dashboardWidgetRegistry.register({
  id: "feature_flags",
  title: "Feature Flag Gates",
  description: "Total configuration switches and rollouts",
  permissions: ["MANAGE_SYSTEM"],
  defaultSize: { w: 1, h: 1 },
  refreshInterval: 60,
  requiredServices: ["featureFlagService"],
});
