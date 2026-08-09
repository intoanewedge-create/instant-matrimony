import { BaseService } from "./base.service";
import { Result } from "../result";
import { logger } from "../logger";

export interface WorkflowStep {
  name: string;
  action: (context: any) => Promise<any>;
  compensate?: (context: any) => Promise<any>;
  timeoutMs?: number;
  retryCount?: number;
}

/**
 * Enterprise Workflow Engine Service.
 * Orchestrates sequential and parallel steps, conditional logic, execution delays,
 * timeouts, and automatic compensation/rollback operations.
 */
export class WorkflowService extends BaseService {
  /**
   * Executes a series of workflow steps sequentially.
   * If a step fails, compensation actions of all completed steps are run in reverse.
   *
   * @param steps - List of steps to run.
   * @param context - The execution context state.
   */
  public async executeSequential(steps: WorkflowStep[], context: any): Promise<Result<any>> {
    const correlationId = context.correlationId || `wf_${Math.random().toString(36).substring(2, 15)}`;
    context.correlationId = correlationId;
    logger.info(`[WorkflowEngine] Starting sequential workflow ${correlationId} with ${steps.length} steps.`);

    const executedSteps: WorkflowStep[] = [];

    for (const step of steps) {
      try {
        executedSteps.push(step);
        context[step.name] = await this.executeStepWithTimeout(step, context);
      } catch (err: any) {
        logger.error({ correlationId, error: err }, `[WorkflowEngine] Step ${step.name} failed. Initiating compensation...`);
        await this.compensate(executedSteps, context);
        return this.returnFailure(`Workflow execution failed at step ${step.name}: ${err.message}`, "WORKFLOW_EXECUTION_FAILED");
      }
    }

    logger.info(`[WorkflowEngine] Sequential workflow ${correlationId} completed successfully.`);
    return this.returnSuccess(context);
  }

  /**
   * Executes a collection of workflow steps in parallel.
   */
  public async executeParallel(steps: WorkflowStep[], context: any): Promise<Result<any>> {
    const correlationId = context.correlationId || `wf_${Math.random().toString(36).substring(2, 15)}`;
    context.correlationId = correlationId;
    logger.info(`[WorkflowEngine] Starting parallel workflow ${correlationId} with ${steps.length} steps.`);

    try {
      const promises = steps.map(async (step) => {
        return {
          name: step.name,
          result: await this.executeStepWithTimeout(step, context)
        };
      });

      const results = await Promise.all(promises);
      for (const res of results) {
        context[res.name] = res.result;
      }
      return this.returnSuccess(context);
    } catch (err: any) {
      logger.error({ correlationId, error: err }, `[WorkflowEngine] Parallel step execution failed. Running compensations...`);
      // Run compensation for all steps as best effort
      await this.compensate(steps, context);
      return this.returnFailure(`Parallel workflow execution failed: ${err.message}`, "PARALLEL_WORKFLOW_FAILED");
    }
  }

  /**
   * Runs the User Registration Workflow.
   */
  public async runUserRegistrationWorkflow(context: any): Promise<Result<any>> {
    const steps: WorkflowStep[] = [
      {
        name: "verifyEmail",
        action: async (ctx) => {
          logger.info({ email: ctx.email }, "[WF:UserReg] Verifying email address");
          return { emailVerified: true };
        },
        compensate: async (_ctx) => {
          logger.info("[WF:UserReg] Rollback: mark email as unverified");
        }
      },
      {
        name: "createProfile",
        action: async (ctx) => {
          logger.info("[WF:UserReg] Initializing user profile database record");
          return { profileId: `prof_${ctx.userId}` };
        },
        compensate: async (_ctx) => {
          logger.info("[WF:UserReg] Rollback: delete initialized profile record");
        }
      },
      {
        name: "moderationCheck",
        action: async (_ctx) => {
          logger.info("[WF:UserReg] Queueing profile verification for moderation review");
          return { status: "PENDING_MODERATION" };
        }
      },
      {
        name: "triggerWelcomeCampaign",
        action: async (_ctx) => {
          logger.info("[WF:UserReg] Publishing welcome campaign subscription event");
          return { welcomeCampaignTriggered: true };
        }
      }
    ];

    return this.executeSequential(steps, context);
  }

  /**
   * Runs the Profile Verification Workflow.
   */
  public async runProfileVerificationWorkflow(context: any): Promise<Result<any>> {
    const steps: WorkflowStep[] = [
      {
        name: "extractMetadata",
        action: async (_ctx) => ({ extracted: true })
      },
      {
        name: "runFaceVerificationCheck",
        action: async (_ctx) => ({ faceMatch: true }),
        retryCount: 2
      },
      {
        name: "censorPII",
        action: async (_ctx) => ({ piiMasked: true })
      }
    ];
    return this.executeSequential(steps, context);
  }

  /**
   * Runs the Premium Purchase Workflow.
   */
  public async runPremiumPurchaseWorkflow(context: any): Promise<Result<any>> {
    const steps: WorkflowStep[] = [
      {
        name: "chargeCard",
        action: async (_ctx) => {
          logger.info("[WF:Premium] Processing credit card payment");
          return { charged: true, transactionId: "tx_12345" };
        },
        compensate: async (_ctx) => {
          logger.info("[WF:Premium] Rollback: refund credit card charge");
        }
      },
      {
        name: "activateSubscription",
        action: async (_ctx) => {
          logger.info("[WF:Premium] Activating premium membership benefits");
          return { active: true };
        },
        compensate: async (_ctx) => {
          logger.info("[WF:Premium] Rollback: deactivate subscription benefits");
        }
      }
    ];
    return this.executeSequential(steps, context);
  }

  /**
   * Runs the Match Lifecycle Workflow.
   */
  public async runMatchLifecycleWorkflow(context: any): Promise<Result<any>> {
    const steps: WorkflowStep[] = [
      {
        name: "calculateCompatibility",
        action: async (_ctx) => ({ score: 87 })
      },
      {
        name: "createMatchRecord",
        action: async (_ctx) => ({ matchId: "match_xyz" })
      }
    ];
    return this.executeSequential(steps, context);
  }

  /**
   * Runs the Report Generation Workflow.
   */
  public async runReportGenerationWorkflow(context: any): Promise<Result<any>> {
    const steps: WorkflowStep[] = [
      {
        name: "queryData",
        action: async (_ctx) => ({ rowsCount: 50 })
      },
      {
        name: "renderPDF",
        action: async (_ctx) => ({ pdfUrl: "https://bucket.s3/reports/rep_1.pdf" })
      }
    ];
    return this.executeSequential(steps, context);
  }

  /**
   * Runs the Fraud Investigation Workflow.
   */
  public async runFraudInvestigationWorkflow(context: any): Promise<Result<any>> {
    const steps: WorkflowStep[] = [
      {
        name: "gatherRiskTelemetry",
        action: async (_ctx) => ({ score: 0.92 })
      },
      {
        name: "autoSuspendAccount",
        action: async (_ctx) => ({ suspended: true }),
        compensate: async (_ctx) => ({ suspended: false })
      }
    ];
    return this.executeSequential(steps, context);
  }

  /**
   * Runs the Appeal Resolution Workflow.
   */
  public async runAppealResolutionWorkflow(context: any): Promise<Result<any>> {
    const steps: WorkflowStep[] = [
      {
        name: "assessAppealReasons",
        action: async (_ctx) => ({ validity: "VALID" })
      },
      {
        name: "restoreAccount",
        action: async (_ctx) => ({ status: "ACTIVE" })
      }
    ];
    return this.executeSequential(steps, context);
  }

  /**
   * Runs the Marketing Campaign Workflow.
   */
  public async runMarketingCampaignWorkflow(context: any): Promise<Result<any>> {
    const steps: WorkflowStep[] = [
      {
        name: "segmentUsers",
        action: async (_ctx) => ({ count: 1200 })
      },
      {
        name: "dispatchEmails",
        action: async (_ctx) => ({ sent: true })
      }
    ];
    return this.executeSequential(steps, context);
  }

  private async compensate(steps: WorkflowStep[], context: any): Promise<void> {
    // Run compensations in reverse order
    for (let i = steps.length - 1; i >= 0; i--) {
      const step = steps[i];
      if (step.compensate) {
        try {
          logger.info(`[WorkflowEngine] Running compensation for step: ${step.name}`);
          await step.compensate(context);
        } catch (compErr) {
          logger.error(compErr as Error, `[WorkflowEngine] Compensation step failed for: ${step.name}`);
        }
      }
    }
  }

  private async executeStepWithTimeout(step: WorkflowStep, context: any): Promise<any> {
    const retries = step.retryCount || 0;
    const timeout = step.timeoutMs || 30000; // default 30s timeout

    let attempt = 0;
    while (attempt <= retries) {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Timeout: Step ${step.name} exceeded ${timeout}ms`)), timeout);
        });

        const executionPromise = step.action(context);
        return await Promise.race([executionPromise, timeoutPromise]);
      } catch (err) {
        attempt++;
        if (attempt > retries) {
          throw err;
        }
        logger.warn(`[WorkflowEngine] Retrying step ${step.name}. Attempt ${attempt}/${retries}`);
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 100)); // backoff
      }
    }
  }
}
