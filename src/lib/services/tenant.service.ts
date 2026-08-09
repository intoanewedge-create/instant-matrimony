import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import { TelemetryService } from "./telemetry.service";
import { IEventBus } from "../events/event-bus";

/**
 * Service managing the Multi-Tenant SaaS platform foundation.
 */
export class TenantService extends BaseService {
  private tenants = new Map<string, any>();

  constructor(
    private telemetry: TelemetryService,
    private eventBus: IEventBus
  ) {
    super();
  }

  /**
   * Onboards a new tenant with quotas and settings.
   */
  async onboardTenant(tenantId: string, name: string, quotas: Record<string, number>): Promise<Result<any>> {
    const start = Date.now();
    const tenant = {
      tenantId,
      name,
      quotas,
      encryptionKey: `key_${tenantId}`,
      isActive: true,
      createdAt: new Date(),
    };
    this.tenants.set(tenantId, tenant);

    await this.telemetry.track("tenant_onboarded", "service", Date.now() - start, 1, { tenantId, name });
    await this.eventBus.publish({
      name: "TenantOnboardedV1",
      occurredAt: new Date(),
      data: { tenantId, name }
    });

    return returnSuccess(tenant);
  }

  /**
   * Retrieves active tenant settings.
   */
  async getTenant(tenantId: string): Promise<Result<any>> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) throw new Error(`Tenant ${tenantId} not found`);
    return returnSuccess(tenant);
  }

  /**
   * Checks if tenant has exceeded its capacity limits.
   */
  async checkQuota(tenantId: string, quotaKey: string, currentUsage: number): Promise<Result<boolean>> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) return returnSuccess(true);
    const limit = tenant.quotas[quotaKey] || Infinity;
    return returnSuccess(currentUsage <= limit);
  }
}
