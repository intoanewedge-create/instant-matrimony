import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import { PromptDefinition, PromptExecution, PromptCostSummary } from "../domain/phase5-contracts";
import { IEventBus } from "../events/event-bus";

/**
 * Service managing enterprise prompts, version rollbacks, and approval pathways.
 */
export class PromptRegistryService extends BaseService {
  private prompts = new Map<string, PromptDefinition[]>();
  private executions: PromptExecution[] = [];

  constructor(private eventBus: IEventBus) {
    super();
  }

  /**
   * Registers a prompt template definition.
   */
  async registerPrompt(promptId: string, name: string, template: string, version: string): Promise<Result<PromptDefinition>> {
    const list = this.prompts.get(promptId) || [];
    const definition: PromptDefinition = {
      promptId,
      name,
      template,
      version,
      approved: false, // requires admin sign-off
      createdAt: new Date()
    };
    list.push(definition);
    this.prompts.set(promptId, list);

    return returnSuccess(definition);
  }

  /**
   * Approves a specific prompt version to be active.
   */
  async approvePrompt(promptId: string, version: string): Promise<Result<PromptDefinition>> {
    const list = this.prompts.get(promptId) || [];
    const item = list.find(x => x.version === version);
    if (!item) throw new Error("Prompt version not found");
    item.approved = true;

    await this.eventBus.publish({
      name: "PromptApprovedV1",
      occurredAt: new Date(),
      data: { promptId, version }
    });

    return returnSuccess(item);
  }

  /**
   * Logs a prompt invocation execution details.
   */
  async logExecution(execution: PromptExecution): Promise<Result<void>> {
    this.executions.push(execution);
    await this.eventBus.publish({
      name: "PromptExecutedV1",
      occurredAt: new Date(),
      data: { promptId: execution.promptId, version: execution.version, cost: execution.cost }
    });
    return returnSuccess(undefined);
  }

  /**
   * Summarizes total prompt spend and tokens consumed.
   */
  async getCostSummary(promptId: string): Promise<Result<PromptCostSummary>> {
    const filtered = this.executions.filter(x => x.promptId === promptId);
    const totalCost = filtered.reduce((acc, curr) => acc + curr.cost, 0);
    const totalTokens = filtered.reduce((acc, curr) => acc + curr.tokensUsed, 0);

    return returnSuccess({
      promptId,
      totalCost,
      totalTokens,
      executionsCount: filtered.length
    });
  }
}
