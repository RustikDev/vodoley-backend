export interface StorageService {
  save(buffer: Buffer, filename: string, mimeType: string): Promise<string>;
  delete(filename: string): Promise<void>;
}

export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');
