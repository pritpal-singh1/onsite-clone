/**
 * Transaction Service Interface
 * Defines contract for transaction-related business logic
 */

import { Transaction } from '../../../types';

export interface ITransactionService {
  /**
   * Calculate totals from transactions
   */
  calculateTotals(
    transactions: Transaction[]
  ): { totalIncome: number; totalExpense: number; balance: number };

  /**
   * Filter transactions by project
   */
  filterByProject(transactions: Transaction[], projectName: string): Transaction[];

  /**
   * Filter transactions by material
   */
  filterByMaterial(transactions: Transaction[], materialName: string): Transaction[];

  /**
   * Filter transactions by type
   */
  filterByType(transactions: Transaction[], type: 'in' | 'out'): Transaction[];

  /**
   * Filter transactions by date range
   */
  filterByDateRange(
    transactions: Transaction[],
    startDate: Date,
    endDate: Date
  ): Transaction[];

  /**
   * Filter transactions by month
   */
  filterByMonth(transactions: Transaction[], year: number, month: number): Transaction[];

  /**
   * Get unique project names from transactions
   */
  getUniqueProjects(transactions: Transaction[]): string[];

  /**
   * Get unique material names from transactions
   */
  getUniqueMaterials(transactions: Transaction[]): string[];

  /**
   * Get unique party names from transactions
   */
  getUniqueParties(transactions: Transaction[]): string[];

  /**
   * Group transactions by month
   */
  groupByMonth(transactions: Transaction[]): { [key: string]: Transaction[] };

  /**
   * Group transactions by project
   */
  groupByProject(transactions: Transaction[]): { [key: string]: Transaction[] };

  /**
   * Group transactions by material
   */
  groupByMaterial(transactions: Transaction[]): { [key: string]: Transaction[] };

  /**
   * Sort transactions by date (newest first)
   */
  sortByDateDesc(transactions: Transaction[]): Transaction[];

  /**
   * Sort transactions by date (oldest first)
   */
  sortByDateAsc(transactions: Transaction[]): Transaction[];

  /**
   * Sort transactions by amount (highest first)
   */
  sortByAmountDesc(transactions: Transaction[]): Transaction[];

  /**
   * Sort transactions by amount (lowest first)
   */
  sortByAmountAsc(transactions: Transaction[]): Transaction[];

  /**
   * Search transactions by query
   */
  searchTransactions(transactions: Transaction[], query: string): Transaction[];

  /**
   * Get material breakdown with totals
   */
  getMaterialBreakdown(
    transactions: Transaction[]
  ): Array<{ material: string; totalIn: number; totalOut: number; balance: number }>;

  /**
   * Get recent transactions
   */
  getRecentTransactions(transactions: Transaction[], limit?: number): Transaction[];

  /**
   * Validate transaction data
   */
  validateTransaction(
    transaction: Partial<Transaction>
  ): { valid: boolean; errors: string[] };
}
