import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import { AiPlatformService } from "./ai-platform.service";

/**
 * Service coordinating AI provider selections, prompt executions, and budgeting gates.
 */
export class AiOrchestrationService extends BaseService {
  constructor(private aiPlatform: AiPlatformService) {
    super();
  }

  /**
   * Routes prompt request to the optimal model based on cost, latency, and capability constraints.
   */
  async routeRequest(promptText: string, preference: "COST" | "LATENCY" | "ACCURACY"): Promise<Result<any>> {
    let optimalProvider = "gemini";
    if (preference === "COST") {
      optimalProvider = "local";
    } else if (preference === "ACCURACY") {
      optimalProvider = "openai";
    }

    const response = await this.aiPlatform.executeInference(optimalProvider, promptText.length);
    return returnSuccess({
      ...response.data,
      routedTo: optimalProvider,
      preference
    });
  }
}
