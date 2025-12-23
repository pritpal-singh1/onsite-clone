/**
 * Validation Service Interface
 * Defines contract for validation operations
 */

import { Transaction } from '../../../types';

export interface ValidationResult {
  valid: boolean;
  errors: { [field: string]: string };
}

export interface IValidationService {
  /**
   * Validate amount field
   */
  validateAmount(amount: number | string): string | null;

  /**
   * Validate party name field
   */
  validatePartyName(partyName: string): string | null;

  /**
   * Validate project name field
   */
  validateProjectName(projectName: string): string | null;

  /**
   * Validate material field
   */
  validateMaterial(material: string): string | null;

  /**
   * Validate transaction type
   */
  validateTransactionType(type: string): string | null;

  /**
   * Validate entire transaction form
   */
  validateTransactionForm(data: {
    amount: string | number;
    partyName: string;
    material: string;
    project: string;
    type: string;
  }): ValidationResult;

  /**
   * Validate transaction object
   */
  validateTransaction(transaction: Partial<Transaction>): ValidationResult;

  /**
   * Sanitize input string
   */
  sanitizeInput(input: string): string;
}
