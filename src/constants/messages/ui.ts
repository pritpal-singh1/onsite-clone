/**
 * UI Messages Constants
 * User-facing messages and text
 */

export const UI_MESSAGES = {
  // Success messages
  TRANSACTION_ADDED: 'Transaction added successfully!',
  PROJECT_ADDED: 'Project created successfully!',
  PROJECT_UPDATED: 'Project updated successfully!',
  PROJECT_DELETED: 'Project deleted successfully!',
  MATERIAL_ADDED: 'Material added successfully!',
  MATERIAL_DELETED: 'Material removed successfully!',

  // Error messages
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  STORAGE_ERROR: 'Failed to save data. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',

  // Empty states
  NO_TRANSACTIONS: 'No transactions found',
  NO_PROJECTS: 'No projects available',
  NO_MATERIALS: 'No materials found',

  // Loading states
  LOADING: 'Loading...',
  SAVING: 'Saving...',
  DELETING: 'Deleting...',
  EXPORTING: 'Exporting...',
} as const;
