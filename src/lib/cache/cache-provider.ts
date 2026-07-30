export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number, tags?: string[]): Promise<void>;
  delete(key: string): Promise<void>;
  invalidateTags(tags: string[]): Promise<void>;
  clear(): Promise<void>;
  warm<T>(key: string, fn: () => Promise<T>, ttlSeconds?: number, tags?: string[]): Promise<T>;
  getMetrics(): { hits: number; misses: number; size: number };
}
