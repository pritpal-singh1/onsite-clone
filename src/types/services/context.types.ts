/**
 * Context Types
 * Type definitions for React Context providers
 */

import {
  Transaction,
  TransactionInput,
  TransactionTotals,
} from '../domain/transaction.types';
import { Project, ProjectInput } from '../domain/project.types';

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
 * Material context interface
 */
export interface MaterialContextType {
  materials: string[];
  loading: boolean;
  error: string | null;
  addMaterial: (material: string) => Promise<void>;
  removeMaterial: (material: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}
