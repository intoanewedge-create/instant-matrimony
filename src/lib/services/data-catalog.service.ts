import { BaseService } from "./base.service";
import { Result, returnSuccess } from "../result";
import { DataClassification } from "../domain/phase5-contracts";
import { IDataCatalogRepository } from "../repositories/interfaces/phase5-repositories.interface";

/**
 * Service managing corporate data glossaries, metadata classifications, and PII tagging.
 */
export class DataCatalogService extends BaseService {
  constructor(private repo: IDataCatalogRepository) {
    super();
  }

  /**
   * Registers a column's sensitivity level.
   */
  async classifyField(tableName: string, columnName: string, classification: DataClassification["classification"], owner: string): Promise<Result<DataClassification>> {
    const record: DataClassification = {
      tableName,
      columnName,
      classification,
      owner
    };
    await this.repo.saveClassification(record);
    return returnSuccess(record);
  }

  /**
   * Retrieves structural classification mapping for a table.
   */
  async getFieldClassification(tableName: string, columnName: string): Promise<Result<DataClassification | null>> {
    const classification = await this.repo.getClassification(tableName, columnName);
    return returnSuccess(classification);
  }
}
