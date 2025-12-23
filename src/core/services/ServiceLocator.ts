/**
 * Service Locator
 * Central registry for service instances following Service Locator pattern
 */

import { ITransactionService } from './interfaces/ITransactionService';
import { IProjectService } from './interfaces/IProjectService';
import { IChartService } from './interfaces/IChartService';
import { IValidationService } from './interfaces/IValidationService';
import { IDateService } from './interfaces/IDateService';
import { IContactService } from './interfaces/IContactService';

import { transactionService } from './implementations/TransactionService';
import { projectService } from './implementations/ProjectService';
import { chartService } from './implementations/ChartService';
import { validationService } from './implementations/ValidationService';
import { dateService } from './implementations/DateService';
import { contactService } from './implementations/ContactService';

/**
 * Service Locator class for managing service instances
 */
class ServiceLocator {
  private static instance: ServiceLocator;

  private services: Map<string, any> = new Map();

  private constructor() {
    // Register default service implementations
    this.register('transactionService', transactionService);
    this.register('projectService', projectService);
    this.register('chartService', chartService);
    this.register('validationService', validationService);
    this.register('dateService', dateService);
    this.register('contactService', contactService);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ServiceLocator {
    if (!ServiceLocator.instance) {
      ServiceLocator.instance = new ServiceLocator();
    }
    return ServiceLocator.instance;
  }

  /**
   * Register a service instance
   */
  register<T>(serviceName: string, implementation: T): void {
    this.services.set(serviceName, implementation);
  }

  /**
   * Get a service instance
   */
  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found in ServiceLocator`);
    }
    return service as T;
  }

  /**
   * Check if service is registered
   */
  has(serviceName: string): boolean {
    return this.services.has(serviceName);
  }

  /**
   * Clear all services (useful for testing)
   */
  clear(): void {
    this.services.clear();
  }

  /**
   * Reset to default services
   */
  reset(): void {
    this.clear();
    this.register('transactionService', transactionService);
    this.register('projectService', projectService);
    this.register('chartService', chartService);
    this.register('validationService', validationService);
    this.register('dateService', dateService);
    this.register('contactService', contactService);
  }

  // Typed getters for convenience
  getTransactionService(): ITransactionService {
    return this.get<ITransactionService>('transactionService');
  }

  getProjectService(): IProjectService {
    return this.get<IProjectService>('projectService');
  }

  getChartService(): IChartService {
    return this.get<IChartService>('chartService');
  }

  getValidationService(): IValidationService {
    return this.get<IValidationService>('validationService');
  }

  getDateService(): IDateService {
    return this.get<IDateService>('dateService');
  }

  getContactService(): IContactService {
    return this.get<IContactService>('contactService');
  }
}

// Export singleton instance getter
export const getServiceLocator = (): ServiceLocator => ServiceLocator.getInstance();

// Export convenience functions for direct service access
export const getTransactionService = (): ITransactionService =>
  getServiceLocator().getTransactionService();

export const getProjectService = (): IProjectService =>
  getServiceLocator().getProjectService();

export const getChartService = (): IChartService =>
  getServiceLocator().getChartService();

export const getValidationService = (): IValidationService =>
  getServiceLocator().getValidationService();

export const getDateService = (): IDateService => getServiceLocator().getDateService();

export const getContactService = (): IContactService =>
  getServiceLocator().getContactService();
