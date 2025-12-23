/**
 * Input Validator Utility
 * Centralized input validation logic
 */

import { VALIDATION, VALIDATION_MESSAGES } from '../../constants';

/**
 * Input Validator Class
 */
export class InputValidator {
  /**
   * Validate amount
   */
  static validateAmount(value: string): { valid: boolean; error?: string } {
    if (!value || value.trim() === '') {
      return { valid: false, error: VALIDATION_MESSAGES.REQUIRED_FIELD };
    }

    const amount = parseFloat(value);

    if (isNaN(amount)) {
      return { valid: false, error: VALIDATION_MESSAGES.INVALID_AMOUNT };
    }

    if (amount <= VALIDATION.MIN_AMOUNT) {
      return { valid: false, error: VALIDATION_MESSAGES.AMOUNT_TOO_SMALL };
    }

    if (amount > VALIDATION.MAX_AMOUNT) {
      return { valid: false, error: VALIDATION_MESSAGES.AMOUNT_TOO_LARGE };
    }

    return { valid: true };
  }

  /**
   * Validate required field
   */
  static validateRequired(value: string, fieldName?: string): { valid: boolean; error?: string } {
    if (!value || value.trim() === '') {
      return { valid: false, error: VALIDATION_MESSAGES.REQUIRED_FIELD };
    }
    return { valid: true };
  }

  /**
   * Validate text length
   */
  static validateLength(
    value: string,
    maxLength: number,
    minLength: number = 0
  ): { valid: boolean; error?: string } {
    if (value.length < minLength) {
      return { valid: false, error: VALIDATION_MESSAGES.TEXT_TOO_SHORT(minLength) };
    }

    if (value.length > maxLength) {
      return { valid: false, error: VALIDATION_MESSAGES.TEXT_TOO_LONG(maxLength) };
    }

    return { valid: true };
  }

  /**
   * Validate phone number
   */
  static validatePhone(value: string): { valid: boolean; error?: string } {
    if (!VALIDATION.PHONE_PATTERN.test(value)) {
      return { valid: false, error: VALIDATION_MESSAGES.INVALID_PHONE };
    }
    return { valid: true };
  }

  /**
   * Validate email
   */
  static validateEmail(value: string): { valid: boolean; error?: string } {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      return { valid: false, error: VALIDATION_MESSAGES.INVALID_EMAIL };
    }
    return { valid: true };
  }

  /**
   * Sanitize input
   */
  static sanitize(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
  }
}

// Export convenience functions
export const validateAmount = InputValidator.validateAmount.bind(InputValidator);
export const validateRequired = InputValidator.validateRequired.bind(InputValidator);
export const validateLength = InputValidator.validateLength.bind(InputValidator);
export const validatePhone = InputValidator.validatePhone.bind(InputValidator);
export const validateEmail = InputValidator.validateEmail.bind(InputValidator);
export const sanitizeInput = InputValidator.sanitize.bind(InputValidator);
