/**
 * Interface representing the distributed lock provider.
 * Protects critical sections of code (like webhooks or billing updates)
 * from concurrent race conditions.
 */
export interface ILockProvider {
  /**
   * Attempts to acquire a lock on a key.
   *
   * @param key - The unique resource key to lock.
   * @param ttlSeconds - Lock time-to-live before automatic release.
   * @returns Promise resolving to true if acquired, false otherwise.
   */
  acquire(key: string, ttlSeconds: number): Promise<boolean>;

  /**
   * Releases a lock key.
   *
   * @param key - The resource key.
   */
  release(key: string): Promise<void>;

  /**
   * Health status of the lock manager.
   */
  getHealth(): Promise<{ status: "UP" | "DOWN"; latencyMs: number }>;
}
