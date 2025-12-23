/**
 * Storage Factory
 * Factory pattern for creating storage provider instances
 */

import { IStorageProvider } from './interfaces/IStorageProvider';
import { AsyncStorageProvider } from './providers/AsyncStorageProvider';

/**
 * Storage provider singleton instance
 */
let storageInstance: IStorageProvider | null = null;

/**
 * Get storage provider instance
 */
export const getStorageProvider = (): IStorageProvider => {
  if (!storageInstance) {
    storageInstance = new AsyncStorageProvider();
  }
  return storageInstance;
};

/**
 * Set custom storage provider (for testing)
 */
export const setStorageProvider = (provider: IStorageProvider): void => {
  storageInstance = provider;
};

/**
 * Reset storage provider to default
 */
export const resetStorageProvider = (): void => {
  storageInstance = null;
};
