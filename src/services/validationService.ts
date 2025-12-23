import { Transaction, ValidationResult } from '../types';
import { VALIDATION } from '../constants';

/**
 * Service for validation operations
 */

// Re-export for backward compatibility
export type { ValidationResult };

/**
 * Validate amount field
 */
export const validateAmount = (amount: number | string): string | null => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return 'Amount must be a valid number';
  }

  if (numAmount <= VALIDATION.MIN_AMOUNT) {
    return 'Amount must be greater than 0';
  }

  if (numAmount > VALIDATION.MAX_AMOUNT) {
    return `Amount cannot exceed ${VALIDATION.MAX_AMOUNT.toLocaleString()}`;
  }

  return null;
};

/**
 * Validate party name field
 */
export const validatePartyName = (partyName: string): string | null => {
  const trimmed = partyName.trim();

  if (!trimmed) {
    return 'Party name is required';
  }

  if (trimmed.length > VALIDATION.MAX_PARTY_NAME_LENGTH) {
    return `Party name cannot exceed ${VALIDATION.MAX_PARTY_NAME_LENGTH} characters`;
  }

  return null;
};

/**
 * Validate project name field
 */
export const validateProjectName = (projectName: string): string | null => {
  const trimmed = projectName.trim();

  if (!trimmed) {
    return 'Project name is required';
  }

  if (trimmed.length > VALIDATION.MAX_PROJECT_NAME_LENGTH) {
    return `Project name cannot exceed ${VALIDATION.MAX_PROJECT_NAME_LENGTH} characters`;
  }

  return null;
};

/**
 * Validate material field
 */
export const validateMaterial = (material: string): string | null => {
  const trimmed = material.trim();

  if (!trimmed) {
    return 'Material is required';
  }

  return null;
};

/**
 * Validate transaction type
 */
export const validateTransactionType = (type: string): string | null => {
  if (type !== 'in' && type !== 'out') {
    return 'Transaction type must be either "Payment In" or "Payment Out"';
  }

  return null;
};

/**
 * Validate entire transaction form
 */
export const validateTransactionForm = (data: {
  amount: string | number;
  partyName: string;
  material: string;
  project: string;
  type: string;
}): ValidationResult => {
  const errors: { [field: string]: string } = {};

  const amountError = validateAmount(data.amount);
  if (amountError) errors.amount = amountError;

  const partyNameError = validatePartyName(data.partyName);
  if (partyNameError) errors.partyName = partyNameError;

  const materialError = validateMaterial(data.material);
  if (materialError) errors.material = materialError;

  const projectError = validateProjectName(data.project);
  if (projectError) errors.project = projectError;

  const typeError = validateTransactionType(data.type);
  if (typeError) errors.type = typeError;

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate transaction object
 */
export const validateTransaction = (
  transaction: Partial<Transaction>
): ValidationResult => {
  const errors: { [field: string]: string } = {};

  if (transaction.amount !== undefined) {
    const amountError = validateAmount(transaction.amount);
    if (amountError) errors.amount = amountError;
  }

  if (transaction.partyName !== undefined) {
    const partyNameError = validatePartyName(transaction.partyName);
    if (partyNameError) errors.partyName = partyNameError;
  }

  if (transaction.material !== undefined) {
    const materialError = validateMaterial(transaction.material);
    if (materialError) errors.material = materialError;
  }

  if (transaction.project !== undefined) {
    const projectError = validateProjectName(transaction.project);
    if (projectError) errors.project = projectError;
  }

  if (transaction.type !== undefined) {
    const typeError = validateTransactionType(transaction.type);
    if (typeError) errors.type = typeError;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitize input string
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString: string): number => {
  const cleaned = currencyString.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
};
