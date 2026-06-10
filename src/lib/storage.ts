// src/lib/storage.ts
import * as fs from 'fs';
import * as path from 'path';

// Private directory outside /public
const STORAGE_DIR = path.join(process.cwd(), 'secure-storage');

// Ensure directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export class StorageClient {
  static getFilePath(key: string): string {
    // Basic path traversal prevention
    const cleanKey = path.basename(key);
    return path.join(STORAGE_DIR, cleanKey);
  }

  static async saveFile(key: string, buffer: Buffer): Promise<void> {
    const filePath = this.getFilePath(key);
    await fs.promises.writeFile(filePath, buffer);
  }

  static async getFile(key: string): Promise<Buffer | null> {
    const filePath = this.getFilePath(key);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return fs.promises.readFile(filePath);
  }

  static async deleteFile(key: string): Promise<void> {
    const filePath = this.getFilePath(key);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }
}
