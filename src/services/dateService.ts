import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { DATE_FORMATS } from '../constants';

/**
 * Service for date-related operations
 */

/**
 * Format date to full format
 */
export const formatDateFull = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, DATE_FORMATS.FULL);
};

/**
 * Format date to date-time format
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, DATE_FORMATS.DATE_TIME);
};

/**
 * Format date to date only
 */
export const formatDateOnly = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, DATE_FORMATS.DATE_ONLY);
};

/**
 * Format date to month-year
 */
export const formatMonthYear = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, DATE_FORMATS.MONTH_YEAR);
};

/**
 * Get month key for grouping (YYYY-MM)
 */
export const getMonthKey = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, DATE_FORMATS.MONTH_KEY);
};

/**
 * Get day name
 */
export const getDayName = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, DATE_FORMATS.DAY);
};

/**
 * Get current date as ISO string
 */
export const getCurrentDateISO = (): string => {
  return new Date().toISOString();
};

/**
 * Get start of month
 */
export const getStartOfMonth = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return startOfMonth(dateObj);
};

/**
 * Get end of month
 */
export const getEndOfMonth = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return endOfMonth(dateObj);
};

/**
 * Parse ISO string to Date
 */
export const parseISOString = (dateString: string): Date => {
  return parseISO(dateString);
};

/**
 * Get list of month-year options for picker (last 12 months)
 */
export const getMonthYearOptions = (count: number = 12): Array<{ label: string; value: string }> => {
  const options: Array<{ label: string; value: string }> = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      label: formatMonthYear(date),
      value: getMonthKey(date),
    });
  }

  return options;
};

/**
 * Get date from month key (YYYY-MM)
 */
export const dateFromMonthKey = (monthKey: string): Date => {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month - 1, 1);
};

/**
 * Check if date is today
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Get relative time string
 */
export const getRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDateOnly(dateObj);
};
