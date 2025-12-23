/**
 * Validation Rules Constants
 * Validation constraints for forms and inputs
 */

export const VALIDATION = {
  // Amount validation
  MIN_AMOUNT: 0,
  MAX_AMOUNT: 999999999,

  // Text length validation
  MAX_PARTY_NAME_LENGTH: 100,
  MAX_PROJECT_NAME_LENGTH: 100,
  MAX_MATERIAL_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 500,

  // UI limits
  MAX_CONTACT_DISPLAY: 10,
  MAX_RECENT_TRANSACTIONS: 5,

  // Regex patterns
  AMOUNT_PATTERN: /^\d+(\.\d{0,2})?$/,
  PHONE_PATTERN: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
} as const;
