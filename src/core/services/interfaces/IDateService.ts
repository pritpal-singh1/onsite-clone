/**
 * Date Service Interface
 * Defines contract for date-related operations
 */

export interface MonthYearOption {
  label: string;
  value: string;
}

export interface IDateService {
  /**
   * Format date to full format
   */
  formatDateFull(date: Date | string): string;

  /**
   * Format date to date-time format
   */
  formatDateTime(date: Date | string): string;

  /**
   * Format date to date only
   */
  formatDateOnly(date: Date | string): string;

  /**
   * Format date to month-year
   */
  formatMonthYear(date: Date | string): string;

  /**
   * Get month key for grouping (YYYY-MM)
   */
  getMonthKey(date: Date | string): string;

  /**
   * Get day name
   */
  getDayName(date: Date | string): string;

  /**
   * Get current date as ISO string
   */
  getCurrentDateISO(): string;

  /**
   * Get start of month
   */
  getStartOfMonth(date: Date | string): Date;

  /**
   * Get end of month
   */
  getEndOfMonth(date: Date | string): Date;

  /**
   * Parse ISO string to Date
   */
  parseISOString(dateString: string): Date;

  /**
   * Get list of month-year options for picker
   */
  getMonthYearOptions(count?: number): MonthYearOption[];

  /**
   * Get date from month key (YYYY-MM)
   */
  dateFromMonthKey(monthKey: string): Date;

  /**
   * Check if date is today
   */
  isToday(date: Date | string): boolean;

  /**
   * Get relative time string
   */
  getRelativeTime(date: Date | string): string;
}
