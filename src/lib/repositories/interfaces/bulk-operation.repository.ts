import { BulkOperation } from "../../domain/admin/contracts";

export interface IBulkOperationRepository {
  create(type: string, totalCount: number, correlationId: string): Promise<BulkOperation>;
  updateProgress(id: string, successCount: number, failureCount: number, status: string): Promise<BulkOperation>;
  getById(id: string): Promise<BulkOperation | null>;
  list(limit?: number): Promise<BulkOperation[]>;
}
