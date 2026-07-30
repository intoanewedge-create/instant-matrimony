export interface StorageProvider {
  upload(file: { name: string; buffer: Buffer; mimeType: string }): Promise<{ url: string; key: string }>;
  delete(key: string): Promise<void>;
}
