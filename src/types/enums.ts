/**
 * Enumerations for the application
 * Following SOLID principles - Single Responsibility
 */

/**
 * Transaction type enumeration
 */
export enum TransactionType {
  IN = 'in',
  OUT = 'out',
}

/**
 * Storage keys for AsyncStorage
 */
export enum StorageKeys {
  TRANSACTIONS = '@transactions',
}

/**
 * Navigation route names
 */
export enum Routes {
  DASHBOARD = 'Dashboard',
  ADD_TRANSACTION = 'Add',
  HISTORY = 'History',
  PROJECTS = 'Projects',
  REPORTS = 'Reports',
}
