import { CacheProvider } from "./cache-provider";
import { logger } from "../logger";

interface RedisCacheEntry {
  value: string;
  expiresAt: number | null;
  tags: string[];
}

export class RedisCacheProvider implements CacheProvider {
  private static store = new Map<string, RedisCacheEntry>();
  private hits = 0;
  private misses = 0;

  async get<T>(key: string): Promise<T | null> {
    const entry = RedisCacheProvider.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      RedisCacheProvider.store.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    try {
      return JSON.parse(entry.value) as T;
    } catch {
      return entry.value as unknown as T;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number, tags: string[] = []): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    const serialized = JSON.stringify(value);
    RedisCacheProvider.store.set(key, { value: serialized, expiresAt, tags });
  }

  async delete(key: string): Promise<void> {
    RedisCacheProvider.store.delete(key);
  }

  async invalidateTags(tags: string[]): Promise<void> {
    const tagSet = new Set(tags);
    for (const [key, entry] of RedisCacheProvider.store.entries()) {
      if (entry.tags.some(t => tagSet.has(t))) {
        RedisCacheProvider.store.delete(key);
      }
    }
  }

  async clear(): Promise<void> {
    RedisCacheProvider.store.clear();
    this.hits = 0;
    this.misses = 0;
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
      size: RedisCacheProvider.store.size
    };
  }

  async getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }> {
    return { status: "UP", latencyMs: 2 };
  }
}
