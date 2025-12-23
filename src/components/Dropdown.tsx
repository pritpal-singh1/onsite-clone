import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '../constants';
import { DropdownProps, DropdownOption } from '../types';

// Re-export DropdownOption for backward compatibility
export type { DropdownOption };

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onSelect,
  error,
  required = false,
  containerStyle,
  disabled = false,
  icon,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const selectedOption = options.find((option) => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleSelectOption = (selectedValue: string) => {
    onSelect(selectedValue);
    setIsDropdownVisible(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.dropdownButton,
          error && styles.dropdownButtonError,
          disabled && styles.dropdownButtonDisabled,
        ]}
        onPress={() => !disabled && setIsDropdownVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.dropdownContent}>
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={selectedOption ? COLORS.PRIMARY : COLORS.TEXT_SECONDARY}
            />
          )}
          <Text
            style={[
              styles.dropdownText,
              !selectedOption && styles.dropdownPlaceholder,
            ]}
            numberOfLines={1}
          >
            {displayText}
          </Text>
        </View>
        <Ionicons
          name="chevron-down"
          size={20}
          color={COLORS.TEXT_SECONDARY}
        />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {label || 'Select an option'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsDropdownVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === value && styles.optionItemSelected,
                  ]}
                  onPress={() => handleSelectOption(item.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item.value === value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={COLORS.PRIMARY}
                    />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={true}
              style={styles.optionsList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xs,
  },
  required: {
    color: COLORS.ERROR,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.GREY_LIGHT,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.WHITE,
    minHeight: 48,
  },
  dropdownButtonError: {
    borderColor: COLORS.ERROR,
    borderWidth: 2,
  },
  dropdownButtonDisabled: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    opacity: 0.6,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  dropdownText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '400',
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.ERROR,
    marginTop: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
    maxHeight: '70%',
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GREY_LIGHT,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  optionsList: {
    maxHeight: 400,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    minHeight: 48,
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
  separator: {
    height: 1,
    backgroundColor: COLORS.GREY_LIGHT,
  },
});
