export interface ISavedSearchRepository {
  saveSearch(userId: string, name: string, filters: any): Promise<any>;
  renameSearch(id: string, name: string): Promise<any>;
  deleteSearch(id: string): Promise<any>;
  listSavedSearches(userId: string): Promise<any[]>;
  pinSearch(id: string, isPinned: boolean): Promise<any>;
  findById(id: string): Promise<any | null>;
  countSavedSearches(userId: string): Promise<number>;
}
