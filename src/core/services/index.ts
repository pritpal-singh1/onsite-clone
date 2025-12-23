/**
 * Core Services Barrel Export
 * Central export point for service interfaces and implementations
 */

// Export interfaces
export * from './interfaces';

// Export implementations (singleton instances)
export {
  transactionService,
  TransactionService,
} from './implementations/TransactionService';
export { projectService, ProjectService } from './implementations/ProjectService';
export { chartService, ChartService } from './implementations/ChartService';
export {
  validationService,
  ValidationService,
} from './implementations/ValidationService';
export { dateService, DateService } from './implementations/DateService';
export { contactService, ContactService } from './implementations/ContactService';
