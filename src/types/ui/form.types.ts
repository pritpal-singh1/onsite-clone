/**
 * Form UI Types
 * Type definitions for form components
 */

import { TransactionType } from '../domain/transaction.types';

/**
 * Form data for transaction input
 */
export interface TransactionFormData {
  amount: string;
  partyName: string;
  material: string;
  project: string;
  type: TransactionType;
}

/**
 * Form data for project input
 */
export interface ProjectFormData {
  name: string;
  location?: string;
  client?: string;
  startDate?: string;
  endDate?: string;
  budget?: string;
  description?: string;
  isDefault: boolean;
}

/**
 * Form field props
 */
export interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}
