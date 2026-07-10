import { env } from '../config/env';
import { logger } from '../utils/logger';
import { MockStorageService } from './mock-storage.service';
import type { StorageService } from './storage.types';

let cachedService: StorageService | undefined;

/**
 * Returns the active storage implementation based on STORAGE_PROVIDER.
 * Only "mock" is implemented in Milestone 1. Real providers will be added
 * as R2StorageService / S3StorageService / CloudinaryStorageService without
 * changing any calling code.
 */
export function getStorageService(): StorageService {
  if (cachedService) return cachedService;

  switch (env.storageProvider) {
    case 'r2':
    case 's3':
    case 'cloudinary':
      logger.warn(
        `Storage provider "${env.storageProvider}" is not implemented yet - falling back to mock storage.`,
      );
      cachedService = new MockStorageService();
      break;
    case 'mock':
    default:
      cachedService = new MockStorageService();
      break;
  }

  return cachedService;
}
