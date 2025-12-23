/**
 * Storage Service Types
 * Type definitions for storage operations
 */

/**
 * Storage keys enumeration
 */
export enum StorageKeys {
  TRANSACTIONS = '@transactions',
  PROJECTS = '@projects',
  MATERIALS = '@construction_materials',
  SETTINGS = '@settings',
}

/**
 * Storage operation result
 */
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Storage info interface
 */
export interface StorageInfo {
  itemCount: number;
  estimatedSize: number;
}
