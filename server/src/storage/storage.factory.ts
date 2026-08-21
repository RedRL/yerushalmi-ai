import { env } from '../config/env';
import { logger } from '../utils/logger';
import { MockStorageService } from './mock-storage.service';
import { R2StorageService } from './r2-storage.service';
import type { StorageService } from './storage.types';

let cachedService: StorageService | undefined;

/**
 * Returns the active storage implementation based on STORAGE_PROVIDER.
 * R2 is wired via R2StorageService; s3/cloudinary still fall back to mock.
 */
export function getStorageService(): StorageService {
  if (cachedService) return cachedService;

  switch (env.storageProvider) {
    case 'r2':
      cachedService = new R2StorageService();
      break;
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
