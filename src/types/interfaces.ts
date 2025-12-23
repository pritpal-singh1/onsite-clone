/**
 * Interface definitions for the application
 * Following SOLID principles - Interface Segregation
 */

import { TransactionTypeUnion } from './types';

/**
 * Base transaction interface
 */
export interface Transaction {
  id: string;
  amount: number;
  partyName: string;
  material: string;
  project: string;
  type: TransactionTypeUnion;
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
 * Transaction context interface
 */
export interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  addTransaction: (transaction: TransactionInput) => void;
  deleteTransaction: (id: string) => void;
  calculateTotals: () => TransactionTotals;
}

/**
 * Form data for transaction input
 */
export interface FormData {
  amount: string;
  partyName: string;
  material: string;
  project: string;
  type: TransactionTypeUnion;
}

/**
 * Pie chart data item interface
 */
export interface PieChartDataItem {
  name: string;
  amount: number;
  color: string;
  legendFontColor?: string;
  legendFontSize?: number;
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
 * Custom pie chart props interface
 */
export interface CustomPieChartProps {
  data: PieChartDataItem[];
  size?: number;
  onSlicePress?: (item: PieChartDataItem, index: number) => void;
}

/**
 * Project interface for managing construction projects
 */
export interface Project {
  id: string;
  name: string;
  location?: string;
  client?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  description?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Project input for creating/updating projects
 */
export interface ProjectInput extends Omit<Project, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Project context interface
 */
export interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  addProject: (project: ProjectInput) => void;
  updateProject: (id: string, project: Partial<ProjectInput>) => void;
  deleteProject: (id: string) => void;
  getDefaultProject: () => Project | null;
  setDefaultProject: (id: string) => void;
}

/**
 * Excel export result interface
 */
export interface ExcelExportResult {
  success: boolean;
  fileUri?: string;
  error?: string;
}

/**
 * Monthly totals for Excel export
 */
export interface MonthlyTotals {
  totalIn: number;
  totalOut: number;
  balance: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
}
