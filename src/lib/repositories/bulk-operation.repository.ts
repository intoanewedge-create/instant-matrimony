import { IBulkOperationRepository } from "./interfaces/bulk-operation.repository";
import { BulkOperation } from "../domain/admin/contracts";

export class PrismaBulkOperationRepository implements IBulkOperationRepository {
  private static operations = new Map<string, BulkOperation>();

  async create(type: any, totalCount: number, correlationId: string): Promise<BulkOperation> {
    const id = `bulk_${Math.random().toString(36).substring(2, 15)}`;
    const op: BulkOperation = {
      id,
      type,
      status: "PENDING",
      totalCount,
      processedCount: 0,
      successCount: 0,
      failureCount: 0,
      correlationId,
      createdAt: new Date(),
    };
    PrismaBulkOperationRepository.operations.set(id, op);
    return { ...op };
  }

  async updateProgress(id: string, successCount: number, failureCount: number, status: any): Promise<BulkOperation> {
    const op = PrismaBulkOperationRepository.operations.get(id);
    if (!op) {
      throw new Error(`Bulk operation ${id} not found.`);
    }
    op.successCount = successCount;
    op.failureCount = failureCount;
    op.processedCount = successCount + failureCount;
    op.status = status;
    PrismaBulkOperationRepository.operations.set(id, op);
    return { ...op };
  }

  async getById(id: string): Promise<BulkOperation | null> {
    const op = PrismaBulkOperationRepository.operations.get(id);
    return op ? { ...op } : null;
  }

  async list(limit: number = 20): Promise<BulkOperation[]> {
    return Array.from(PrismaBulkOperationRepository.operations.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map((op) => ({ ...op }));
  }
}
