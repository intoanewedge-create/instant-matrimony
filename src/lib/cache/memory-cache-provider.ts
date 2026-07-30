import { CacheProvider } from "./cache-provider";
import pino from "pino";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

interface CacheEntry {
  value: any;
  expiresAt: number | null;
  tags: string[];
}

export class MemoryCacheProvider implements CacheProvider {
  private cache = new Map<string, CacheEntry>();
  private hits = 0;
  private misses = 0;

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      logger.debug(`Cache miss: ${key}`);
      return null;
    }

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.misses++;
      logger.debug(`Cache expired: ${key}`);
      return null;
    }

    this.hits++;
    logger.debug(`Cache hit: ${key}`);
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number, tags: string[] = []): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.cache.set(key, { value, expiresAt, tags });
    logger.debug(`Cache set: ${key} (ttl: ${ttlSeconds}s, tags: ${tags.join(", ")})`);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    logger.debug(`Cache delete: ${key}`);
  }

  async invalidateTags(tags: string[]): Promise<void> {
    const tagSet = new Set(tags);
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.some(t => tagSet.has(t))) {
        this.cache.delete(key);
        logger.debug(`Cache invalidated by tag: ${key}`);
      }
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    logger.debug("Cache cleared");
  }

  async warm<T>(key: string, fn: () => Promise<T>, ttlSeconds?: number, tags?: string[]): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    const fresh = await fn();
    await this.set(key, fresh, ttlSeconds, tags);
    return fresh;
  }

  getMetrics() {
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size
    };
  }
}
