export interface ICmsRepository {
  findBySlug(slug: string): Promise<any | null>;
  createPage(data: any): Promise<any>;
  updatePage(id: string, data: any): Promise<any>;
  deletePage(id: string): Promise<any>;
  listPages(status?: string): Promise<any[]>;
  createSection(data: any): Promise<any>;
  updateSection(id: string, data: any): Promise<any>;
  deleteSection(id: string): Promise<any>;
  createNavigation(data: any): Promise<any>;
  getNavigationTree(): Promise<any[]>;
  createMedia(data: any): Promise<any>;
  listMedia(): Promise<any[]>;
}
