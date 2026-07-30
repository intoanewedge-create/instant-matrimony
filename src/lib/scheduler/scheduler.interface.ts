export interface Job {
  name: string;
  intervalMs: number;
  run(): Promise<void>;
  retryCount?: number;
  maxRetries?: number;
}

export interface IScheduler {
  start(): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): Promise<void>;
  drain(): Promise<void>;
  health(): { status: string; jobsCount: number; activeJobs: string[] };
  registerJob(job: Job): void;
  
  pauseJob(name: string): void;
  resumeJob(name: string): void;
  runJob(name: string): Promise<void>;
  cancelJob(name: string): void;
  getAllJobsDetails(): any[];
  getQueueStats(): any;
  forceExecuteJob(name: string): Promise<void>;
}

