/**
 * Chart Service Interface
 * Defines contract for chart data generation
 */

import { Transaction } from '../../../types';

export interface ChartDataItem {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyComparisonData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface ProjectBreakdownData {
  project: string;
  totalIn: number;
  totalOut: number;
  balance: number;
  transactionCount: number;
}

export interface SummaryStatistics {
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
  avgTransactionAmount: number;
  largestIncome: number;
  largestExpense: number;
  uniqueProjects: number;
  uniqueMaterials: number;
}

export interface IChartService {
  /**
   * Generate pie chart data from transactions
   */
  generatePieChartData(
    transactions: Transaction[],
    type?: 'in' | 'out' | 'both'
  ): ChartDataItem[];

  /**
   * Generate bar chart data for monthly comparison
   */
  generateMonthlyComparisonData(
    transactions: Transaction[],
    monthCount?: number
  ): MonthlyComparisonData[];

  /**
   * Generate project breakdown data
   */
  generateProjectBreakdownData(transactions: Transaction[]): ProjectBreakdownData[];

  /**
   * Calculate summary statistics
   */
  calculateSummaryStats(transactions: Transaction[]): SummaryStatistics;
}
