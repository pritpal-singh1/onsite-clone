/**
 * Project Domain Types
 * All project-related types and interfaces
 */

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
 * Project status type
 */
export type ProjectStatus = 'Active' | 'Completed' | 'On Hold' | 'Cancelled';

/**
 * Project statistics
 */
export interface ProjectStatistics {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  percentageUsed: number;
  transactionCount: number;
}
