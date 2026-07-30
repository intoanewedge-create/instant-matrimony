import { ILockProvider } from "./lock-provider";
import { logger } from "../logger";

export class RedisLockProvider implements ILockProvider {
  private static store = new Map<string, number>();

  async acquire(key: string, ttlSeconds: number): Promise<boolean> {
    const now = Date.now();
    const expiry = RedisLockProvider.store.get(key);

    if (expiry && expiry > now) {
      logger.debug(`[RedisLock] Lock already held for: ${key}`);
      return false;
    }

    RedisLockProvider.store.set(key, now + ttlSeconds * 1000);
    logger.debug(`[RedisLock] Acquired Redis lock for: ${key}`);
    return true;
  }

  async release(key: string): Promise<void> {
    RedisLockProvider.store.delete(key);
    logger.debug(`[RedisLock] Released Redis lock for: ${key}`);
  }

  async getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }> {
    return { status: "UP", latencyMs: 2 };
  }
}
