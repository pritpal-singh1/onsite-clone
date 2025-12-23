/**
 * Material Storage Service
 * Handles material persistence using storage abstraction
 */

import { getStorageProvider } from '../../core/storage';
import { STORAGE_CONFIG } from '../../constants';

/**
 * Material Storage Service Class
 */
export class MaterialStorageService {
  private storage = getStorageProvider();
  private readonly STORAGE_KEY = STORAGE_CONFIG.MATERIALS_KEY;

  /**
   * Save materials to storage
   */
  async save(materials: string[]): Promise<void> {
    try {
      await this.storage.setItem(this.STORAGE_KEY, materials);
    } catch (error) {
      console.error('Error saving materials:', error);
      throw error;
    }
  }

  /**
   * Load materials from storage
   */
  async load(): Promise<string[]> {
    try {
      const materials = await this.storage.getItem<string[]>(this.STORAGE_KEY);
      return materials || [];
    } catch (error) {
      console.error('Error loading materials:', error);
      return [];
    }
  }

  /**
   * Clear all materials from storage
   */
  async clear(): Promise<void> {
    try {
      await this.storage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing materials:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const materialStorage = new MaterialStorageService();
