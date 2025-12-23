/**
 * Transaction Storage Service
 * Handles transaction persistence using storage abstraction
 */

import { getStorageProvider } from '../../core/storage';
import { Transaction } from '../../types';
import { STORAGE_CONFIG } from '../../constants';

/**
 * Transaction Storage Service Class
 */
export class TransactionStorageService {
  private storage = getStorageProvider();
  private readonly STORAGE_KEY = STORAGE_CONFIG.TRANSACTIONS_KEY;

  /**
   * Save transactions to storage
   */
  async save(transactions: Transaction[]): Promise<{ success: boolean; error?: string }> {
    try {
      await this.storage.setItem(this.STORAGE_KEY, transactions);
      return { success: true };
    } catch (error) {
      console.error('Error saving transactions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Load transactions from storage
   */
  async load(): Promise<{
    success: boolean;
    data: Transaction[];
    error?: string;
  }> {
    try {
      const transactions = await this.storage.getItem<Transaction[]>(this.STORAGE_KEY);
      return {
        success: true,
        data: transactions || [],
      };
    } catch (error) {
      console.error('Error loading transactions:', error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Clear all transactions from storage
   */
  async clear(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.storage.removeItem(this.STORAGE_KEY);
      return { success: true };
    } catch (error) {
      console.error('Error clearing transactions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get storage info
   */
  async getInfo(): Promise<{ itemCount: number; estimatedSize: number }> {
    try {
      const result = await this.load();
      if (result.success) {
        const jsonString = JSON.stringify(result.data);
        return {
          itemCount: result.data.length,
          estimatedSize: new Blob([jsonString]).size,
        };
      }
      return { itemCount: 0, estimatedSize: 0 };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { itemCount: 0, estimatedSize: 0 };
    }
  }
}

// Export singleton instance
export const transactionStorage = new TransactionStorageService();
