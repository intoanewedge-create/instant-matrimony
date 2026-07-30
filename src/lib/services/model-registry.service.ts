import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import { ModelDeployment, ModelEvaluation, ModelDriftReport } from "../domain/phase5-contracts";
import { IModelRegistryRepository } from "../repositories/interfaces/phase5-repositories.interface";
import { IEventBus } from "../events/event-bus";

/**
 * Service managing MLOps lifecycle model versioning and deployment splits.
 */
export class ModelRegistryService extends BaseService {
  constructor(
    private repo: IModelRegistryRepository,
    private eventBus: IEventBus
  ) {
    super();
  }

  /**
   * Registers a new model deployment with environment status.
   */
  async deployModel(modelId: string, version: string, status: ModelDeployment["status"]): Promise<Result<ModelDeployment>> {
    const deployment: ModelDeployment = {
      deploymentId: `dep_${Math.random().toString(36).substring(2, 10)}`,
      modelId,
      version,
      status,
      trafficWeight: status === "ACTIVE" ? 100 : 0,
      deployedAt: new Date()
    };
    
    await this.repo.register(deployment);
    await this.eventBus.publish({
      name: "ModelDeployedV1",
      occurredAt: new Date(),
      data: { modelId, version, environment: "production" }
    });

    return returnSuccess(deployment);
  }

  /**
   * Promotes challenger to champion or executes model rollback.
   */
  async rollbackModel(deploymentId: string, targetVersion: string): Promise<Result<ModelDeployment>> {
    const active = await this.repo.findById(deploymentId);
    if (!active) throw new Error("Deployment not found");

    const oldVersion = active.version;
    active.version = targetVersion;
    active.status = "ACTIVE";

    await this.repo.updateStatus(deploymentId, "ACTIVE");
    await this.eventBus.publish({
      name: "ModelRolledBackV1",
      occurredAt: new Date(),
      data: { modelId: active.modelId, rolledBackFromVersion: oldVersion, targetVersion }
    });

    return returnSuccess(active);
  }

  /**
   * Calculates feature divergence drift index.
   */
  async calculateDrift(modelId: string, version: string): Promise<Result<ModelDriftReport>> {
    const driftScore = Math.random() * 0.4; // simulated drift
    const isDrifted = driftScore > 0.3;

    return returnSuccess({
      reportId: `rep_${Math.random().toString(36).substring(2, 10)}`,
      modelId,
      version,
      driftScore,
      isDrifted,
      checkedAt: new Date()
    });
  }
}
