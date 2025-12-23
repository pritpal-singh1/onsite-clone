import { Transaction } from '../types';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

/**
 * Service for transaction-related business logic
 */

/**
 * Calculate totals from transactions
 */
export const calculateTotals = (
  transactions: Transaction[]
): { totalIncome: number; totalExpense: number; balance: number } => {
  const totalIncome = transactions
    .filter((t) => t.type === 'in')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'out')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return { totalIncome, totalExpense, balance };
};

/**
 * Filter transactions by project
 */
export const filterByProject = (
  transactions: Transaction[],
  projectName: string
): Transaction[] => {
  return transactions.filter(
    (t) => t.project.toLowerCase() === projectName.toLowerCase()
  );
};

/**
 * Filter transactions by material
 */
export const filterByMaterial = (
  transactions: Transaction[],
  materialName: string
): Transaction[] => {
  return transactions.filter(
    (t) => t.material.toLowerCase() === materialName.toLowerCase()
  );
};

/**
 * Filter transactions by type
 */
export const filterByType = (
  transactions: Transaction[],
  type: 'in' | 'out'
): Transaction[] => {
  return transactions.filter((t) => t.type === type);
};

/**
 * Filter transactions by date range
 */
export const filterByDateRange = (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] => {
  return transactions.filter((t) => {
    const transactionDate = parseISO(t.date);
    return isWithinInterval(transactionDate, { start: startDate, end: endDate });
  });
};

/**
 * Filter transactions by month
 */
export const filterByMonth = (
  transactions: Transaction[],
  year: number,
  month: number
): Transaction[] => {
  const start = startOfMonth(new Date(year, month, 1));
  const end = endOfMonth(new Date(year, month, 1));
  return filterByDateRange(transactions, start, end);
};

/**
 * Get unique project names
 */
export const getUniqueProjects = (transactions: Transaction[]): string[] => {
  const projects = transactions.map((t) => t.project);
  return Array.from(new Set(projects)).sort();
};

/**
 * Get unique material names
 */
export const getUniqueMaterials = (transactions: Transaction[]): string[] => {
  const materials = transactions.map((t) => t.material);
  return Array.from(new Set(materials)).sort();
};

/**
 * Get unique party names
 */
export const getUniqueParties = (transactions: Transaction[]): string[] => {
  const parties = transactions.map((t) => t.partyName);
  return Array.from(new Set(parties)).sort();
};

/**
 * Group transactions by month
 */
export const groupByMonth = (
  transactions: Transaction[]
): { [key: string]: Transaction[] } => {
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
};

/**
 * Group transactions by project
 */
export const groupByProject = (
  transactions: Transaction[]
): { [key: string]: Transaction[] } => {
  const grouped: { [key: string]: Transaction[] } = {};

  transactions.forEach((transaction) => {
    const projectName = transaction.project;

    if (!grouped[projectName]) {
      grouped[projectName] = [];
    }
    grouped[projectName].push(transaction);
  });

  return grouped;
};

/**
 * Group transactions by material
 */
export const groupByMaterial = (
  transactions: Transaction[]
): { [key: string]: Transaction[] } => {
  const grouped: { [key: string]: Transaction[] } = {};

  transactions.forEach((transaction) => {
    const materialName = transaction.material;

    if (!grouped[materialName]) {
      grouped[materialName] = [];
    }
    grouped[materialName].push(transaction);
  });

  return grouped;
};

/**
 * Sort transactions by date (newest first)
 */
export const sortByDateDesc = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => {
    return parseISO(b.date).getTime() - parseISO(a.date).getTime();
  });
};

/**
 * Sort transactions by date (oldest first)
 */
export const sortByDateAsc = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => {
    return parseISO(a.date).getTime() - parseISO(b.date).getTime();
  });
};

/**
 * Sort transactions by amount (highest first)
 */
export const sortByAmountDesc = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => b.amount - a.amount);
};

/**
 * Sort transactions by amount (lowest first)
 */
export const sortByAmountAsc = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => a.amount - b.amount);
};

/**
 * Search transactions by party name, material, or project
 */
export const searchTransactions = (
  transactions: Transaction[],
  query: string
): Transaction[] => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return transactions;

  return transactions.filter(
    (t) =>
      t.partyName.toLowerCase().includes(lowerQuery) ||
      t.material.toLowerCase().includes(lowerQuery) ||
      t.project.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Calculate material breakdown for a project
 */
export const getMaterialBreakdown = (
  transactions: Transaction[]
): Array<{ material: string; totalIn: number; totalOut: number; balance: number }> => {
  const materialMap = new Map<
    string,
    { totalIn: number; totalOut: number }
  >();

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
};

/**
 * Get recent transactions (limited count)
 */
export const getRecentTransactions = (
  transactions: Transaction[],
  limit: number = 10
): Transaction[] => {
  return sortByDateDesc(transactions).slice(0, limit);
};

/**
 * Validate transaction data
 */
export const validateTransaction = (
  transaction: Partial<Transaction>
): { valid: boolean; errors: string[] } => {
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
};
