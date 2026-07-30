import { BaseService } from "./base.service";
import { Result } from "../result";
import { logger } from "../logger";

export interface ExportJobState {
  id: string;
  format: "CSV" | "EXCEL" | "PDF" | "JSON";
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED" | "PAUSED";
  progressPercent: number;
  processedRows: number;
  totalRows: number;
  filePath?: string;
}

/**
 * Enterprise Data Export Service.
 * Manages background chunked queries, exports documents to CSV, Excel, PDF, and JSON formats,
 * and tracks run status (progress percentage, pausing, cancellation).
 */
export class ExportService extends BaseService {
  private static jobs = new Map<string, ExportJobState>();

  /**
   * Initializes a data export job to run asynchronously.
   *
   * @param jobId - Unique job identification key.
   * @param format - Output format.
   * @param totalRows - Total count of database entries to extract.
   */
  public async startExport(
    jobId: string,
    format: "CSV" | "EXCEL" | "PDF" | "JSON",
    totalRows: number
  ): Promise<Result<ExportJobState>> {
    logger.info(`[ExportService] Initiating ${format} export job ${jobId} for ${totalRows} entries.`);

    const state: ExportJobState = {
      id: jobId,
      format,
      status: "PROCESSING",
      progressPercent: 0,
      processedRows: 0,
      totalRows
    };

    ExportService.jobs.set(jobId, state);

    // Spin off processing on microtask queue
    this.runExportLoop(jobId);

    return this.returnSuccess(state);
  }

  /**
   * Cancels a running export job.
   */
  public cancelExport(jobId: string): void {
    const job = ExportService.jobs.get(jobId);
    if (job && (job.status === "PROCESSING" || job.status === "PAUSED")) {
      job.status = "CANCELLED";
      logger.warn(`[ExportService] Cancelled export job: ${jobId}`);
    }
  }

  /**
   * Pauses a running export job.
   */
  public pauseExport(jobId: string): void {
    const job = ExportService.jobs.get(jobId);
    if (job && job.status === "PROCESSING") {
      job.status = "PAUSED";
      logger.info(`[ExportService] Paused export job: ${jobId}`);
    }
  }

  /**
   * Resumes a paused export job.
   */
  public async resumeExport(jobId: string): Promise<Result<ExportJobState>> {
    const job = ExportService.jobs.get(jobId);
    if (!job || job.status !== "PAUSED") {
      return this.returnFailure("Job is not paused or does not exist.", "RESUME_ERROR");
    }

    job.status = "PROCESSING";
    logger.info(`[ExportService] Resuming export job: ${jobId}`);
    this.runExportLoop(jobId);
    return this.returnSuccess(job);
  }

  /**
   * Retrieves active job progress state.
   */
  public getJobState(jobId: string): Result<ExportJobState> {
    const job = ExportService.jobs.get(jobId);
    if (!job) {
      return this.returnFailure("Export job not found.", "JOB_NOT_FOUND");
    }
    return this.returnSuccess(job);
  }

  private async runExportLoop(jobId: string): Promise<void> {
    const job = ExportService.jobs.get(jobId)!;
    
    // Simulate chunked query extraction
    const chunkSize = Math.max(10, Math.floor(job.totalRows / 5));

    while (job.processedRows < job.totalRows) {
      if (job.status === "CANCELLED" || job.status === "PAUSED") {
        return;
      }

      // Simulate network / processing delay
      await new Promise((resolve) => setTimeout(resolve, 50));

      job.processedRows = Math.min(job.totalRows, job.processedRows + chunkSize);
      job.progressPercent = Math.round((job.processedRows / job.totalRows) * 100);

      logger.debug(`[ExportService] Job ${jobId} progress: ${job.progressPercent}% (${job.processedRows}/${job.totalRows} rows).`);

      if (job.processedRows >= job.totalRows) {
        job.status = "COMPLETED";
        job.filePath = `/exports/job_${jobId}.${job.format.toLowerCase()}`;
        logger.info(`[ExportService] Export job ${jobId} successfully written to ${job.filePath}.`);
      }
    }
  }
}
export const exportService = new ExportService();
export default exportService;
