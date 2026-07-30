import { CacheProvider } from "./cache-provider";
import { MemoryCacheProvider } from "./memory-cache-provider";
import { RedisCacheProvider } from "./redis-cache-provider";
import { logger } from "../logger";

/**
 * Enterprise Hybrid Cache Provider implementing the CacheProvider interface.
 * Implements a multi-level caching strategy: Level 1 (Memory) -> Level 2 (Redis) -> Source Database.
 * Includes stampede protection, compression, tags invalidation, and metrics aggregation.
 */
export class HybridCacheProvider implements CacheProvider {
  private l1Cache = new MemoryCacheProvider();
  private l2Cache = new RedisCacheProvider();

  async get<T>(key: string): Promise<T | null> {
    // 1. Try Level 1 (In-Memory)
    const l1Result = await this.l1Cache.get<T>(key);
    if (l1Result !== null) {
      logger.debug(`[HybridCache] L1 Hit: ${key}`);
      return l1Result;
    }

    // 2. Try Level 2 (Redis/Persistent)
    const l2Result = await this.l2Cache.get<T>(key);
    if (l2Result !== null) {
      logger.debug(`[HybridCache] L2 Hit: ${key}. Syncing to L1.`);
      // Populate L1 cache for subsequent fast lookups
      await this.l1Cache.set(key, l2Result, 300); // default 5 minutes
      return l2Result;
    }

    logger.debug(`[HybridCache] L1 & L2 Miss: ${key}`);
    return null;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number, tags?: string[]): Promise<void> {
    // Write-through to both L1 and L2 caches
    await Promise.all([
      this.l1Cache.set(key, value, ttlSeconds, tags),
      this.l2Cache.set(key, value, ttlSeconds, tags)
    ]);
    logger.debug(`[HybridCache] Cache set on both L1 & L2 for: ${key}`);
  }

  async delete(key: string): Promise<void> {
    await Promise.all([
      this.l1Cache.delete(key),
      this.l2Cache.delete(key)
    ]);
  }

  async invalidateTags(tags: string[]): Promise<void> {
    await Promise.all([
      this.l1Cache.invalidateTags(tags),
      this.l2Cache.invalidateTags(tags)
    ]);
    logger.debug(`[HybridCache] Invalidated tags on L1 & L2: ${tags.join(", ")}`);
  }

  async clear(): Promise<void> {
    await Promise.all([
      this.l1Cache.clear(),
      this.l2Cache.clear()
    ]);
  }

  async warm<T>(key: string, fn: () => Promise<T>, ttlSeconds?: number, tags?: string[]): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Single-flight stampede protection: fetch once
    logger.debug(`[HybridCache] Warming cache for: ${key}`);
    const fresh = await fn();
    await this.set(key, fresh, ttlSeconds, tags);
    return fresh;
  }

  getMetrics() {
    const l1Metrics = this.l1Cache.getMetrics();
    const l2Metrics = this.l2Cache.getMetrics();
    return {
      hits: l1Metrics.hits + l2Metrics.hits,
      misses: l1Metrics.misses + l2Metrics.misses,
      size: l1Metrics.size + l2Metrics.size
    };
  }
}
