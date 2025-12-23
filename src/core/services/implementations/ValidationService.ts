/**
 * Validation Service Implementation
 * Concrete implementation of IValidationService
 */

import { Transaction } from '../../../types';
import { IValidationService, ValidationResult } from '../interfaces/IValidationService';
import { VALIDATION } from '../../../constants';

export class ValidationService implements IValidationService {
  validateAmount(amount: number | string): string | null {
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
  }

  validatePartyName(partyName: string): string | null {
    const trimmed = partyName.trim();

    if (!trimmed) {
      return 'Party name is required';
    }

    if (trimmed.length > VALIDATION.MAX_PARTY_NAME_LENGTH) {
      return `Party name cannot exceed ${VALIDATION.MAX_PARTY_NAME_LENGTH} characters`;
    }

    return null;
  }

  validateProjectName(projectName: string): string | null {
    const trimmed = projectName.trim();

    if (!trimmed) {
      return 'Project name is required';
    }

    if (trimmed.length > VALIDATION.MAX_PROJECT_NAME_LENGTH) {
      return `Project name cannot exceed ${VALIDATION.MAX_PROJECT_NAME_LENGTH} characters`;
    }

    return null;
  }

  validateMaterial(material: string): string | null {
    const trimmed = material.trim();

    if (!trimmed) {
      return 'Material is required';
    }

    return null;
  }

  validateTransactionType(type: string): string | null {
    if (type !== 'in' && type !== 'out') {
      return 'Transaction type must be either "Payment In" or "Payment Out"';
    }

    return null;
  }

  validateTransactionForm(data: {
    amount: string | number;
    partyName: string;
    material: string;
    project: string;
    type: string;
  }): ValidationResult {
    const errors: { [field: string]: string } = {};

    const amountError = this.validateAmount(data.amount);
    if (amountError) errors.amount = amountError;

    const partyNameError = this.validatePartyName(data.partyName);
    if (partyNameError) errors.partyName = partyNameError;

    const materialError = this.validateMaterial(data.material);
    if (materialError) errors.material = materialError;

    const projectError = this.validateProjectName(data.project);
    if (projectError) errors.project = projectError;

    const typeError = this.validateTransactionType(data.type);
    if (typeError) errors.type = typeError;

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  validateTransaction(transaction: Partial<Transaction>): ValidationResult {
    const errors: { [field: string]: string } = {};

    if (transaction.amount !== undefined) {
      const amountError = this.validateAmount(transaction.amount);
      if (amountError) errors.amount = amountError;
    }

    if (transaction.partyName !== undefined) {
      const partyNameError = this.validatePartyName(transaction.partyName);
      if (partyNameError) errors.partyName = partyNameError;
    }

    if (transaction.material !== undefined) {
      const materialError = this.validateMaterial(transaction.material);
      if (materialError) errors.material = materialError;
    }

    if (transaction.project !== undefined) {
      const projectError = this.validateProjectName(transaction.project);
      if (projectError) errors.project = projectError;
    }

    if (transaction.type !== undefined) {
      const typeError = this.validateTransactionType(transaction.type);
      if (typeError) errors.type = typeError;
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  sanitizeInput(input: string): string {
    return input.trim().replace(/\s+/g, ' ');
  }
}

// Export singleton instance
export const validationService = new ValidationService();
