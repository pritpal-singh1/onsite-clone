/**
 * ID Generator Utility
 * Centralized unique ID generation
 */

export class IdGenerator {
  /**
   * Generate unique ID using timestamp + random
   */
  static generate(prefix?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const id = `${timestamp}-${random}`;
    return prefix ? `${prefix}_${id}` : id;
  }

  /**
   * Generate transaction ID
   */
  static generateTransactionId(): string {
    return this.generate('txn');
  }

  /**
   * Generate project ID
   */
  static generateProjectId(): string {
    return this.generate('proj');
  }

  /**
   * Generate UUID v4 (simplified)
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

// Export convenience functions
export const generateId = IdGenerator.generate.bind(IdGenerator);
export const generateTransactionId = IdGenerator.generateTransactionId.bind(IdGenerator);
export const generateProjectId = IdGenerator.generateProjectId.bind(IdGenerator);
export const generateUUID = IdGenerator.generateUUID.bind(IdGenerator);
