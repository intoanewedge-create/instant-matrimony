import { IJobRepository } from "./interfaces/job.repository";
import { JobDetails } from "../domain/admin/contracts";

export class PrismaJobRepository implements IJobRepository {
  private static jobsMap = new Map<string, JobDetails>();
  private static logsMap = new Map<string, any[]>();

  async saveJobDetails(job: JobDetails): Promise<void> {
    PrismaJobRepository.jobsMap.set(job.name, { ...job });
  }

  async getJobDetails(name: string): Promise<JobDetails | null> {
    const job = PrismaJobRepository.jobsMap.get(name);
    return job ? { ...job } : null;
  }

  async getAllJobs(): Promise<JobDetails[]> {
    return Array.from(PrismaJobRepository.jobsMap.values()).map((j) => ({ ...j }));
  }

  async logJobExecution(name: string, status: string, durationMs: number, error?: string): Promise<void> {
    if (!PrismaJobRepository.logsMap.has(name)) {
      PrismaJobRepository.logsMap.set(name, []);
    }
    const logs = PrismaJobRepository.logsMap.get(name)!;
    logs.unshift({
      timestamp: new Date(),
      status,
      durationMs,
      error: error || null,
    });
    // Keep last 100 logs
    if (logs.length > 100) {
      logs.pop();
    }
  }

  async getExecutionLogs(name: string, limit: number = 50): Promise<any[]> {
    const logs = PrismaJobRepository.logsMap.get(name) || [];
    return logs.slice(0, limit);
  }
}
