/**
 * Export Service Types
 * Type definitions for data export operations
 */

/**
 * Excel export result interface
 */
export interface ExcelExportResult {
  success: boolean;
  fileUri?: string;
  error?: string;
}

/**
 * Export format type
 */
export type ExportFormat = 'excel' | 'csv' | 'pdf' | 'json';

/**
 * Export options
 */
export interface ExportOptions {
  format: ExportFormat;
  dateRange?: {
    start: string;
    end: string;
  };
  includeProjects?: boolean;
  includeMaterials?: boolean;
}
