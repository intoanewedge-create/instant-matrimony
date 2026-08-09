import { IScheduler, Job } from "../scheduler.interface";
import { loggerService } from "../../services/logger.service";

export class BullMQScheduler implements IScheduler {
  private jobs: Job[] = [];
  private isRunning = false;

  async start(): Promise<void> {
    loggerService.info("BullMQScheduler (stub) started.");
    this.isRunning = true;
  }

  pause(): void {
    loggerService.info("BullMQScheduler (stub) paused.");
  }

  resume(): void {
    loggerService.info("BullMQScheduler (stub) resumed.");
  }

  async stop(): Promise<void> {
    loggerService.info("BullMQScheduler (stub) stopped.");
    this.isRunning = false;
  }

  async drain(): Promise<void> {
    loggerService.info("BullMQScheduler (stub) drained.");
  }

  health(): { status: string; jobsCount: number; activeJobs: string[] } {
    return {
      status: this.isRunning ? "RUNNING" : "STOPPED",
      jobsCount: this.jobs.length,
      activeJobs: [],
    };
  }

  registerJob(job: Job): void {
    loggerService.info(`BullMQScheduler registered job: ${job.name} (interval: ${job.intervalMs}ms)`);
    this.jobs.push(job);
  }

  pauseJob(_name: string): void {}
  resumeJob(_name: string): void {}
  async runJob(_name: string): Promise<void> {}
  cancelJob(_name: string): void {}
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
  async forceExecuteJob(_name: string): Promise<void> {}
}

