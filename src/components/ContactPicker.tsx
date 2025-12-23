import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';
import {
  getAllContacts,
  searchContacts,
  ContactInfo,
  showPermissionDeniedAlert,
} from '../services/contactService';
import { Button } from './Button';
import { ContactPickerProps } from '../types';

export const ContactPicker: React.FC<ContactPickerProps> = ({
  visible,
  onClose,
  onSelectContact,
}) => {
  const [contacts, setContacts] = useState<ContactInfo[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadContacts();
    } else {
      setSearchQuery('');
      setError(null);
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredContacts(searchContacts(contacts, searchQuery));
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchQuery, contacts]);

  const loadContacts = async () => {
    setLoading(true);
    setError(null);

    const result = await getAllContacts();

    if (result.success) {
      setContacts(result.contacts);
      setFilteredContacts(result.contacts);
    } else {
      setError(result.error || 'Failed to load contacts');
      if (result.error === 'Contacts permission denied') {
        showPermissionDeniedAlert();
      }
    }

    setLoading(false);
  };

  const handleSelectContact = (contact: ContactInfo) => {
    const phone =
      contact.phoneNumbers.length > 0 ? contact.phoneNumbers[0] : undefined;
    onSelectContact(contact.name, phone);
    onClose();
  };

  const renderContact = ({ item }: { item: ContactInfo }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleSelectContact(item)}
    >
      <View style={styles.contactAvatar}>
        <Text style={styles.contactAvatarText}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        {item.phoneNumbers.length > 0 && (
          <Text style={styles.contactPhone}>{item.phoneNumbers[0]}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.GREY} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={COLORS.GREY} />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No contacts found' : 'No contacts available'}
      </Text>
      <Text style={styles.emptyMessage}>
        {searchQuery
          ? 'Try a different search term'
          : 'Make sure you have granted contacts permission'}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={COLORS.WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Contact</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.GREY}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            placeholderTextColor={COLORS.GREY}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="words"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.GREY} />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <Text style={styles.loadingText}>Loading contacts...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color={COLORS.ERROR} />
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <Button
              title="Try Again"
              onPress={loadContacts}
              variant="primary"
              style={styles.retryButton}
            />
          </View>
        ) : (
          <FlatList
            data={filteredContacts}
            renderItem={renderContact}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={
              filteredContacts.length === 0 && styles.emptyListContainer
            }
            showsVerticalScrollIndicator={true}
          />
        )}

        {/* Contact Count */}
        {!loading && !error && filteredContacts.length > 0 && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {filteredContacts.length} contact
              {filteredContacts.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl + SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
  headerPlaceholder: {
    width: 28,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    margin: SPACING.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.TEXT_PRIMARY,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  loadingText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.GREY,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
  },
  errorTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.ERROR,
    marginTop: SPACING.md,
  },
  errorMessage: {
    fontSize: FONT_SIZE.md,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: FONT_SIZE.md * 1.5,
  },
  retryButton: {
    marginTop: SPACING.xl,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  contactAvatarText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  contactPhone: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxxl,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.lg,
  },
  emptyMessage: {
    fontSize: FONT_SIZE.md,
    color: COLORS.GREY,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  emptyListContainer: {
    flex: 1,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  footerText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});
