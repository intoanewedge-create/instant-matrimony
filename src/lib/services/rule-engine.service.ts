import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import { PlatformPolicy } from "../domain/phase5-contracts";
import { IRuleRepository } from "../repositories/interfaces/phase5-repositories.interface";

/**
 * Service evaluating custom platform rules, logical priorities, and conditional simulations.
 */
export class RuleEngineService extends BaseService {
  constructor(private repo: IRuleRepository) {
    super();
  }

  /**
   * Registers a reusable evaluation policy rule.
   */
  async saveRule(policyId: string, name: string, expression: string, action: PlatformPolicy["action"]): Promise<Result<PlatformPolicy>> {
    const policy: PlatformPolicy = {
      policyId,
      name,
      expression,
      action,
      isActive: true
    };
    await this.repo.savePolicy(policy);
    return returnSuccess(policy);
  }

  /**
   * Evaluates expressions against target context data.
   */
  async evaluateRule(policyId: string, context: Record<string, any>): Promise<Result<{ match: boolean; action: PlatformPolicy["action"] }>> {
    const policy = await this.repo.findPolicyById(policyId);
    if (!policy) throw new Error(`Policy ${policyId} not found`);

    // Simple parser checking key values matching expression strings
    // e.g. "age > 18" -> context.age > 18
    let match = false;
    try {
      const parts = policy.expression.split(" ");
      if (parts.length === 3) {
        const key = parts[0];
        const operator = parts[1];
        const val = parseInt(parts[2], 10);
        const targetVal = context[key];

        if (operator === ">") match = targetVal > val;
        else if (operator === "<") match = targetVal < val;
        else if (operator === "==") match = targetVal === val;
      }
    } catch (e) {
      match = false;
    }

    return returnSuccess({
      match,
      action: policy.action
    });
  }
}
