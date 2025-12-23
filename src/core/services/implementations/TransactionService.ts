/**
 * Transaction Service Implementation
 * Concrete implementation of ITransactionService
 */

import { Transaction } from '../../../types';
import { ITransactionService } from '../interfaces/ITransactionService';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export class TransactionService implements ITransactionService {
  calculateTotals(
    transactions: Transaction[]
  ): { totalIncome: number; totalExpense: number; balance: number } {
    const totalIncome = transactions
      .filter((t) => t.type === 'in')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'out')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    return { totalIncome, totalExpense, balance };
  }

  filterByProject(transactions: Transaction[], projectName: string): Transaction[] {
    return transactions.filter(
      (t) => t.project.toLowerCase() === projectName.toLowerCase()
    );
  }

  filterByMaterial(transactions: Transaction[], materialName: string): Transaction[] {
    return transactions.filter(
      (t) => t.material.toLowerCase() === materialName.toLowerCase()
    );
  }

  filterByType(transactions: Transaction[], type: 'in' | 'out'): Transaction[] {
    return transactions.filter((t) => t.type === type);
  }

  filterByDateRange(
    transactions: Transaction[],
    startDate: Date,
    endDate: Date
  ): Transaction[] {
    return transactions.filter((t) => {
      const transactionDate = parseISO(t.date);
      return isWithinInterval(transactionDate, { start: startDate, end: endDate });
    });
  }

  filterByMonth(transactions: Transaction[], year: number, month: number): Transaction[] {
    const start = startOfMonth(new Date(year, month, 1));
    const end = endOfMonth(new Date(year, month, 1));
    return this.filterByDateRange(transactions, start, end);
  }

  getUniqueProjects(transactions: Transaction[]): string[] {
    const projects = transactions.map((t) => t.project);
    return Array.from(new Set(projects)).sort();
  }

  getUniqueMaterials(transactions: Transaction[]): string[] {
    const materials = transactions.map((t) => t.material);
    return Array.from(new Set(materials)).sort();
  }

  getUniqueParties(transactions: Transaction[]): string[] {
    const parties = transactions.map((t) => t.partyName);
    return Array.from(new Set(parties)).sort();
  }

  groupByMonth(transactions: Transaction[]): { [key: string]: Transaction[] } {
    const grouped: { [key: string]: Transaction[] } = {};

    transactions.forEach((transaction) => {
      const date = parseISO(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(transaction);
    });

    return grouped;
  }

  groupByProject(transactions: Transaction[]): { [key: string]: Transaction[] } {
    const grouped: { [key: string]: Transaction[] } = {};

    transactions.forEach((transaction) => {
      const projectName = transaction.project;

      if (!grouped[projectName]) {
        grouped[projectName] = [];
      }
      grouped[projectName].push(transaction);
    });

    return grouped;
  }

  groupByMaterial(transactions: Transaction[]): { [key: string]: Transaction[] } {
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

  sortByDateDesc(transactions: Transaction[]): Transaction[] {
    return [...transactions].sort((a, b) => {
      return parseISO(b.date).getTime() - parseISO(a.date).getTime();
    });
  }

  sortByDateAsc(transactions: Transaction[]): Transaction[] {
    return [...transactions].sort((a, b) => {
      return parseISO(a.date).getTime() - parseISO(b.date).getTime();
    });
  }

  sortByAmountDesc(transactions: Transaction[]): Transaction[] {
    return [...transactions].sort((a, b) => b.amount - a.amount);
  }

  sortByAmountAsc(transactions: Transaction[]): Transaction[] {
    return [...transactions].sort((a, b) => a.amount - b.amount);
  }

  searchTransactions(transactions: Transaction[], query: string): Transaction[] {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return transactions;

    return transactions.filter(
      (t) =>
        t.partyName.toLowerCase().includes(lowerQuery) ||
        t.material.toLowerCase().includes(lowerQuery) ||
        t.project.toLowerCase().includes(lowerQuery)
    );
  }

  getMaterialBreakdown(
    transactions: Transaction[]
  ): Array<{ material: string; totalIn: number; totalOut: number; balance: number }> {
    const materialMap = new Map<string, { totalIn: number; totalOut: number }>();

    transactions.forEach((t) => {
      const current = materialMap.get(t.material) || { totalIn: 0, totalOut: 0 };
      if (t.type === 'in') {
        current.totalIn += t.amount;
      } else {
        current.totalOut += t.amount;
      }
      materialMap.set(t.material, current);
    });

    return Array.from(materialMap.entries())
      .map(([material, { totalIn, totalOut }]) => ({
        material,
        totalIn,
        totalOut,
        balance: totalIn - totalOut,
      }))
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
  }

  getRecentTransactions(transactions: Transaction[], limit: number = 10): Transaction[] {
    return this.sortByDateDesc(transactions).slice(0, limit);
  }

  validateTransaction(
    transaction: Partial<Transaction>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!transaction.amount || transaction.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (!transaction.partyName || transaction.partyName.trim() === '') {
      errors.push('Party name is required');
    }

    if (!transaction.material || transaction.material.trim() === '') {
      errors.push('Material is required');
    }

    if (!transaction.project || transaction.project.trim() === '') {
      errors.push('Project name is required');
    }

    if (!transaction.type || !['in', 'out'].includes(transaction.type)) {
      errors.push('Transaction type must be "in" or "out"');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const transactionService = new TransactionService();
