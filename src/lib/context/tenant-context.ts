import { Result } from "../result";
import { logger } from "../logger";

export interface TenantConfig {
  branding: {
    logoUrl?: string;
    primaryColor?: string;
    companyName: string;
  };
  limits: {
    maxUsers: number;
    maxStorageMb: number;
    maxApiRequestsPerMin: number;
  };
  featureFlags: Record<string, boolean>;
}

/**
 * Enterprise Tenant Context Manager.
 * Handles tenant isolation, billing limits, branding settings,
 * and tenant-specific configuration overrides. Runs dormant by default (resolving to "default" tenant).
 */
export class TenantContext {
  private static activeTenantId = "default";
  private static enabled = false;
  private static tenants = new Map<string, TenantConfig>();

  static {
    // Populate default tenant config
    TenantContext.tenants.set("default", {
      branding: {
        companyName: "InstantMatrimony Default"
      },
      limits: {
        maxUsers: 1000000,
        maxStorageMb: 10240,
        maxApiRequestsPerMin: 10000
      },
      featureFlags: {}
    });
  }

  /**
   * Enables multi-tenancy dynamic resolution.
   */
  public static enableMultiTenancy(enabled: boolean): void {
    TenantContext.enabled = enabled;
    logger.info(`[TenantContext] Multi-Tenancy enabled: ${enabled}`);
  }

  /**
   * Sets the active tenant for the current context.
   */
  public static setTenantId(tenantId: string): void {
    if (!TenantContext.enabled) {
      TenantContext.activeTenantId = "default";
      return;
    }
    TenantContext.activeTenantId = tenantId;
    logger.debug(`[TenantContext] Active tenant set to: ${tenantId}`);
  }

  /**
   * Gets the active tenant identifier.
   */
  public static getTenantId(): string {
    return TenantContext.enabled ? TenantContext.activeTenantId : "default";
  }

  /**
   * Registers configuration overrides for a tenant.
   */
  public static registerTenant(tenantId: string, config: TenantConfig): void {
    TenantContext.tenants.set(tenantId, config);
  }

  /**
   * Retrieves active tenant's configurations.
   */
  public static getActiveConfiguration(): TenantConfig {
    const activeId = TenantContext.getTenantId();
    return TenantContext.tenants.get(activeId) || TenantContext.tenants.get("default")!;
  }

  /**
   * Evaluates if a tenant is within maximum limits.
   *
   * @param metric - limit category (e.g. users, storage).
   * @param currentVal - current consumed value.
   */
  public static checkLimit(metric: "maxUsers" | "maxStorageMb" | "maxApiRequestsPerMin", currentVal: number): Result<boolean> {
    const config = TenantContext.getActiveConfiguration();
    const limit = config.limits[metric];

    if (currentVal >= limit) {
      return {
        success: false,
        error: `Tenant limit exceeded for metric ${metric}. Current: ${currentVal}, Limit: ${limit}`
      };
    }
    return { success: true, data: true };
  }
}
