import { BaseService } from "./base.service";
import { Result } from "../result";
import { logger } from "../logger";

export interface ReleaseState {
  version: string;
  status: "STAGED" | "CANARY" | "ACTIVE" | "ROLLED_BACK";
  canaryWeight: number; // 0 to 100 percentage
  errorCount: number;
  errorThreshold: number; // Rollback if errorCount exceeds threshold
  metadata: {
    environment: string;
    deployedAt: Date;
    deploymentMode: "BLUE_GREEN" | "CANARY";
  };
}

/**
 * Enterprise Release & Feature Rollout Service.
 * Manages canary deployment weights, gathers release error telemetry,
 * and executes automated rollbacks when exception rates exceed configured parameters.
 */
export class ReleaseService extends BaseService {
  private static releases = new Map<string, ReleaseState>();

  /**
   * Registers a new production application release.
   */
  public async createRelease(
    version: string,
    deploymentMode: "BLUE_GREEN" | "CANARY",
    errorThreshold = 10
  ): Promise<Result<ReleaseState>> {
    logger.info(`[ReleaseService] Creating release record: v${version} (${deploymentMode}).`);

    const state: ReleaseState = {
      version,
      status: "STAGED",
      canaryWeight: 0,
      errorCount: 0,
      errorThreshold,
      metadata: {
        environment: "production",
        deployedAt: new Date(),
        deploymentMode
      }
    };

    ReleaseService.releases.set(version, state);
    return this.returnSuccess(state);
  }

  /**
   * Adjusts the canary routing percentage weight (0 to 100).
   */
  public async updateCanaryWeight(version: string, weight: number): Promise<Result<ReleaseState>> {
    const release = ReleaseService.releases.get(version);
    if (!release) return this.returnFailure("Release not found.", "RELEASE_NOT_FOUND");

    release.canaryWeight = Math.max(0, Math.min(100, weight));
    release.status = weight >= 100 ? "ACTIVE" : "CANARY";
    
    logger.info(`[ReleaseService] Canary weight updated for v${version} to ${weight}%. Status: ${release.status}`);
    return this.returnSuccess(release);
  }

  /**
   * Tracks an error event against the release. Executes automated rollback if threshold is breached.
   */
  public async trackError(version: string): Promise<Result<ReleaseState>> {
    const release = ReleaseService.releases.get(version);
    if (!release) return this.returnFailure("Release not found.", "RELEASE_NOT_FOUND");

    release.errorCount++;
    logger.warn(`[ReleaseService] Release v${version} logged error. Current: ${release.errorCount}/${release.errorThreshold}`);

    if (release.errorCount >= release.errorThreshold && release.status !== "ROLLED_BACK") {
      logger.fatal(`[ReleaseService] Error threshold reached for v${version}. Initiating AUTOMATIC ROLLBACK!`);
      return this.rollbackRelease(version);
    }

    return this.returnSuccess(release);
  }

  /**
   * Manually triggers a rollback of the release version.
   */
  public async rollbackRelease(version: string): Promise<Result<ReleaseState>> {
    const release = ReleaseService.releases.get(version);
    if (!release) return this.returnFailure("Release not found.", "RELEASE_NOT_FOUND");

    release.status = "ROLLED_BACK";
    release.canaryWeight = 0;
    
    logger.info(`[ReleaseService] Release v${version} successfully rolled back.`);
    return this.returnSuccess(release);
  }

  /**
   * Gets the active release state.
   */
  public getRelease(version: string): Result<ReleaseState> {
    const release = ReleaseService.releases.get(version);
    if (!release) return this.returnFailure("Release not found.", "RELEASE_NOT_FOUND");
    return this.returnSuccess(release);
  }
}
export const releaseService = new ReleaseService();
export default releaseService;
