/**
 * Material Management Modal Component
 * Allows users to add, remove, and reset materials
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMaterials } from '../context/MaterialContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants';
import { Button } from './Button';

interface MaterialManagementModalProps {
  visible: boolean;
  onClose: () => void;
}

export const MaterialManagementModal: React.FC<MaterialManagementModalProps> = ({
  visible,
  onClose,
}) => {
  const { materials, addMaterial, removeMaterial, resetToDefaults } = useMaterials();
  const [newMaterial, setNewMaterial] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddMaterial = async () => {
    const trimmed = newMaterial.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a material name');
      return;
    }

    setIsAdding(true);
    try {
      await addMaterial(trimmed);
      setNewMaterial('');
      Alert.alert('Success', `${trimmed} has been added`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add material');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMaterial = (material: string) => {
    Alert.alert(
      'Remove Material',
      `Are you sure you want to remove "${material}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMaterial(material);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove material');
            }
          },
        },
      ]
    );
  };

  const handleResetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'This will restore all default materials and remove any custom ones. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetToDefaults();
              Alert.alert('Success', 'Materials reset to defaults');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset materials');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Ionicons name="cube" size={24} color={COLORS.PRIMARY} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Manage Materials</Text>
                <Text style={styles.headerSubtitle}>{materials.length} materials</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>

          {/* Add Material Section */}
          <View style={styles.addSection}>
            <Text style={styles.sectionLabel}>Add New Material</Text>
            <View style={styles.addInputRow}>
              <TextInput
                style={styles.addInput}
                value={newMaterial}
                onChangeText={setNewMaterial}
                placeholder="Enter material name"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                onSubmitEditing={handleAddMaterial}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.addButton, isAdding && styles.addButtonDisabled]}
                onPress={handleAddMaterial}
                disabled={isAdding}
              >
                <Ionicons name="add-circle" size={24} color={COLORS.WHITE} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Materials List */}
          <View style={styles.listSection}>
            <View style={styles.listHeader}>
              <Text style={styles.sectionLabel}>Current Materials</Text>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetToDefaults}
              >
                <Ionicons name="refresh" size={16} color={COLORS.PRIMARY} />
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.materialsList}
              showsVerticalScrollIndicator={false}
            >
              {materials.map((material, index) => (
                <View key={index} style={styles.materialItem}>
                  <View style={styles.materialLeft}>
                    <View style={styles.materialNumber}>
                      <Text style={styles.materialNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.materialName}>{material}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveMaterial(material)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash-outline" size={20} color={COLORS.ERROR} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <Button
              title="Done"
              onPress={onClose}
              variant="primary"
              fullWidth
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '85%',
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GREY_LIGHT,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.PRIMARY + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  addSection: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GREY_LIGHT,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addInputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.GREY_LIGHT,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    minHeight: 48,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  listSection: {
    flex: 1,
    padding: SPACING.lg,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  resetButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  materialsList: {
    flex: 1,
  },
  materialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  materialLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  materialNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  materialNumberText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  materialName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  removeButton: {
    padding: SPACING.sm,
  },
  bottomActions: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.GREY_LIGHT,
  },
});
