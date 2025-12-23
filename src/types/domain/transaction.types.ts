/**
 * Transaction Domain Types
 * All transaction-related types and interfaces
 */

/**
 * Transaction type union
 */
export type TransactionType = 'in' | 'out';

/**
 * Base transaction interface
 */
export interface Transaction {
  id: string;
  amount: number;
  partyName: string;
  material: string;
  project: string;
  type: TransactionType;
  date: string;
}

/**
 * Transaction input for creating new transactions
 */
export interface TransactionInput extends Omit<Transaction, 'id' | 'date'> {
  date?: string;
}

/**
 * Transaction totals calculation result
 */
export interface TransactionTotals {
  totalBalance: number;
  totalReceivable: number;
  totalPayable: number;
}

/**
 * Transaction statistics interface
 */
export interface TransactionStatistics {
  totalIn: number;
  totalOut: number;
  balance: number;
  transactionCount: number;
  incomingCount: number;
  outgoingCount: number;
  averageTransaction: number;
}

/**
 * Material breakdown by type
 */
export interface MaterialBreakdownData {
  in: number;
  out: number;
  count: number;
}

/**
 * Material breakdown map
 */
export type MaterialBreakdown = Record<string, MaterialBreakdownData>;

/**
 * Expenses by material map
 */
export type ExpensesByMaterial = Record<string, number>;

/**
 * Section data for grouped transaction lists
 */
export interface SectionData {
  title: string;
  data: Transaction[];
}

/**
 * Monthly totals for reporting
 */
export interface MonthlyTotals {
  totalIn: number;
  totalOut: number;
  balance: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
}
