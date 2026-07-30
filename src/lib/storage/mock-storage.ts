import { StorageProvider } from "./storage-provider";

export class MockStorageProvider implements StorageProvider {
  async upload(file: { name: string; buffer: Buffer; mimeType: string }): Promise<{ url: string; key: string }> {
    const key = `mock-uploads/${Date.now()}-${file.name}`;
    return {
      url: `/${key}`,
      key,
    };
  }

  async delete(key: string): Promise<void> {
    // Mock delete does nothing
  }
}
