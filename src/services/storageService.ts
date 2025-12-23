import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../types';

/**
 * Service for data persistence operations
 */

const STORAGE_KEY = '@construction_transactions';
const STORAGE_VERSION_KEY = '@storage_version';
const CURRENT_VERSION = '1.0';

/**
 * Generate unique ID for transactions
 * Using timestamp + random component for better uniqueness
 */
export const generateTransactionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
};

/**
 * Save transactions to storage
 */
export const saveTransactions = async (
  transactions: Transaction[]
): Promise<{ success: boolean; error?: string }> => {
  try {
    const jsonValue = JSON.stringify(transactions);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    return { success: true };
  } catch (error) {
    console.error('Error saving transactions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Load transactions from storage
 */
export const loadTransactions = async (): Promise<{
  success: boolean;
  data: Transaction[];
  error?: string;
}> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue === null) {
      return { success: true, data: [] };
    }

    const transactions = JSON.parse(jsonValue) as Transaction[];
    return { success: true, data: transactions };
  } catch (error) {
    console.error('Error loading transactions:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Clear all transactions from storage
 */
export const clearTransactions = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return { success: true };
  } catch (error) {
    console.error('Error clearing transactions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Get storage version
 */
export const getStorageVersion = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_VERSION_KEY);
  } catch (error) {
    console.error('Error getting storage version:', error);
    return null;
  }
};

/**
 * Set storage version
 */
export const setStorageVersion = async (version: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_VERSION_KEY, version);
  } catch (error) {
    console.error('Error setting storage version:', error);
  }
};

/**
 * Initialize storage (check version, migrate if needed)
 */
export const initializeStorage = async (): Promise<void> => {
  try {
    const currentVersion = await getStorageVersion();

    if (!currentVersion) {
      await setStorageVersion(CURRENT_VERSION);
      return;
    }

    if (currentVersion !== CURRENT_VERSION) {
      console.log(`Migrating storage from ${currentVersion} to ${CURRENT_VERSION}`);
      await setStorageVersion(CURRENT_VERSION);
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
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
  try {
    const result = await loadTransactions();
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
};

/**
 * Material management functions
 */
const MATERIALS_STORAGE_KEY = '@construction_materials';

/**
 * Save materials to storage
 */
export const saveMaterials = async (materials: string[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(materials);
    await AsyncStorage.setItem(MATERIALS_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving materials:', error);
    throw error;
  }
};

/**
 * Load materials from storage
 */
export const loadMaterials = async (): Promise<string[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(MATERIALS_STORAGE_KEY);
    if (jsonValue === null) {
      return [];
    }
    return JSON.parse(jsonValue) as string[];
  } catch (error) {
    console.error('Error loading materials:', error);
    return [];
  }
};
