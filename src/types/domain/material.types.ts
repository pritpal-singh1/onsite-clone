/**
 * Material Domain Types
 * All material-related types and interfaces
 */

/**
 * Material type
 */
export type Material = string;

/**
 * Material with usage statistics
 */
export interface MaterialWithStats {
  name: string;
  totalAmount: number;
  transactionCount: number;
  percentage: number;
}
