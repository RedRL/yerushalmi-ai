import { randomUUID } from 'node:crypto';
import { logger } from '../utils/logger';
import type {
  CompleteUploadResult,
  InitiateUploadInput,
  InitiateUploadResult,
  StorageService,
} from './storage.types';

/**
 * Development-only storage implementation. It never touches the filesystem
 * or a real bucket - it just generates plausible references so the rest of
 * the application (validation, pricing, email) can be built and tested end
 * to end before a real provider (R2 / S3 / Cloudinary) is selected.
 *
 * TODO(storage): replace with R2StorageService / S3StorageService /
 * CloudinaryStorageService once a provider is chosen. The public interface
 * (`StorageService`) is designed to stay the same.
 */
export class MockStorageService implements StorageService {
  public readonly providerName = 'mock';

  async initiateUpload(input: InitiateUploadInput): Promise<InitiateUploadResult> {
    const storageKey = `mock/${input.fileType}/${randomUUID()}-${input.fileName}`;

    logger.info('Mock storage: upload initiated (no bytes are actually stored)', {
      storageKey,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    });

    return {
      storageKey,
      // In development there is no real signed URL - the client-side mock
      // upload flow treats this as "already complete".
      uploadUrl: `mock://uploads/${storageKey}`,
      method: 'PUT',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  }

  async completeUpload(storageKey: string): Promise<CompleteUploadResult> {
    logger.info('Mock storage: upload marked complete', { storageKey });
    return { storageKey, url: this.getPublicUrl(storageKey) };
  }

  getPublicUrl(storageKey: string): string {
    return `mock://uploads/${storageKey}`;
  }
}
