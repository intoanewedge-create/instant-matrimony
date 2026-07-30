import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import { InfrastructureCost } from "../domain/phase5-contracts";

/**
 * Service managing FinOps policies, idle computing flags, and budget allocation bounds.
 */
export class CostManagementService extends BaseService {
  private costs: InfrastructureCost[] = [];

  /**
   * Logs a resource billing item.
   */
  async trackCost(provider: string, category: InfrastructureCost["category"], amount: number, period: string): Promise<Result<InfrastructureCost>> {
    const item: InfrastructureCost = {
      costId: `cost_${Math.random().toString(36).substring(2, 10)}`,
      provider,
      category,
      amount,
      billingPeriod: period
    };
    this.costs.push(item);
    return returnSuccess(item);
  }

  /**
   * Checks if total spend exceeds budget limits.
   */
  async checkBudgets(period: string, budgetLimit: number): Promise<Result<{ limit: number; totalSpent: number; breached: boolean }>> {
    const totalSpent = this.costs
      .filter(x => x.billingPeriod === period)
      .reduce((acc, curr) => acc + curr.amount, 0);

    return returnSuccess({
      limit: budgetLimit,
      totalSpent,
      breached: totalSpent > budgetLimit
    });
  }
}
