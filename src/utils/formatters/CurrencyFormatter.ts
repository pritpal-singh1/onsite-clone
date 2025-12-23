/**
 * Currency Formatter Utility
 * Centralized currency formatting logic
 */

/**
 * Format number as currency (Indian Rupees)
 */
export class CurrencyFormatter {
  private static readonly CURRENCY_SYMBOL = '₹';
  private static readonly LOCALE = 'en-IN';

  /**
   * Format amount as currency string
   * @param amount - Amount to format
   * @param includeSymbol - Whether to include currency symbol (default: true)
   * @param decimals - Number of decimal places (default: 2)
   */
  static format(amount: number, includeSymbol: boolean = true, decimals: number = 2): string {
    const formatted = new Intl.NumberFormat(this.LOCALE, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);

    return includeSymbol ? `${this.CURRENCY_SYMBOL}${formatted}` : formatted;
  }

  /**
   * Format amount with abbreviation (K, L, Cr)
   * @param amount - Amount to format
   * @param includeSymbol - Whether to include currency symbol (default: true)
   */
  static formatCompact(amount: number, includeSymbol: boolean = true): string {
    let formatted: string;

    if (amount >= 10000000) {
      // Crores
      formatted = `${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      // Lakhs
      formatted = `${(amount / 100000).toFixed(2)} L`;
    } else if (amount >= 1000) {
      // Thousands
      formatted = `${(amount / 1000).toFixed(2)} K`;
    } else {
      formatted = amount.toFixed(2);
    }

    return includeSymbol ? `${this.CURRENCY_SYMBOL}${formatted}` : formatted;
  }

  /**
   * Parse currency string to number
   * @param currencyString - Currency string to parse
   */
  static parse(currencyString: string): number {
    // Remove currency symbol and commas
    const cleaned = currencyString.replace(/[₹,\s]/g, '');
    return parseFloat(cleaned) || 0;
  }

  /**
   * Validate currency string format
   * @param value - String to validate
   */
  static isValid(value: string): boolean {
    // Allow digits, decimal point, and optional currency symbol
    const regex = /^₹?\s*\d+(\.\d{0,2})?$/;
    return regex.test(value.trim());
  }
}

// Export convenience functions
export const formatCurrency = CurrencyFormatter.format.bind(CurrencyFormatter);
export const formatCurrencyCompact = CurrencyFormatter.formatCompact.bind(CurrencyFormatter);
export const parseCurrency = CurrencyFormatter.parse.bind(CurrencyFormatter);
export const isValidCurrency = CurrencyFormatter.isValid.bind(CurrencyFormatter);
