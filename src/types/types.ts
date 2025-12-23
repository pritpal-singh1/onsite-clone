/**
 * Type definitions for the application
 * Following SOLID principles - Single Responsibility
 */

import { TransactionType } from './enums';
import { Transaction } from './interfaces';

/**
 * Union type for transaction type (backward compatibility)
 */
export type TransactionTypeUnion = 'in' | 'out';

/**
 * Material breakdown by type
 */
export type MaterialBreakdownData = {
  in: number;
  out: number;
  count: number;
};

/**
 * Material breakdown map
 */
export type MaterialBreakdown = Record<string, MaterialBreakdownData>;

/**
 * Expenses by material map
 */
export type ExpensesByMaterial = Record<string, number>;

/**
 * Section data for grouped lists
 */
export type SectionData = {
  title: string;
  data: Transaction[];
};
