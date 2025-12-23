import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants';
import { AutocompleteInputProps } from '../types';

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  value,
  onChangeText,
  options,
  placeholder,
  icon = 'list',
  required = false,
  error,
  allowCustomValue = true,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Filter options based on search text
  const filteredOptions = useMemo(() => {
    if (!searchText.trim()) {
      return options;
    }
    return options.filter((option) =>
      option.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, options]);

  const handleSelect = (selectedValue: string) => {
    onChangeText(selectedValue);
    setSearchText('');
    setShowDropdown(false);
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    if (allowCustomValue) {
      onChangeText(text);
    }
  };

  const handleDropdownOpen = () => {
    setSearchText(value);
    setShowDropdown(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>

      <TouchableOpacity
        style={[styles.inputButton, error && styles.inputError]}
        onPress={handleDropdownOpen}
      >
        <View style={styles.inputContent}>
          <Ionicons name={icon} size={20} color={COLORS.PRIMARY} />
          <Text
            style={[
              styles.inputText,
              !value && styles.inputPlaceholder,
            ]}
          >
            {value || placeholder || `Select ${label.toLowerCase()}`}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={COLORS.TEXT_SECONDARY} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={showDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.dropdownContainer}>
                {/* Header */}
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownTitle}>{label}</Text>
                  <TouchableOpacity
                    onPress={() => setShowDropdown(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color={COLORS.TEXT_SECONDARY} />
                  </TouchableOpacity>
                </View>

                {/* Search Input */}
                <View style={styles.searchContainer}>
                  <Ionicons
                    name="search"
                    size={20}
                    color={COLORS.TEXT_SECONDARY}
                    style={styles.searchIcon}
                  />
                  <TextInput
                    style={styles.searchInput}
                    value={searchText}
                    onChangeText={handleSearchChange}
                    placeholder={`Search or ${allowCustomValue ? 'type new' : 'filter'} ${label.toLowerCase()}...`}
                    placeholderTextColor={COLORS.TEXT_SECONDARY}
                    autoFocus
                  />
                  {searchText.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setSearchText('')}
                      style={styles.clearButton}
                    >
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={COLORS.TEXT_SECONDARY}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Options List */}
                <FlatList
                  data={filteredOptions}
                  keyExtractor={(item, index) => `${item}-${index}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.optionItem,
                        item === value && styles.optionItemSelected,
                      ]}
                      onPress={() => handleSelect(item)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          item === value && styles.optionTextSelected,
                        ]}
                      >
                        {item}
                      </Text>
                      {item === value && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={COLORS.PRIMARY}
                        />
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Ionicons
                        name="search-outline"
                        size={48}
                        color={COLORS.TEXT_SECONDARY}
                      />
                      <Text style={styles.emptyText}>No matches found</Text>
                      {allowCustomValue && searchText.trim() && (
                        <TouchableOpacity
                          style={styles.addButton}
                          onPress={() => handleSelect(searchText.trim())}
                        >
                          <Ionicons
                            name="add-circle"
                            size={20}
                            color={COLORS.PRIMARY}
                          />
                          <Text style={styles.addButtonText}>
                            Use "{searchText.trim()}"
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  }
                  style={styles.optionsList}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.ERROR,
  },
  inputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 48,
  },
  inputError: {
    borderColor: COLORS.ERROR,
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  inputText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  inputPlaceholder: {
    color: COLORS.TEXT_SECONDARY,
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.ERROR,
    marginTop: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  dropdownContainer: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  dropdownTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    margin: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  searchIcon: {
    marginRight: SPACING.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: SPACING.sm,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  optionItemSelected: {
    backgroundColor: COLORS.PRIMARY + '10',
  },
  optionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  optionTextSelected: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.PRIMARY + '10',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  addButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
});
