import { BaseService } from "./base.service";
import { Result } from "../result";
import { ILockProvider } from "../locks/lock-provider";
import { logger } from "../logger";

interface IdempotentRecord {
  key: string;
  status: "STARTED" | "COMPLETED" | "FAILED";
  result: any;
  expiresAt: number;
}

/**
 * Enterprise Idempotency Service.
 * Ensures critical request processing (Payments, Webhooks, Scheduler jobs)
 * is executed exactly once for a given idempotency key.
 */
export class IdempotencyService extends BaseService {
  private static store = new Map<string, IdempotentRecord>();

  constructor(private lockProvider: ILockProvider) {
    super();
  }

  /**
   * Enforces idempotency for an action execution.
   *
   * @param key - The unique idempotency key.
   * @param action - The asynchronous action to execute.
   * @param ttlSeconds - How long the idempotency record remains valid.
   */
  public async executeIdempotent<T>(
    key: string,
    action: () => Promise<T>,
    ttlSeconds = 86400 // default 24 hours retention
  ): Promise<Result<T>> {
    const now = Date.now();
    const record = IdempotencyService.store.get(key);

    if (record) {
      if (record.expiresAt < now) {
        IdempotencyService.store.delete(key);
      } else {
        if (record.status === "STARTED") {
          logger.warn(`[Idempotency] Request is already in progress for key: ${key}`);
          return this.returnFailure("Request is currently in progress. Please retry later.", "REQUEST_IN_PROGRESS");
        }
        logger.info(`[Idempotency] Request hit cache. Returning cached result for key: ${key}`);
        return this.returnSuccess(record.result as T);
      }
    }

    // Acquire lock to avoid concurrent stampede
    const lockAcquired = await this.lockProvider.acquire(`lock:idempotency:${key}`, 30);
    if (!lockAcquired) {
      return this.returnFailure("Concurrent request detected. Lock is held.", "CONCURRENT_REQUEST");
    }

    try {
      // Mark as started
      IdempotencyService.store.set(key, {
        key,
        status: "STARTED",
        result: null,
        expiresAt: now + ttlSeconds * 1000
      });

      const result = await action();

      // Mark as completed
      IdempotencyService.store.set(key, {
        key,
        status: "COMPLETED",
        result,
        expiresAt: now + ttlSeconds * 1000
      });

      return this.returnSuccess(result);
    } catch (err: any) {
      // Mark as failed so it can be retried
      IdempotencyService.store.delete(key);
      logger.error(`[Idempotency] Action execution failed for key: ${key}`, err);
      return this.returnFailure(`Execution failed: ${err.message}`, "EXECUTION_FAILED");
    } finally {
      await this.lockProvider.release(`lock:idempotency:${key}`);
    }
  }

  /**
   * Safe payment processing helper.
   */
  public async processPaymentSafe<T>(key: string, payAction: () => Promise<T>): Promise<Result<T>> {
    return this.executeIdempotent(`payment:${key}`, payAction, 3600); // 1 hour payment lock
  }

  /**
   * Safe webhook processing helper.
   */
  public async processWebhookSafe<T>(key: string, webhookAction: () => Promise<T>): Promise<Result<T>> {
    return this.executeIdempotent(`webhook:${key}`, webhookAction, 86400); // 24 hours webhook retention
  }

  /**
   * Safe scheduler job execution helper.
   */
  public async processSchedulerJobSafe<T>(key: string, jobAction: () => Promise<T>): Promise<Result<T>> {
    return this.executeIdempotent(`scheduler:${key}`, jobAction, 3600);
  }
}
