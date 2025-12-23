/**
 * Contact Service Interface
 * Defines contract for contact-related operations
 */

export interface ContactInfo {
  id: string;
  name: string;
  phoneNumbers: string[];
}

export interface ContactResult {
  success: boolean;
  contacts: ContactInfo[];
  error?: string;
}

export interface IContactService {
  /**
   * Check if contacts permission is granted
   */
  checkContactsPermission(): Promise<boolean>;

  /**
   * Request contacts permission
   */
  requestContactsPermission(): Promise<boolean>;

  /**
   * Get all contacts from device
   */
  getAllContacts(): Promise<ContactResult>;

  /**
   * Search contacts by query
   */
  searchContacts(contacts: ContactInfo[], query: string): ContactInfo[];

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phoneNumber: string): string;
}
