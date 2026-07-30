import { JobDetails } from "../../domain/admin/contracts";

export interface IJobRepository {
  saveJobDetails(job: JobDetails): Promise<void>;
  getJobDetails(name: string): Promise<JobDetails | null>;
  getAllJobs(): Promise<JobDetails[]>;
  logJobExecution(name: string, status: string, durationMs: number, error?: string): Promise<void>;
  getExecutionLogs(name: string, limit?: number): Promise<any[]>;
}
