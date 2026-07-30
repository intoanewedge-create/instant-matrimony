import { CacheProvider } from "./cache-provider";

export class UpstashCacheProvider implements CacheProvider {
  async get<T>(key: string): Promise<T | null> {
    return null;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number, tags?: string[]): Promise<void> {}

  async delete(key: string): Promise<void> {}

  async invalidateTags(tags: string[]): Promise<void> {}

  async clear(): Promise<void> {}

  async warm<T>(key: string, fn: () => Promise<T>, ttlSeconds?: number, tags?: string[]): Promise<T> {
    return fn();
  }

  getMetrics() {
    return { hits: 0, misses: 0, size: 0 };
  }
}
