import { Injectable } from '@nestjs/common';
import { StorageService } from './storage.service';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';

@Injectable()
export class LocalStorageService implements StorageService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  async save(buffer: Buffer, filename: string, _mimeType: string): Promise<string> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    const filepath = path.join(this.uploadDir, filename);
    await fs.writeFile(filepath, buffer);
    return `/uploads/${filename}`;
  }
}
