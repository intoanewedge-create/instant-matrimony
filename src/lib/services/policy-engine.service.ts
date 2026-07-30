import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import { DecisionEngineService } from "./decision-engine.service";

/**
 * Service managing dynamic policies, commercial gates, and token rate limits.
 */
export class PolicyEngineService extends BaseService {
  constructor(private decisionEngine: DecisionEngineService) {
    super();
  }

  /**
   * Asserts if an operation is authorized under global platform guardrails.
   */
  async enforceGuardrails(userId: string, policyIds: string[], context: Record<string, any>): Promise<Result<boolean>> {
    const decision = await this.decisionEngine.decideAction(userId, policyIds, context);
    return returnSuccess(decision.success && decision.data ? decision.data.allowed : false);
  }
}
