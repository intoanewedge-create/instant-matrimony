import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import { FeatureVector } from "../domain/phase5-contracts";
import { IFeatureStoreRepository } from "../repositories/interfaces/phase5-repositories.interface";
import { IEventBus } from "../events/event-bus";

/**
 * Service managing machine learning feature vectors, cached embeddings, and versioned snapshots.
 */
export class FeatureStoreService extends BaseService {
  constructor(
    private repo: IFeatureStoreRepository,
    private eventBus: IEventBus
  ) {
    super();
  }

  /**
   * Saves feature vector snapshot for a user.
   */
  async saveFeatures(userId: string, features: Record<string, any>, version: string): Promise<Result<FeatureVector>> {
    const vector: FeatureVector = {
      userId,
      features,
      timestamp: new Date(),
      version
    };

    await this.repo.save(vector);
    await this.eventBus.publish({
      name: "FeatureSnapshotCreatedV1",
      occurredAt: new Date(),
      data: { userId, version }
    });

    return returnSuccess(vector);
  }

  /**
   * Retrieves point-in-time feature vector state.
   */
  async getFeatures(userId: string, version?: string): Promise<Result<FeatureVector | null>> {
    const result = await this.repo.findByUserId(userId, version);
    return returnSuccess(result);
  }

  /**
   * Asserts feature freshness age limits.
   */
  async checkFreshness(userId: string, maxAgeMs: number): Promise<Result<{ fresh: boolean; ageMs: number }>> {
    const vector = await this.repo.findByUserId(userId);
    if (!vector) {
      return returnSuccess({ fresh: false, ageMs: Infinity });
    }
    const ageMs = Date.now() - vector.timestamp.getTime();
    return returnSuccess({
      fresh: ageMs <= maxAgeMs,
      ageMs
    });
  }
}
