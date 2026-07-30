import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import { ReportSnapshot } from "../domain/phase5-contracts";
import { IReportSnapshotRepository } from "../repositories/interfaces/phase5-repositories.interface";
import { IEventBus } from "../events/event-bus";
import * as crypto from "crypto";

/**
 * Service managing report configurations, document generation, and export verification.
 */
export class ReportBuilderService extends BaseService {
  constructor(
    private repo: IReportSnapshotRepository,
    private eventBus: IEventBus
  ) {
    super();
  }

  /**
   * Generates a reproducible, immutable snapshot report.
   */
  async buildSnapshot(reportType: string, dataset: any[], generatedBy: string): Promise<Result<ReportSnapshot>> {
    const dataJson = JSON.stringify(dataset);
    const hash = crypto.createHash("sha256").update(dataJson).digest("hex");

    const snapshot: ReportSnapshot = {
      snapshotId: `snap_${Math.random().toString(36).substring(2, 10)}`,
      reportType,
      dataJson,
      generatedBy,
      hash,
      createdAt: new Date()
    };

    await this.repo.save(snapshot);
    await this.eventBus.publish({
      name: "ReportGeneratedV1",
      occurredAt: new Date(),
      data: { snapshotId: snapshot.snapshotId, reportType }
    });

    return returnSuccess(snapshot);
  }

  /**
   * Asserts the integrity hash of a generated snapshot.
   */
  async verifySnapshot(snapshotId: string): Promise<Result<boolean>> {
    const snapshot = await this.repo.findById(snapshotId);
    if (!snapshot) throw new Error("Snapshot not found");

    const hash = crypto.createHash("sha256").update(snapshot.dataJson).digest("hex");
    return returnSuccess(hash === snapshot.hash);
  }
}
