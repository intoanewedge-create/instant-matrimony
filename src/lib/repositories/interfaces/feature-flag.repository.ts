export interface IFeatureFlagRepository {
  findByKey(key: string): Promise<any | null>;
  upsert(key: string, enabled: boolean, value?: string, description?: string, category?: string): Promise<any>;
  listAll(): Promise<any[]>;
  update(key: string, enabled: boolean, value?: string): Promise<any>;
}
