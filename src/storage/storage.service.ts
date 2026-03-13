export interface StorageService {
  save(buffer: Buffer, filename: string, mimeType: string): Promise<string>;
}

export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');
