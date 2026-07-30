import { BaseService } from "./base.service";
import { loggerService } from "./logger.service";

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface CircuitBreakerState {
  state: CircuitState;
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
}

/**
 * Enterprise Resilience Service.
 * Implements circuit breaking, exponential backoff retries with jitter,
 * bulkhead isolation (concurrency capping), and rate limiting.
 */
export class ResilienceService extends BaseService {
  private static circuits = new Map<string, CircuitBreakerState>();
  private static activeRequests = new Map<string, number>();
  private static timestamps = new Map<string, number[]>();
  
  private failureThreshold = 3; // Open circuit after 3 consecutive failures
  private cooldownMs = 10000; // Cooldown for 10 seconds before half-open

  private getCircuit(providerName: string): CircuitBreakerState {
    if (!ResilienceService.circuits.has(providerName)) {
      ResilienceService.circuits.set(providerName, {
        state: "CLOSED",
        failureCount: 0,
        lastFailureTime: 0,
        successCount: 0,
      });
    }
    return ResilienceService.circuits.get(providerName)!;
  }

  /**
   * Executes an asynchronous operation wrapped in circuit breaker, retries,
   * bulkhead isolation, and rate-limiting protections.
   *
   * @param providerName - Name of the external target system.
   * @param operation - The operation to run.
   * @param fallback - Optional fallback action.
   * @param options - Custom resilience configurations.
   */
  async executeResilient<T>(
    providerName: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>,
    options?: {
      timeoutMs?: number;
      maxRetries?: number;
      initialRetryDelayMs?: number;
      maxConcurrent?: number;
      rateLimit?: number;
    }
  ): Promise<T> {
    const circuit = this.getCircuit(providerName);
    const timeoutMs = options?.timeoutMs || 5000;
    const maxRetries = options?.maxRetries || 3;
    const initialDelay = options?.initialRetryDelayMs || 100;
    const maxConcurrent = options?.maxConcurrent || 20;
    const rateLimit = options?.rateLimit || 100; // default 100 requests per second

    // 1. Rate Limiter check
    const now = Date.now();
    const timestamps = ResilienceService.timestamps.get(providerName) || [];
    const recent = timestamps.filter((t) => now - t < 1000);
    if (recent.length >= rateLimit) {
      loggerService.error(`Rate limit exceeded for provider ${providerName} (${rateLimit}/sec).`);
      if (fallback) return fallback();
      throw new Error(`Rate limit exceeded for provider ${providerName}.`);
    }
    recent.push(now);
    ResilienceService.timestamps.set(providerName, recent);

    // 2. Bulkhead Concurrency cap check
    const active = ResilienceService.activeRequests.get(providerName) || 0;
    if (active >= maxConcurrent) {
      loggerService.error(`Bulkhead isolation trigger: Concurrency limit (${maxConcurrent}) reached for ${providerName}.`);
      if (fallback) return fallback();
      throw new Error(`Bulkhead isolation concurrency cap reached for ${providerName}.`);
    }
    ResilienceService.activeRequests.set(providerName, active + 1);

    try {
      // 3. Check Circuit state
      if (circuit.state === "OPEN") {
        if (now - circuit.lastFailureTime > this.cooldownMs) {
          circuit.state = "HALF_OPEN";
          loggerService.info(`Circuit breaker for ${providerName} entering HALF_OPEN state. Testing connection...`);
        } else {
          loggerService.warn(`Circuit breaker for ${providerName} is OPEN. Denying request immediately.`);
          if (fallback) {
            loggerService.info(`Executing fallback for ${providerName}.`);
            return await fallback();
          }
          throw new Error(`Circuit breaker for ${providerName} is open.`);
        }
      }

      // Helper for timeout
      const withTimeout = async (promise: Promise<T>): Promise<T> => {
        let timer: NodeJS.Timeout;
        const timeoutPromise = new Promise<T>((_, reject) => {
          timer = setTimeout(() => {
            reject(new Error(`Operation for ${providerName} timed out after ${timeoutMs}ms.`));
          }, timeoutMs);
        });
        return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
      };

      // Helper for retries with exponential backoff and jitter
      const withRetries = async (): Promise<T> => {
        let attempt = 0;
        while (attempt <= maxRetries) {
          try {
            return await withTimeout(operation());
          } catch (err: any) {
            attempt++;
            if (attempt > maxRetries) {
              throw err;
            }
            const delay = initialDelay * Math.pow(2, attempt - 1);
            const jitter = delay * 0.1 * (Math.random() - 0.5); // 10% jitter
            const finalDelay = Math.max(10, delay + jitter);
            loggerService.warn(
              `Attempt ${attempt} for ${providerName} failed. Retrying in ${Math.round(finalDelay)}ms... Error: ${err.message}`
            );
            await new Promise((resolve) => setTimeout(resolve, finalDelay));
          }
        }
        throw new Error(`Max retries exceeded for ${providerName}`);
      };

      const startState = circuit.state;

      try {
        const result = await withRetries();

        if (startState === "HALF_OPEN") {
          loggerService.info(`Circuit breaker for ${providerName} successfully returned to CLOSED state.`);
        }
        circuit.state = "CLOSED";
        circuit.failureCount = 0;
        circuit.successCount++;

        return result;
      } catch (err: any) {
        circuit.failureCount++;
        circuit.lastFailureTime = Date.now();

        if (circuit.failureCount >= this.failureThreshold) {
          circuit.state = "OPEN";
          loggerService.error(
            `Circuit breaker for ${providerName} tripped to OPEN state. Too many consecutive failures (${circuit.failureCount}).`
          );
        }

        if (fallback) {
          loggerService.info(`Executing fallback for ${providerName} following failure.`);
          try {
            return await fallback();
          } catch (fallbackErr: any) {
            loggerService.error(`Fallback also failed for ${providerName}: ${fallbackErr.message}`);
            throw fallbackErr;
          }
        }

        throw err;
      }
    } finally {
      // Release Bulkhead slot
      const currentActive = ResilienceService.activeRequests.get(providerName) || 1;
      ResilienceService.activeRequests.set(providerName, Math.max(0, currentActive - 1));
    }
  }

  getCircuitStates(): Record<string, { state: CircuitState; failureCount: number; successCount: number }> {
    const states: Record<string, { state: CircuitState; failureCount: number; successCount: number }> = {};
    ResilienceService.circuits.forEach((val, key) => {
      states[key] = {
        state: val.state,
        failureCount: val.failureCount,
        successCount: val.successCount,
      };
    });
    return states;
  }
}

export const resilienceService = new ResilienceService();
export default resilienceService;
