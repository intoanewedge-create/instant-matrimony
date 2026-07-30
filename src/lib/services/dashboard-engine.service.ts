import { BaseService } from "./base.service";
import { Result, returnSuccess, returnFailure } from "../result";
import { EnterpriseDashboard } from "../domain/phase5-contracts";
import { dashboardWidgetRegistry } from "./dashboard/dashboard-widget-registry";
import { loggerService } from "./logger.service";

/**
 * Service orchestrating enterprise dashboard dynamic rendering, layout management, and widget visibility.
 */
export class DashboardEngineService extends BaseService {
  private dashboards = new Map<string, EnterpriseDashboard>();

  constructor() {
    super();
    // Pre-populate default enterprise dashboard
    const defaultDashboard: EnterpriseDashboard = {
      dashboardId: "default_enterprise_dashboard",
      name: "Enterprise System Dashboard",
      layoutJson: JSON.stringify([
        { id: "revenue", grid: { x: 0, y: 0, w: 1, h: 1 } },
        { id: "users", grid: { x: 1, y: 0, w: 2, h: 1 } },
        { id: "health", grid: { x: 0, y: 1, w: 1, h: 1 } },
        { id: "scheduler", grid: { x: 1, y: 1, w: 2, h: 1 } },
      ]),
      rolesAllowed: ["ADMIN", "SUPER_ADMIN", "OPERATIONS", "ANALYST"],
    };
    this.dashboards.set(defaultDashboard.dashboardId, defaultDashboard);
  }

  /**
   * Registers or updates an enterprise dashboard configuration layout.
   */
  async registerDashboard(dashboard: EnterpriseDashboard): Promise<Result<EnterpriseDashboard>> {
    this.dashboards.set(dashboard.dashboardId, dashboard);
    loggerService.info(`[DashboardEngineService] Registered dashboard layout ${dashboard.dashboardId}`);
    return returnSuccess(dashboard);
  }

  /**
   * Retrieves a specific dashboard layout by ID.
   */
  async getDashboardLayout(dashboardId: string): Promise<Result<EnterpriseDashboard>> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      return returnFailure(`Dashboard ${dashboardId} not found`, "DASHBOARD_NOT_FOUND");
    }
    return returnSuccess(dashboard);
  }

  /**
   * Evaluates widget visibility rules and renders the final layout for a target user role.
   */
  async renderDashboard(
    dashboardId: string,
    userRole: string
  ): Promise<Result<{ dashboard: EnterpriseDashboard; activeWidgets: string[] }>> {
    const dashResult = await this.getDashboardLayout(dashboardId);
    if (!dashResult.success || !dashResult.data) {
      return returnFailure(`Dashboard ${dashboardId} not found`, "DASHBOARD_NOT_FOUND");
    }

    const dashboard = dashResult.data;

    // Verify role authorization
    if (dashboard.rolesAllowed.length > 0 && !dashboard.rolesAllowed.includes(userRole) && userRole !== "SUPER_ADMIN") {
      return returnFailure(`Access denied for role ${userRole} on dashboard ${dashboardId}`, "FORBIDDEN");
    }

    // Filter widgets visible to this role
    const allWidgets = dashboardWidgetRegistry.list();
    const activeWidgets: string[] = [];

    for (const widget of allWidgets) {
      const isVisible = await dashboardWidgetRegistry.visibility(widget.id, userRole);
      if (isVisible) {
        activeWidgets.push(widget.id);
      }
    }

    return returnSuccess({
      dashboard,
      activeWidgets,
    });
  }

  /**
   * Lists all available widgets for a user role.
   */
  async getAvailableWidgets(userRole: string): Promise<Result<string[]>> {
    const widgets = dashboardWidgetRegistry.list();
    const allowed: string[] = [];

    for (const w of widgets) {
      const visible = await dashboardWidgetRegistry.visibility(w.id, userRole);
      if (visible) {
        allowed.push(w.id);
      }
    }

    return returnSuccess(allowed);
  }
}
