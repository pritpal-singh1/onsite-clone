/**
 * Validation Types
 * Type definitions for validation services
 */

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Form errors interface
 */
export interface FormErrors {
  amount?: string;
  partyName?: string;
  material?: string;
  project?: string;
  type?: string;
  name?: string;
  [key: string]: string | undefined;
}
