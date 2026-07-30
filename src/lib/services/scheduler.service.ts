import { BaseService } from "./base.service";
import { IScheduler, Job } from "../scheduler/scheduler.interface";
import { SchedulerFactory } from "../scheduler/scheduler-factory";
import { loggerService } from "./logger.service";

export class SchedulerService extends BaseService {
  private scheduler: IScheduler;

  constructor(providerType: string = process.env.SCHEDULER_PROVIDER || "memory") {
    super();
    this.scheduler = SchedulerFactory.create(providerType);
    this.registerJobs();
  }

  private registerJobs() {
    this.registerJob({
      name: "membership-expiration",
      intervalMs: 1000 * 3600 * 2,
      run: async () => {
        loggerService.info("Running background job: membership-expiration");
      },
    });

    this.registerJob({
      name: "premium-downgrade",
      intervalMs: 1000 * 3600 * 4,
      run: async () => {
        loggerService.info("Running background job: premium-downgrade");
      },
    });

    this.registerJob({
      name: "notification-cleanup",
      intervalMs: 1000 * 3600 * 24,
      run: async () => {
        loggerService.info("Running background job: notification-cleanup");
      },
    });

    this.registerJob({
      name: "otp-cleanup",
      intervalMs: 1000 * 3600 * 1,
      run: async () => {
        loggerService.info("Running background job: otp-cleanup");
      },
    });

    this.registerJob({
      name: "session-cleanup",
      intervalMs: 1000 * 3600 * 6,
      run: async () => {
        loggerService.info("Running background job: session-cleanup");
      },
    });

    this.registerJob({
      name: "cache-cleanup",
      intervalMs: 1000 * 3600 * 12,
      run: async () => {
        loggerService.info("Running background job: cache-cleanup");
      },
    });

    this.registerJob({
      name: "audit-log-archival",
      intervalMs: 1000 * 3600 * 24,
      run: async () => {
        loggerService.info("Running background job: audit-log-archival");
      },
    });

    this.registerJob({
      name: "analytics-aggregation",
      intervalMs: 1000 * 3600 * 2,
      run: async () => {
        loggerService.info("Running background job: analytics-aggregation");
      },
    });

    this.registerJob({
      name: "recommendation-refresh",
      intervalMs: 1000 * 60 * 30,
      run: async () => {
        loggerService.info("Running background job: recommendation-refresh");
      },
    });

    this.registerJob({
      name: "cms-cache-warming",
      intervalMs: 1000 * 3600 * 1,
      run: async () => {
        loggerService.info("Running background job: cms-cache-warming");
      },
    });
  }

  registerJob(job: Job): void {
    this.scheduler.registerJob(job);
  }

  async start(): Promise<void> {
    await this.scheduler.start();
  }

  pause(): void {
    this.scheduler.pause();
  }

  resume(): void {
    this.scheduler.resume();
  }

  async stop(): Promise<void> {
    await this.scheduler.stop();
  }

  async drain(): Promise<void> {
    await this.scheduler.drain();
  }

  healthCheck() {
    return this.scheduler.health();
  }

  pauseJob(name: string): void {
    this.scheduler.pauseJob(name);
  }

  resumeJob(name: string): void {
    this.scheduler.resumeJob(name);
  }

  async runJob(name: string): Promise<void> {
    await this.scheduler.runJob(name);
  }

  cancelJob(name: string): void {
    this.scheduler.cancelJob(name);
  }

  async forceExecuteJob(name: string): Promise<void> {
    await this.scheduler.forceExecuteJob(name);
  }

  getAllJobsDetails(): any[] {
    return this.scheduler.getAllJobsDetails();
  }

  getQueueStats(): any {
    return this.scheduler.getQueueStats();
  }
}

