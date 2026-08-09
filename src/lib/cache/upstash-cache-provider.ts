import { CacheProvider } from "./cache-provider";

export class UpstashCacheProvider implements CacheProvider {
  async get<T>(_key: string): Promise<T | null> {
    return null;
  }

  async set<T>(_key: string, _value: T, _ttlSeconds?: number, _tags?: string[]): Promise<void> {}

  async delete(_key: string): Promise<void> {}

  async invalidateTags(_tags: string[]): Promise<void> {}

  async clear(): Promise<void> {}

  async warm<T>(_key: string, fn: () => Promise<T>, _ttlSeconds?: number, _tags?: string[]): Promise<T> {
    return fn();
  }

  getMetrics() {
    return { hits: 0, misses: 0, size: 0 };
  }
}
