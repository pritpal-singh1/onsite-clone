/**
 * Service Return Types
 * Type definitions for service method return values
 */

/**
 * Contact Information
 */
export interface ContactInfo {
  id: string;
  name: string;
  phoneNumbers: string[];
}

/**
 * Contact Service Result
 */
export interface ContactResult {
  success: boolean;
  contacts: ContactInfo[];
  error?: string;
}

/**
 * Validation Result
 */
export interface ValidationResult {
  valid: boolean;
  errors: { [field: string]: string };
}

/**
 * Chart Data Item for visualizations
 */
export interface ChartDataItem {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

/**
 * Material Breakdown Item for Excel reports
 */
export interface MaterialBreakdownItem {
  material: string;
  amount: number;
  percentage: number;
  count: number;
}

/**
 * Excel Export Result
 */
export interface ExcelExportResult {
  success: boolean;
  fileUri?: string;
  error?: string;
}

/**
 * Monthly Totals for reporting
 */
export interface MonthlyTotals {
  totalIn: number;
  totalOut: number;
  balance: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
}
