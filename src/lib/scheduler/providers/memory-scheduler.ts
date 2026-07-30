import { IScheduler, Job } from "../scheduler.interface";
import { loggerService } from "../../services/logger.service";
import { eventDispatcher } from "../../events/event-dispatcher";
import {
  JobStartedEvent,
  JobCompletedEvent,
  JobFailedEvent,
  JobRetriedEvent,
  QueueOverflowEvent,
  DLQEvent,
} from "../../events/events/scheduler.events";

interface LocalJobStats {
  name: string;
  status: "idle" | "running" | "paused" | "failed";
  intervalMs: number;
  runCount: number;
  failureCount: number;
  consecutiveFailures: number;
  averageRuntimeMs: number;
  lastRunStart: Date | null;
  lastRunEnd: Date | null;
  nextRunAt: Date | null;
  lastErrorMessage?: string | null;
}

export class MemoryScheduler implements IScheduler {
  private jobs: Job[] = [];
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private runningJobs: Set<string> = new Set();
  private pausedJobs: Set<string> = new Set();
  private isPaused = false;
  private isStopping = false;

  // Local stats tracking
  private statsMap = new Map<string, LocalJobStats>();
  private dlqList: Array<{ jobName: string; error: string; timestamp: Date }> = [];
  private totalRunTimes = new Map<string, number>();

  async start(): Promise<void> {
    loggerService.info("MemoryScheduler starting...");
    this.isPaused = false;
    this.isStopping = false;

    for (const job of this.jobs) {
      if (this.pausedJobs.has(job.name)) continue;
      this.runJobWithRecoveryAndRetry(job);
      this.scheduleJob(job);
    }
  }

  private scheduleJob(job: Job) {
    if (this.intervals.has(job.name)) {
      clearInterval(this.intervals.get(job.name)!);
    }

    const interval = setInterval(() => {
      if (this.isPaused || this.isStopping || this.pausedJobs.has(job.name)) return;
      this.runJobWithRecoveryAndRetry(job);
    }, job.intervalMs);

    this.intervals.set(job.name, interval);
  }

  private async runJobWithRecoveryAndRetry(job: Job) {
    if (this.runningJobs.has(job.name)) {
      loggerService.warn(`Job ${job.name} is already running, skipping interval execution.`);
      return;
    }

    const stats = this.statsMap.get(job.name)!;
    stats.status = "running";
    stats.lastRunStart = new Date();
    this.runningJobs.add(job.name);

    // Emit event: Started
    await eventDispatcher.publish(new JobStartedEvent({ jobName: job.name, timestamp: stats.lastRunStart }));

    const start = Date.now();
    let attempt = 0;
    const maxRetries = job.maxRetries ?? 3;
    let success = false;
    let lastError = "";

    while (attempt <= maxRetries && !success && !this.isStopping) {
      try {
        loggerService.debug(`Running job ${job.name} (Attempt ${attempt + 1}/${maxRetries + 1})...`);
        await job.run();
        success = true;
        stats.consecutiveFailures = 0;
        stats.status = "idle";
      } catch (err: any) {
        attempt++;
        lastError = err.message;
        stats.consecutiveFailures++;
        stats.lastErrorMessage = err.message;

        loggerService.error(`Error executing job ${job.name}`, { attempt, maxRetries }, err);

        // Emit event: Retried or Failed
        if (attempt <= maxRetries && !this.isStopping) {
          await eventDispatcher.publish(
            new JobRetriedEvent({
              jobName: job.name,
              retryCount: attempt,
              maxRetries,
              error: err.message,
              timestamp: new Date(),
            })
          );
          const backoffMs = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }

    const duration = Date.now() - start;
    stats.lastRunEnd = new Date();
    stats.runCount++;
    stats.nextRunAt = new Date(Date.now() + job.intervalMs);

    // Compute average runtime
    const totalRuntime = (this.totalRunTimes.get(job.name) || 0) + duration;
    this.totalRunTimes.set(job.name, totalRuntime);
    stats.averageRuntimeMs = Math.round(totalRuntime / stats.runCount);

    if (success) {
      // Emit event: Completed
      await eventDispatcher.publish(new JobCompletedEvent({ jobName: job.name, durationMs: duration, timestamp: new Date() }));
    } else {
      stats.status = "failed";
      stats.failureCount++;

      // Emit event: Failed
      await eventDispatcher.publish(new JobFailedEvent({ jobName: job.name, error: lastError, timestamp: new Date() }));

      // Push to DLQ
      this.dlqList.push({ jobName: job.name, error: lastError, timestamp: new Date() });
      await eventDispatcher.publish(new DLQEvent({ jobName: job.name, error: lastError, timestamp: new Date() }));
      loggerService.fatal(`Job ${job.name} failed after maximum retries. Pushed to DLQ.`);
    }

    this.runningJobs.delete(job.name);
  }

  pause(): void {
    loggerService.info("MemoryScheduler paused.");
    this.isPaused = true;
  }

  resume(): void {
    loggerService.info("MemoryScheduler resumed.");
    this.isPaused = false;
  }

  async stop(): Promise<void> {
    loggerService.info("MemoryScheduler stopping...");
    this.isStopping = true;
    for (const [name, interval] of this.intervals.entries()) {
      clearInterval(interval);
      this.intervals.delete(name);
    }
  }

  async drain(): Promise<void> {
    loggerService.info("MemoryScheduler draining active jobs...");
    this.isStopping = true;
    while (this.runningJobs.size > 0) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    loggerService.info("All scheduler jobs successfully drained.");
  }

  health(): { status: string; jobsCount: number; activeJobs: string[] } {
    return {
      status: this.isStopping ? "STOPPING" : this.isPaused ? "PAUSED" : "RUNNING",
      jobsCount: this.jobs.length,
      activeJobs: Array.from(this.runningJobs),
    };
  }

  registerJob(job: Job): void {
    loggerService.info(`Registering background job: ${job.name}`);
    this.jobs.push(job);

    this.statsMap.set(job.name, {
      name: job.name,
      status: "idle",
      intervalMs: job.intervalMs,
      runCount: 0,
      failureCount: 0,
      consecutiveFailures: 0,
      averageRuntimeMs: 0,
      lastRunStart: null,
      lastRunEnd: null,
      nextRunAt: new Date(Date.now() + job.intervalMs),
    });

    if (!this.isStopping && this.intervals.size > 0) {
      this.scheduleJob(job);
    }
  }

  // Extended IScheduler Methods
  pauseJob(name: string): void {
    loggerService.info(`Pausing background job: ${name}`);
    this.pausedJobs.add(name);
    const stats = this.statsMap.get(name);
    if (stats) stats.status = "paused";
    if (this.intervals.has(name)) {
      clearInterval(this.intervals.get(name)!);
      this.intervals.delete(name);
    }
  }

  resumeJob(name: string): void {
    loggerService.info(`Resuming background job: ${name}`);
    this.pausedJobs.delete(name);
    const stats = this.statsMap.get(name);
    if (stats) stats.status = "idle";
    const job = this.jobs.find((j) => j.name === name);
    if (job && !this.isStopping) {
      this.scheduleJob(job);
    }
  }

  async runJob(name: string): Promise<void> {
    const job = this.jobs.find((j) => j.name === name);
    if (job) {
      this.runJobWithRecoveryAndRetry(job);
    }
  }

  cancelJob(name: string): void {
    this.pauseJob(name);
  }

  async forceExecuteJob(name: string): Promise<void> {
    loggerService.info(`Force executing job: ${name}`);
    const job = this.jobs.find((j) => j.name === name);
    if (job) {
      await this.runJobWithRecoveryAndRetry(job);
    }
  }

  getAllJobsDetails(): any[] {
    return Array.from(this.statsMap.values());
  }

  getQueueStats(): any {
    const totalCount = this.jobs.length;
    const running = this.runningJobs.size;
    const paused = this.pausedJobs.size;
    const idle = totalCount - running - paused;

    let totalRuns = 0;
    let totalFailures = 0;
    let totalTime = 0;

    this.statsMap.forEach((v) => {
      totalRuns += v.runCount;
      totalFailures += v.failureCount;
      totalTime += (v.averageRuntimeMs * v.runCount);
    });

    const averageProcessingTimeMs = totalRuns > 0 ? Math.round(totalTime / totalRuns) : 0;
    const failurePercent = totalRuns > 0 ? Math.round((totalFailures / totalRuns) * 100) : 0;

    return {
      activeJobsCount: running,
      queuedJobsCount: idle,
      retryQueueCount: 0,
      dlqCount: this.dlqList.length,
      averageProcessingTimeMs,
      throughputJobsPerSec: totalRuns / Math.max(1, process.uptime()),
      dlqList: this.dlqList,
      failurePercent,
      successPercent: 100 - failurePercent,
      workerUtilization: Math.min(100, Math.round((running / Math.max(1, totalCount)) * 100)),
    };
  }
}

