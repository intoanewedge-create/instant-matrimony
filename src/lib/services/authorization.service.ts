import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import { PermissionService } from "./permission.service";

/**
 * Service managing user RBAC/ABAC capability gates, temporary grants, and credential scopes.
 */
export class AuthorizationService extends BaseService {
  private temporaryGrants = new Map<string, { permissions: string[]; expiresAt: Date }>();

  constructor(private permissionService: PermissionService) {
    super();
  }

  /**
   * Asserts if user has target scopes (supports temporary override matching).
   */
  async authorize(userId: string, permission: string): Promise<Result<boolean>> {
    // Check temporary grants
    const grant = this.temporaryGrants.get(userId);
    if (grant && grant.expiresAt.getTime() > Date.now()) {
      if (grant.permissions.includes(permission)) {
        return returnSuccess(true);
      }
    }

    // Default to admin permission check
    const check = await this.permissionService.checkPermission(userId, permission as any);
    return returnSuccess(check.success && check.data === true);
  }

  /**
   * Grants privilege override for a temporary session.
   */
  async grantTemporaryAccess(userId: string, permissions: string[], durationMs: number): Promise<Result<void>> {
    this.temporaryGrants.set(userId, {
      permissions,
      expiresAt: new Date(Date.now() + durationMs)
    });
    return returnSuccess(undefined);
  }
}
