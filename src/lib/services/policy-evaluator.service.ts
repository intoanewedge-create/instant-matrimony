import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import { AuthorizationService } from "./authorization.service";

/**
 * Service providing high-speed caching for evaluated permission policies.
 */
export class PolicyEvaluatorService extends BaseService {
  private cache = new Map<string, { result: boolean; expiresAt: number }>();

  constructor(private authorization: AuthorizationService) {
    super();
  }

  /**
   * Checks authorization with cache bypass.
   */
  async evaluateCachedPolicy(userId: string, permission: string): Promise<Result<boolean>> {
    const key = `${userId}:${permission}`;
    const cached = this.cache.get(key);

    if (cached && cached.expiresAt > Date.now()) {
      return returnSuccess(cached.result);
    }

    const check = await this.authorization.authorize(userId, permission);
    const resultVal = !!(check.success && check.data);
    this.cache.set(key, {
      result: resultVal,
      expiresAt: Date.now() + 60000 // Cache for 60 seconds
    });

    return returnSuccess(resultVal);
  }

  /**
   * Invalidates cached permission bounds.
   */
  async invalidateCache(userId: string): Promise<Result<void>> {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        this.cache.delete(key);
      }
    }
    return returnSuccess(undefined);
  }
}
