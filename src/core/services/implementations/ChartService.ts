/**
 * Chart Service Implementation
 * Concrete implementation of IChartService
 */

import { Transaction } from '../../../types';
import {
  IChartService,
  ChartDataItem,
  MonthlyComparisonData,
  ProjectBreakdownData,
  SummaryStatistics,
} from '../interfaces/IChartService';
import { CHART_COLORS } from '../../../constants';

export class ChartService implements IChartService {
  generatePieChartData(
    transactions: Transaction[],
    type: 'in' | 'out' | 'both' = 'both'
  ): ChartDataItem[] {
    let filteredTransactions = transactions;

    if (type !== 'both') {
      filteredTransactions = transactions.filter((t) => t.type === type);
    }

    const materialGroups = this.groupByMaterial(filteredTransactions);
    const materialTotals: { [key: string]: number } = {};

    Object.entries(materialGroups).forEach(([material, transactions]) => {
      materialTotals[material] = transactions.reduce((sum, t) => {
        if (type === 'both') {
          return sum + (t.type === 'in' ? t.amount : -t.amount);
        }
        return sum + t.amount;
      }, 0);
    });

    const total = Object.values(materialTotals).reduce(
      (sum, amount) => sum + Math.abs(amount),
      0
    );

    if (total === 0) {
      return [];
    }

    const chartData: ChartDataItem[] = Object.entries(materialTotals)
      .map(([name, amount], index) => ({
        name,
        amount: Math.abs(amount),
        percentage: (Math.abs(amount) / total) * 100,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.amount - a.amount);

    return chartData;
  }

  generateMonthlyComparisonData(
    transactions: Transaction[],
    monthCount: number = 6
  ): MonthlyComparisonData[] {
    const now = new Date();
    const monthlyData: MonthlyComparisonData[] = [];

    for (let i = monthCount - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });

      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date);
        return (
          tDate.getFullYear() === date.getFullYear() &&
          tDate.getMonth() === date.getMonth()
        );
      });

      const income = monthTransactions
        .filter((t) => t.type === 'in')
        .reduce((sum, t) => sum + t.amount, 0);

      const expense = monthTransactions
        .filter((t) => t.type === 'out')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({
        month: monthName,
        income,
        expense,
        balance: income - expense,
      });
    }

    return monthlyData;
  }

  generateProjectBreakdownData(transactions: Transaction[]): ProjectBreakdownData[] {
    const projectMap = new Map<
      string,
      { totalIn: number; totalOut: number; count: number }
    >();

    transactions.forEach((t) => {
      const current = projectMap.get(t.project) || {
        totalIn: 0,
        totalOut: 0,
        count: 0,
      };

      if (t.type === 'in') {
        current.totalIn += t.amount;
      } else {
        current.totalOut += t.amount;
      }
      current.count++;

      projectMap.set(t.project, current);
    });

    return Array.from(projectMap.entries())
      .map(([project, { totalIn, totalOut, count }]) => ({
        project,
        totalIn,
        totalOut,
        balance: totalIn - totalOut,
        transactionCount: count,
      }))
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
  }

  calculateSummaryStats(transactions: Transaction[]): SummaryStatistics {
    if (transactions.length === 0) {
      return {
        totalTransactions: 0,
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        avgTransactionAmount: 0,
        largestIncome: 0,
        largestExpense: 0,
        uniqueProjects: 0,
        uniqueMaterials: 0,
      };
    }

    const totalIncome = transactions
      .filter((t) => t.type === 'in')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'out')
      .reduce((sum, t) => sum + t.amount, 0);

    const largestIncome = Math.max(
      0,
      ...transactions.filter((t) => t.type === 'in').map((t) => t.amount)
    );

    const largestExpense = Math.max(
      0,
      ...transactions.filter((t) => t.type === 'out').map((t) => t.amount)
    );

    const uniqueProjects = new Set(transactions.map((t) => t.project)).size;
    const uniqueMaterials = new Set(transactions.map((t) => t.material)).size;

    return {
      totalTransactions: transactions.length,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      avgTransactionAmount:
        transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length,
      largestIncome,
      largestExpense,
      uniqueProjects,
      uniqueMaterials,
    };
  }

  // Helper method for grouping by material
  private groupByMaterial(transactions: Transaction[]): { [key: string]: Transaction[] } {
    const grouped: { [key: string]: Transaction[] } = {};

    transactions.forEach((transaction) => {
      const materialName = transaction.material;

      if (!grouped[materialName]) {
        grouped[materialName] = [];
      }
      grouped[materialName].push(transaction);
    });

    return grouped;
  }
}

// Export singleton instance
export const chartService = new ChartService();
