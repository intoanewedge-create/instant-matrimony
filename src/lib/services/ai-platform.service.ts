import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import { TelemetryService } from "./telemetry.service";
import { loggerService } from "./logger.service";
import { IEventBus } from "../events/event-bus";

/**
 * Service managing AI providers, token limits, registries, and failover routing.
 */
export class AiPlatformService extends BaseService {
  private costLimit = 500.0; // $ per month maximum budget
  private accumulatedCost = 0.0;
  private providers = new Map<string, { name: string; isHealthy: boolean }>();

  constructor(
    private telemetry: TelemetryService,
    private eventBus: IEventBus
  ) {
    super();
    // Register mock providers
    this.providers.set("openai", { name: "OpenAI", isHealthy: true });
    this.providers.set("azure", { name: "Azure OpenAI", isHealthy: true });
    this.providers.set("anthropic", { name: "Anthropic", isHealthy: true });
    this.providers.set("gemini", { name: "Gemini", isHealthy: true });
    this.providers.set("local", { name: "Local", isHealthy: true });
    this.providers.set("mock", { name: "Mock", isHealthy: true });
  }

  /**
   * Evaluates AI execution request budget constraint and failover routing.
   */
  async executeInference(providerName: string, promptLength: number): Promise<Result<any>> {
    const start = Date.now();
    const provider = this.providers.get(providerName.toLowerCase());

    if (!provider || !provider.isHealthy) {
      loggerService.warn(`[AiPlatform] Provider ${providerName} is unhealthy or unregistered. Initiating failover...`);
      return this.executeInference("mock", promptLength); // failover
    }

    const estimatedCost = (promptLength * 0.00002);
    if (this.accumulatedCost + estimatedCost > this.costLimit) {
      await this.eventBus.publish({
        name: "AIBudgetExceededV1",
        occurredAt: new Date(),
        data: { budgetType: "ai_cost", limit: this.costLimit, currentUsage: this.accumulatedCost }
      });
      throw new Error(`AI Request blocked: Token/Cost budget exceeded for provider ${providerName}`);
    }

    // Accumulate cost
    this.accumulatedCost += estimatedCost;

    // Track telemetry
    await this.telemetry.track("ai_inference_executed", "service", Date.now() - start, 1, {
      provider: providerName,
      cost: estimatedCost.toString()
    });

    return returnSuccess({
      provider: provider.name,
      tokensUsed: promptLength * 2,
      cost: estimatedCost,
      text: `Mock AI response for prompt size ${promptLength}`,
      confidenceScore: 0.96
    });
  }

  /**
   * Resets monthly accumulated AI expenses.
   */
  async resetBudget(): Promise<Result<void>> {
    this.accumulatedCost = 0.0;
    return returnSuccess(undefined);
  }

  /**
   * Sets unhealthy status for a provider (triggers failover testing).
   */
  async setProviderStatus(providerName: string, isHealthy: boolean): Promise<Result<void>> {
    const provider = this.providers.get(providerName.toLowerCase());
    if (provider) {
      provider.isHealthy = isHealthy;
    }
    return returnSuccess(undefined);
  }
}
