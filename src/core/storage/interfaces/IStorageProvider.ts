/**
 * Storage Provider Interface
 * Abstraction for storage operations following Dependency Inversion Principle
 */

export interface IStorageProvider {
  /**
   * Get item from storage
   */
  getItem<T>(key: string): Promise<T | null>;

  /**
   * Set item in storage
   */
  setItem<T>(key: string, value: T): Promise<void>;

  /**
   * Remove item from storage
   */
  removeItem(key: string): Promise<void>;

  /**
   * Clear all storage
   */
  clear(): Promise<void>;

  /**
   * Get all keys
   */
  getAllKeys(): Promise<string[]>;

  /**
   * Check if key exists
   */
  hasKey(key: string): Promise<boolean>;
}
