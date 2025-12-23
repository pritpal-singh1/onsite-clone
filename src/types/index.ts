/**
 * Types Barrel Export
 * Centralized export for all application types
 */

// New organized exports
export * from './domain';
export * from './services';
export * from './ui';

// Legacy exports for backward compatibility
// Keep the old enums file export only (types.ts and interfaces.ts are now in domain/services/ui)
export { TransactionType as TransactionTypeEnum } from './enums';
export { StorageKeys as StorageKeysEnum } from './enums';
export { Routes as RoutesEnum } from './enums';

// Re-export for backward compatibility with different names to avoid conflicts
export type { TransactionTypeUnion } from './types';
export type { FormData } from './interfaces';