/**
 * Validation Messages Constants
 * Error messages for form validation
 */

export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_AMOUNT: 'Please enter a valid amount',
  AMOUNT_TOO_LARGE: 'Amount is too large',
  AMOUNT_TOO_SMALL: 'Amount must be greater than 0',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  TEXT_TOO_LONG: (max: number) => `Maximum ${max} characters allowed`,
  TEXT_TOO_SHORT: (min: number) => `Minimum ${min} characters required`,
  INVALID_DATE: 'Please enter a valid date',
  DATE_IN_PAST: 'Date cannot be in the past',
  DATE_IN_FUTURE: 'Date cannot be in the future',
  START_DATE_AFTER_END: 'Start date must be before end date',
} as const;
