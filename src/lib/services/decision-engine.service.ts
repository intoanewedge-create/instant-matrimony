import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import { RuleEngineService } from "./rule-engine.service";

/**
 * Service orchestrating complex multi-rule evaluation pipelines for business decisions.
 */
export class DecisionEngineService extends BaseService {
  constructor(private ruleEngine: RuleEngineService) {
    super();
  }

  /**
   * Evaluates if an entity action complies with active system policies.
   */
  async decideAction(userId: string, policyIds: string[], context: Record<string, any>): Promise<Result<{ allowed: boolean; reason?: string }>> {
    for (const policyId of policyIds) {
      const evaluation = await this.ruleEngine.evaluateRule(policyId, context);
      if (evaluation.success && evaluation.data && evaluation.data.match && evaluation.data.action === "DENY") {
        return returnSuccess({
          allowed: false,
          reason: `Action blocked by policy rule ${policyId}`
        });
      }
    }

    return returnSuccess({
      allowed: true
    });
  }
}
