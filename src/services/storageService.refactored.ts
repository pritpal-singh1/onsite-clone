/**
 * Storage Service (Refactored with Backward Compatibility)
 * Legacy API that delegates to new storage abstraction
 */

import { Transaction } from '../types';
import { transactionStorage, materialStorage } from './storage';

/**
 * Generate unique ID for transactions
 */
export const generateTransactionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
};

/**
 * Save transactions to storage
 * @deprecated Use transactionStorage.save() instead
 */
export const saveTransactions = async (
  transactions: Transaction[]
): Promise<{ success: boolean; error?: string }> => {
  return transactionStorage.save(transactions);
};

/**
 * Load transactions from storage
 * @deprecated Use transactionStorage.load() instead
 */
export const loadTransactions = async (): Promise<{
  success: boolean;
  data: Transaction[];
  error?: string;
}> => {
  return transactionStorage.load();
};

/**
 * Clear all transactions from storage
 * @deprecated Use transactionStorage.clear() instead
 */
export const clearTransactions = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  return transactionStorage.clear();
};

/**
 * Get storage version (legacy)
 */
export const getStorageVersion = async (): Promise<string | null> => {
  // Implementation remains same for now
  return '1.0';
};

/**
 * Set storage version (legacy)
 */
export const setStorageVersion = async (version: string): Promise<void> => {
  // Implementation remains same for now
  console.log(`Storage version set to: ${version}`);
};

/**
 * Initialize storage
 */
export const initializeStorage = async (): Promise<void> => {
  // No-op for now as storage is auto-initialized
  console.log('Storage initialized');
};

/**
 * Export transactions as JSON string
 */
export const exportTransactionsJSON = (transactions: Transaction[]): string => {
  return JSON.stringify(transactions, null, 2);
};

/**
 * Import transactions from JSON string
 */
export const importTransactionsJSON = (
  jsonString: string
): { success: boolean; data?: Transaction[]; error?: string } => {
  try {
    const transactions = JSON.parse(jsonString) as Transaction[];

    if (!Array.isArray(transactions)) {
      return { success: false, error: 'Invalid format: not an array' };
    }

    const isValid = transactions.every(
      (t) =>
        t.id &&
        typeof t.amount === 'number' &&
        t.partyName &&
        t.material &&
        t.project &&
        (t.type === 'in' || t.type === 'out') &&
        t.date
    );

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid transaction format in imported data',
      };
    }

    return { success: true, data: transactions };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    };
  }
};

/**
 * Get storage info (size, item count)
 */
export const getStorageInfo = async (): Promise<{
  itemCount: number;
  estimatedSize: number;
}> => {
  return transactionStorage.getInfo();
};

/**
 * Material management functions
 */

/**
 * Save materials to storage
 * @deprecated Use materialStorage.save() instead
 */
export const saveMaterials = async (materials: string[]): Promise<void> => {
  return materialStorage.save(materials);
};

/**
 * Load materials from storage
 * @deprecated Use materialStorage.load() instead
 */
export const loadMaterials = async (): Promise<string[]> => {
  return materialStorage.load();
};
