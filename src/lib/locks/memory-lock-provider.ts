import { ILockProvider } from "./lock-provider";
import { logger } from "../logger";

export class MemoryLockProvider implements ILockProvider {
  private locks = new Map<string, number>();

  async acquire(key: string, ttlSeconds: number): Promise<boolean> {
    const now = Date.now();
    const expiry = this.locks.get(key);

    if (expiry && expiry > now) {
      logger.debug(`[MemoryLock] Lock already held for: ${key}`);
      return false;
    }

    this.locks.set(key, now + ttlSeconds * 1000);
    logger.debug(`[MemoryLock] Acquired lock for: ${key}`);
    return true;
  }

  async release(key: string): Promise<void> {
    this.locks.delete(key);
    logger.debug(`[MemoryLock] Released lock for: ${key}`);
  }

  async getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }> {
    return { status: "UP", latencyMs: 0 };
  }
}
