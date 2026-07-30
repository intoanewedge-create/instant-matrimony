import { BaseService } from "./base.service";
import { CacheProvider } from "../cache/cache-provider";
import { Result } from "../result";

export interface RateLimitConfig {
  windowSeconds: number;
  maxRequests: number;
}

export class RateLimitService extends BaseService {
  constructor(private cacheProvider: CacheProvider) {
    super();
  }

  private configs: Record<string, RateLimitConfig> = {
    login: { windowSeconds: 60, maxRequests: 5 },
    registration: { windowSeconds: 300, maxRequests: 3 },
    otp: { windowSeconds: 60, maxRequests: 3 },
    passwordReset: { windowSeconds: 300, maxRequests: 3 },
    search: { windowSeconds: 60, maxRequests: 30 },
    chat: { windowSeconds: 60, maxRequests: 60 },
    payments: { windowSeconds: 60, maxRequests: 10 },
    admin: { windowSeconds: 60, maxRequests: 100 },
    default: { windowSeconds: 60, maxRequests: 60 },
  };

  async isRateLimited(
    identifier: string,
    endpoint: string = "default"
  ): Promise<Result<{ allowed: boolean; retryAfter?: number; limit: number; remaining: number }>> {
    try {
      const config = this.configs[endpoint] || this.configs.default;
      const key = `ratelimit:${endpoint}:${identifier}`;
      const now = Date.now();
      const windowMs = config.windowSeconds * 1000;

      const timestamps = (await this.cacheProvider.get<number[]>(key)) || [];
      const validTimestamps = timestamps.filter((ts) => now - ts < windowMs);

      if (validTimestamps.length >= config.maxRequests) {
        const oldest = validTimestamps[0];
        const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
        return this.returnSuccess({
          allowed: false,
          retryAfter: retryAfter > 0 ? retryAfter : 1,
          limit: config.maxRequests,
          remaining: 0,
        });
      }

      validTimestamps.push(now);
      await this.cacheProvider.set(key, validTimestamps, config.windowSeconds);

      return this.returnSuccess({
        allowed: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - validTimestamps.length,
      });
    } catch {
      return this.returnSuccess({
        allowed: true,
        limit: 9999,
        remaining: 9999,
      });
    }
  }
}
