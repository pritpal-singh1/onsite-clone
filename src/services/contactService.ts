import * as Contacts from 'expo-contacts';
import { Alert } from 'react-native';

/**
 * Service for contact-related operations using expo-contacts
 */

export interface ContactInfo {
  id: string;
  name: string;
  phoneNumbers: string[];
}

/**
 * Request contacts permission
 */
export const requestContactsPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting contacts permission:', error);
    return false;
  }
};

/**
 * Check if contacts permission is granted
 */
export const checkContactsPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Contacts.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error checking contacts permission:', error);
    return false;
  }
};

/**
 * Get all contacts from device
 */
export const getAllContacts = async (): Promise<{
  success: boolean;
  contacts: ContactInfo[];
  error?: string;
}> => {
  try {
    const hasPermission = await checkContactsPermission();
    if (!hasPermission) {
      const granted = await requestContactsPermission();
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
};

/**
 * Search contacts by name
 */
export const searchContacts = (
  contacts: ContactInfo[],
  query: string
): ContactInfo[] => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return contacts;

  return contacts.filter((contact) =>
    contact.name.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get contact phone number (first available)
 */
export const getContactPhone = (contact: ContactInfo): string | null => {
  if (contact.phoneNumbers.length === 0) return null;
  return contact.phoneNumbers[0];
};

/**
 * Format phone number for WhatsApp
 */
export const formatPhoneForWhatsApp = (phoneNumber: string): string => {
  return phoneNumber.replace(/[^\d+]/g, '');
};

/**
 * Show permission denied alert
 */
export const showPermissionDeniedAlert = (): void => {
  Alert.alert(
    'Permission Required',
    'Please enable contacts permission in your device settings to use this feature.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => {
          // User will need to manually open settings
          console.log('Open settings');
        }
      },
    ]
  );
};
