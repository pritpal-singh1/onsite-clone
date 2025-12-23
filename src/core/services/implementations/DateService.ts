/**
 * Date Service Implementation
 * Concrete implementation of IDateService
 */

import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { IDateService, MonthYearOption } from '../interfaces/IDateService';
import { DATE_FORMATS } from '../../../constants';

export class DateService implements IDateService {
  formatDateFull(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, DATE_FORMATS.FULL);
  }

  formatDateTime(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, DATE_FORMATS.DATE_TIME);
  }

  formatDateOnly(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, DATE_FORMATS.DATE_ONLY);
  }

  formatMonthYear(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, DATE_FORMATS.MONTH_YEAR);
  }

  getMonthKey(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, DATE_FORMATS.MONTH_KEY);
  }

  getDayName(date: Date | string): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, DATE_FORMATS.DAY);
  }

  getCurrentDateISO(): string {
    return new Date().toISOString();
  }

  getStartOfMonth(date: Date | string): Date {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return startOfMonth(dateObj);
  }

  getEndOfMonth(date: Date | string): Date {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return endOfMonth(dateObj);
  }

  parseISOString(dateString: string): Date {
    return parseISO(dateString);
  }

  getMonthYearOptions(count: number = 12): MonthYearOption[] {
    const options: MonthYearOption[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        label: this.formatMonthYear(date),
        value: this.getMonthKey(date),
      });
    }

    return options;
  }

  dateFromMonthKey(monthKey: string): Date {
    const [year, month] = monthKey.split('-').map(Number);
    return new Date(year, month - 1, 1);
  }

  isToday(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  }

  getRelativeTime(date: Date | string): string {
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

    return this.formatDateOnly(dateObj);
  }
}

// Export singleton instance
export const dateService = new DateService();
