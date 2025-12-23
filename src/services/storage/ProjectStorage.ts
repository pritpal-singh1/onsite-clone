/**
 * Project Storage Service
 * Handles project persistence using storage abstraction
 */

import { getStorageProvider } from '../../core/storage';
import { Project } from '../../types';
import { STORAGE_CONFIG } from '../../constants';

/**
 * Project Storage Service Class
 */
export class ProjectStorageService {
  private storage = getStorageProvider();
  private readonly STORAGE_KEY = STORAGE_CONFIG.PROJECTS_KEY;

  /**
   * Save projects to storage
   */
  async save(projects: Project[]): Promise<{ success: boolean; error?: string }> {
    try {
      await this.storage.setItem(this.STORAGE_KEY, projects);
      return { success: true };
    } catch (error) {
      console.error('Error saving projects:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Load projects from storage
   */
  async load(): Promise<{
    success: boolean;
    data: Project[];
    error?: string;
  }> {
    try {
      const projects = await this.storage.getItem<Project[]>(this.STORAGE_KEY);
      return {
        success: true,
        data: projects || [],
      };
    } catch (error) {
      console.error('Error loading projects:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Clear all projects from storage
   */
  async clear(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.storage.removeItem(this.STORAGE_KEY);
      return { success: true };
    } catch (error) {
      console.error('Error clearing projects:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const projectStorage = new ProjectStorageService();
