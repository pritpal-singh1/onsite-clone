import { format, parseISO } from 'date-fns';
import { Transaction, SectionData, TransactionStatistics } from '../types';

/**
 * Format a number as currency (Indian Rupees)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Group transactions by month
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} Array of sections with title and data
 */
export const groupTransactionsByMonth = (transactions: Transaction[]): SectionData[] => {
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Group by month
  const grouped = {};
  sortedTransactions.forEach((transaction) => {
    const monthKey = format(parseISO(transaction.date), 'MMMM yyyy');
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(transaction);
  });

  // Convert to sections array
  return Object.entries(grouped).map(([month, data]) => ({
    title: month,
    data: data,
  }));
};

/**
 * Get all unique project names from transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} Array of unique project names
 */
export const getUniqueProjects = (transactions: Transaction[]): string[] => {
  const projects = new Set();
  transactions.forEach((transaction) => {
    if (transaction.project) {
      projects.add(transaction.project);
    }
  });
  return Array.from(projects).sort();
};

/**
 * Get all unique material types from transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {Array} Array of unique material types
 */
export const getUniqueMaterials = (transactions: Transaction[]): string[] => {
  const materials = new Set();
  transactions.forEach((transaction) => {
    if (transaction.material) {
      materials.add(transaction.material);
    }
  });
  return Array.from(materials).sort();
};

/**
 * Calculate statistics for a set of transactions
 * @param {Array} transactions - Array of transaction objects
 * @returns {Object} Statistics object
 */
export const calculateStatistics = (transactions: Transaction[]): TransactionStatistics => {
  const totalIn = transactions
    .filter((t) => t.type === 'in')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOut = transactions
    .filter((t) => t.type === 'out')
    .reduce((sum, t) => sum + t.amount, 0);

  const transactionCount = transactions.length;
  const incomingCount = transactions.filter((t) => t.type === 'in').length;
  const outgoingCount = transactions.filter((t) => t.type === 'out').length;

  return {
    totalIn,
    totalOut,
    balance: totalIn - totalOut,
    transactionCount,
    incomingCount,
    outgoingCount,
    averageTransaction: transactionCount > 0 
      ? (totalIn + totalOut) / transactionCount 
      : 0,
  };
};

/**
 * Filter transactions by date range
 * @param {Array} transactions - Array of transaction objects
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Filtered transactions
 */
export const filterTransactionsByDateRange = (transactions: Transaction[], startDate: Date, endDate: Date): Transaction[] => {
  return transactions.filter((transaction) => {
    const transactionDate = parseISO(transaction.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
};

/**
 * Search transactions by query string
 * @param {Array} transactions - Array of transaction objects
 * @param {string} query - Search query
 * @returns {Array} Filtered transactions
 */
export const searchTransactions = (transactions: Transaction[], query: string): Transaction[] => {
  const lowerQuery = query.toLowerCase();
  return transactions.filter((transaction) => {
    return (
      transaction.partyName.toLowerCase().includes(lowerQuery) ||
      transaction.material.toLowerCase().includes(lowerQuery) ||
      transaction.project.toLowerCase().includes(lowerQuery) ||
      transaction.amount.toString().includes(query)
    );
  });
};
