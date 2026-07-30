import { IScheduler, Job } from "../scheduler.interface";
import { loggerService } from "../../services/logger.service";

export class InngestScheduler implements IScheduler {
  private jobs: Job[] = [];
  private isRunning = false;

  async start(): Promise<void> {
    loggerService.info("InngestScheduler (stub) started.");
    this.isRunning = true;
  }

  pause(): void {
    loggerService.info("InngestScheduler (stub) paused.");
  }

  resume(): void {
    loggerService.info("InngestScheduler (stub) resumed.");
  }

  async stop(): Promise<void> {
    loggerService.info("InngestScheduler (stub) stopped.");
    this.isRunning = false;
  }

  async drain(): Promise<void> {
    loggerService.info("InngestScheduler (stub) drained.");
  }

  health(): { status: string; jobsCount: number; activeJobs: string[] } {
    return {
      status: this.isRunning ? "RUNNING" : "STOPPED",
      jobsCount: this.jobs.length,
      activeJobs: [],
    };
  }

  registerJob(job: Job): void {
    loggerService.info(`InngestScheduler registered job: ${job.name} (interval: ${job.intervalMs}ms)`);
    this.jobs.push(job);
  }

  pauseJob(name: string): void {}
  resumeJob(name: string): void {}
  async runJob(name: string): Promise<void> {}
  cancelJob(name: string): void {}
  getAllJobsDetails(): any[] {
    return [];
  }
  getQueueStats(): any {
    return {
      activeJobsCount: 0,
      queuedJobsCount: 0,
      retryQueueCount: 0,
      dlqCount: 0,
      averageProcessingTimeMs: 0,
      throughputJobsPerSec: 0,
    };
  }
  async forceExecuteJob(name: string): Promise<void> {}
}

