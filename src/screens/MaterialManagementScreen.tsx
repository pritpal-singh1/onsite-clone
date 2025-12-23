/**
 * Material Management Screen
 * Full-screen interface for managing material types
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMaterials } from '../context/MaterialContext';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants';
import { Card, Button, SuccessModal, ErrorModal } from '../components';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'MaterialManagement'>;

const MaterialManagementScreen: React.FC<Props> = ({ navigation }) => {
  const { materials, addMaterial, removeMaterial, resetToDefaults } = useMaterials();
  const [newMaterial, setNewMaterial] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAddMaterial = async () => {
    const trimmed = newMaterial.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a material name');
      setShowErrorModal(true);
      return;
    }

    setIsAdding(true);
    try {
      await addMaterial(trimmed);
      setNewMaterial('');
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to add material');
      setShowErrorModal(true);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMaterial = (material: string) => {
    Alert.alert(
      'Remove Material',
      `Are you sure you want to remove "${material}"?\n\nThis won't affect existing transactions that use this material.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeMaterial(material);
            } catch (error) {
              setErrorMessage('Failed to remove material');
              setShowErrorModal(true);
            }
          },
        },
      ]
    );
  };

  const handleResetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'This will restore all 20 default construction materials and remove any custom ones you added.\n\nExisting transactions will not be affected.\n\nContinue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetToDefaults();
              Alert.alert('Success', 'Materials have been reset to defaults');
            } catch (error) {
              setErrorMessage('Failed to reset materials');
              setShowErrorModal(true);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Card */}
        <Card variant="elevated" style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="cube" size={28} color={COLORS.WHITE} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Material Types</Text>
              <Text style={styles.headerSubtitle}>
                {materials.length} materials available
              </Text>
            </View>
          </View>
        </Card>

        {/* Add Material Section */}
        <Card style={styles.addCard}>
          <Text style={styles.sectionTitle}>Add New Material</Text>
          <Text style={styles.sectionDescription}>
            Add custom materials specific to your construction needs
          </Text>
          <View style={styles.addInputRow}>
            <TextInput
              style={styles.addInput}
              value={newMaterial}
              onChangeText={setNewMaterial}
              placeholder="e.g., Marble, Granite, PVC Pipes..."
              placeholderTextColor={COLORS.TEXT_SECONDARY}
              onSubmitEditing={handleAddMaterial}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.addButton, isAdding && styles.addButtonDisabled]}
              onPress={handleAddMaterial}
              disabled={isAdding}
            >
              <Ionicons name="add-circle" size={28} color={COLORS.WHITE} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Materials List */}
        <Card style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>All Materials</Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetToDefaults}
            >
              <Ionicons name="refresh" size={18} color={COLORS.PRIMARY} />
              <Text style={styles.resetButtonText}>Reset to Defaults</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.materialsGrid}>
            {materials.map((material, index) => (
              <View key={index} style={styles.materialChip}>
                <View style={styles.materialChipContent}>
                  <View style={styles.materialNumber}>
                    <Text style={styles.materialNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.materialName} numberOfLines={1}>
                    {material}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveMaterial(material)}
                  style={styles.deleteButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={20} color={COLORS.ERROR} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </Card>

        {/* Info Card */}
        <Card variant="outlined" style={styles.infoCard}>
          <View style={styles.infoContent}>
            <Ionicons name="information-circle" size={24} color={COLORS.PRIMARY} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Good to Know</Text>
              <Text style={styles.infoText}>
                • Materials are used when adding transactions{'\n'}
                • Deleting a material won't affect existing transactions{'\n'}
                • You can add unlimited custom materials{'\n'}
                • Reset anytime to restore default materials
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Material Added!"
        message={`${newMaterial} is now available in your materials list`}
        onClose={() => setShowSuccessModal(false)}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        title="Error"
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  headerCard: {
    marginBottom: SPACING.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  addCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.md,
    lineHeight: 20,
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
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: COLORS.WHITE,
    minHeight: 52,
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  listCard: {
    marginBottom: SPACING.md,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.PRIMARY + '10',
  },
  resetButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  materialsGrid: {
    gap: SPACING.sm,
  },
  materialChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.GREY_LIGHT,
  },
  materialChipContent: {
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
  deleteButton: {
    padding: SPACING.xs,
  },
  infoCard: {
    backgroundColor: COLORS.PRIMARY + '08',
    borderColor: COLORS.PRIMARY + '30',
  },
  infoContent: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    lineHeight: 20,
  },
});

export default MaterialManagementScreen;
