/**
 * Contact Service Implementation
 * Concrete implementation of IContactService
 */

import * as Contacts from 'expo-contacts';
import {
  IContactService,
  ContactInfo,
  ContactResult,
} from '../interfaces/IContactService';

export class ContactService implements IContactService {
  async checkContactsPermission(): Promise<boolean> {
    try {
      const { status } = await Contacts.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking contacts permission:', error);
      return false;
    }
  }

  async requestContactsPermission(): Promise<boolean> {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      return false;
    }
  }

  async getAllContacts(): Promise<ContactResult> {
    try {
      const hasPermission = await this.checkContactsPermission();
      if (!hasPermission) {
        const granted = await this.requestContactsPermission();
        if (!granted) {
          return {
            success: false,
            contacts: [],
            error: 'Contacts permission denied',
          };
        }
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      const contacts: ContactInfo[] = data
        .map((contact) => {
          const firstName = contact.firstName || '';
          const lastName = contact.lastName || '';
          const name = `${firstName} ${lastName}`.trim() || 'Unknown';

          const phoneNumbers = contact.phoneNumbers
            ? contact.phoneNumbers.map((phone) => phone.number || '')
            : [];

          return {
            id: contact.id || `contact_${Date.now()}_${Math.random()}`,
            name,
            phoneNumbers,
          };
        })
        .filter((contact) => contact.name !== 'Unknown')
        .sort((a, b) => a.name.localeCompare(b.name));

      return { success: true, contacts };
    } catch (error) {
      console.error('Error getting contacts:', error);
      return {
        success: false,
        contacts: [],
        error: error instanceof Error ? error.message : 'Failed to get contacts',
      };
    }
  }

  searchContacts(contacts: ContactInfo[], query: string): ContactInfo[] {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return contacts;

    return contacts.filter((contact) =>
      contact.name.toLowerCase().includes(lowerQuery)
    );
  }

  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Format based on length
    if (cleaned.length === 10) {
      // Format as (XXX) XXX-XXXX
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      // Format as +1 (XXX) XXX-XXXX
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }

    // Return original if format is unknown
    return phoneNumber;
  }
}

// Export singleton instance
export const contactService = new ContactService();
