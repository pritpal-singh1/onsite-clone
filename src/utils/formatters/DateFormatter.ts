/**
 * Date Formatter Utility
 * Centralized date formatting logic using date-fns
 */

import { format, parseISO, isValid as isValidDate, formatDistanceToNow } from 'date-fns';
import { DATE_FORMATS } from '../../constants';

/**
 * Date Formatter Class
 */
export class DateFormatter {
  /**
   * Format date with time
   */
  static formatDateTime(date: string | Date): string {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValidDate(dateObj)) return 'Invalid date';
      return format(dateObj, DATE_FORMATS.DATE_TIME);
    } catch (error) {
      console.error('Error formatting date time:', error);
      return 'Invalid date';
    }
  }

  /**
   * Format date only (no time)
   */
  static formatDateOnly(date: string | Date): string {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValidDate(dateObj)) return 'Invalid date';
      return format(dateObj, DATE_FORMATS.DATE_ONLY);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }

  /**
   * Format as month and year
   */
  static formatMonthYear(date: string | Date): string {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValidDate(dateObj)) return 'Invalid date';
      return format(dateObj, DATE_FORMATS.MONTH_YEAR);
    } catch (error) {
      console.error('Error formatting month year:', error);
      return 'Invalid date';
    }
  }

  /**
   * Format as month key for grouping
   */
  static formatMonthKey(date: string | Date): string {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValidDate(dateObj)) return '';
      return format(dateObj, DATE_FORMATS.MONTH_KEY);
    } catch (error) {
      console.error('Error formatting month key:', error);
      return '';
    }
  }

  /**
   * Format as relative time (e.g., "2 hours ago")
   */
  static formatRelative(date: string | Date): string {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValidDate(dateObj)) return 'Invalid date';
      return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting relative time:', error);
      return 'Invalid date';
    }
  }

  /**
   * Format as ISO string
   */
  static formatISO(date: Date): string {
    try {
      if (!isValidDate(date)) return '';
      return format(date, DATE_FORMATS.ISO);
    } catch (error) {
      console.error('Error formatting ISO:', error);
      return '';
    }
  }

  /**
   * Get current date as ISO string
   */
  static now(): string {
    return new Date().toISOString();
  }

  /**
   * Validate date string
   */
  static isValid(dateString: string): boolean {
    try {
      const date = parseISO(dateString);
      return isValidDate(date);
    } catch {
      return false;
    }
  }
}

// Export convenience functions
export const formatDateTime = DateFormatter.formatDateTime.bind(DateFormatter);
export const formatDateOnly = DateFormatter.formatDateOnly.bind(DateFormatter);
export const formatMonthYear = DateFormatter.formatMonthYear.bind(DateFormatter);
export const formatMonthKey = DateFormatter.formatMonthKey.bind(DateFormatter);
export const formatRelative = DateFormatter.formatRelative.bind(DateFormatter);
export const formatISO = DateFormatter.formatISO.bind(DateFormatter);
export const getCurrentDate = DateFormatter.now.bind(DateFormatter);
export const isValidDateString = DateFormatter.isValid.bind(DateFormatter);
