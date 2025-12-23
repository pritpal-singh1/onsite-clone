import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../context/TransactionContext';
import { useProjects } from '../context/ProjectContext';
import { useMaterials } from '../context/MaterialContext';
import { Button, Input, Card, ContactPicker, AutocompleteInput, SuccessModal, ErrorModal } from '../components';
import { validateTransactionForm } from '../services/validationService';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootTabParamList, RootStackParamList } from '../../App';

type Props = CompositeScreenProps<
  BottomTabScreenProps<RootTabParamList, 'Add'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface FormErrors {
  amount?: string;
  partyName?: string;
  material?: string;
  project?: string;
  type?: string;
}

const AddTransactionScreen: React.FC<Props> = ({ navigation }) => {
  const { addTransaction } = useTransactions();
  const { projects, getDefaultProject } = useProjects();
  const { materials } = useMaterials();
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    amount: '',
    partyName: '',
    material: '',
    project: '',
    type: 'out' as 'in' | 'out',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Set default project on mount and when projects change
  useEffect(() => {
    const defaultProject = getDefaultProject();
    if (defaultProject) {
      setFormData((prev) => ({
        ...prev,
        project: defaultProject.name,
      }));
    }
  }, [projects, getDefaultProject]);

  const handleContactSelect = (name: string, phone?: string) => {
    setFormData({
      ...formData,
      partyName: name,
    });
    if (errors.partyName) {
      setErrors({ ...errors, partyName: undefined });
    }
  };

  const handleSubmit = () => {
    // Remove star emoji from project name if present
    const cleanProjectName = formData.project.replace(/^⭐\s*/, '').trim();

    // Validate form
    const validation = validateTransactionForm({
      ...formData,
      amount: formData.amount,
      project: cleanProjectName,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      setErrorMessage(Object.values(validation.errors)[0]);
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Add transaction
      addTransaction({
        amount: parseFloat(formData.amount),
        partyName: formData.partyName.trim(),
        material: formData.material,
        project: cleanProjectName,
        type: formData.type,
      });

      // Reset form but keep default project
      const defaultProject = getDefaultProject();
      setFormData({
        amount: '',
        partyName: '',
        material: '',
        project: defaultProject?.name || '',
        type: 'out',
      });
      setErrors({});

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage('Failed to add transaction. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
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
              <Ionicons name="add-circle" size={28} color={COLORS.WHITE} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Add Transaction</Text>
              <Text style={styles.headerSubtitle}>Record a new payment</Text>
            </View>
          </View>
        </Card>

        {/* Transaction Type Toggle */}
        <Card style={styles.typeCard}>
          <Text style={styles.sectionLabel}>Transaction Type</Text>
          <View style={styles.typeToggleContainer}>
            <TouchableOpacity
              style={[
                styles.typeToggle,
                formData.type === 'out' && styles.typeToggleActiveOut,
              ]}
              onPress={() => setFormData({ ...formData, type: 'out' })}
            >
              <Ionicons
                name="arrow-up-circle"
                size={24}
                color={formData.type === 'out' ? COLORS.WHITE : COLORS.ERROR}
              />
              <Text
                style={[
                  styles.typeToggleText,
                  formData.type === 'out' && styles.typeToggleTextActive,
                ]}
              >
                Payment Out
              </Text>
              <Text
                style={[
                  styles.typeToggleSubtext,
                  formData.type === 'out' && styles.typeToggleSubtextActive,
                ]}
              >
                You owe
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeToggle,
                formData.type === 'in' && styles.typeToggleActiveIn,
              ]}
              onPress={() => setFormData({ ...formData, type: 'in' })}
            >
              <Ionicons
                name="arrow-down-circle"
                size={24}
                color={formData.type === 'in' ? COLORS.WHITE : COLORS.SUCCESS}
              />
              <Text
                style={[
                  styles.typeToggleText,
                  formData.type === 'in' && styles.typeToggleTextActive,
                ]}
              >
                Payment In
              </Text>
              <Text
                style={[
                  styles.typeToggleSubtext,
                  formData.type === 'in' && styles.typeToggleSubtextActive,
                ]}
              >
                They owe you
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Form Card */}
        <Card style={styles.formCard}>
          {/* Amount Input */}
          <Input
            label="Amount"
            prefix="₹"
            value={formData.amount}
            onChangeText={(text) => {
              setFormData({ ...formData, amount: text });
              if (errors.amount) setErrors({ ...errors, amount: undefined });
            }}
            placeholder="Enter amount"
            keyboardType="decimal-pad"
            error={errors.amount}
            required
          />

          {/* Party Name with Contact Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Party Name <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.partyInputRow}>
              <TextInput
                style={[styles.partyInput, errors.partyName && styles.partyInputError]}
                value={formData.partyName}
                onChangeText={(text) => {
                  setFormData({ ...formData, partyName: text });
                  if (errors.partyName) setErrors({ ...errors, partyName: undefined });
                }}
                placeholder="Type party name"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
              />
              <TouchableOpacity
                style={styles.contactPickerButton}
                onPress={() => setShowContactPicker(true)}
              >
                <Ionicons name="person-add" size={20} color={COLORS.PRIMARY} />
                <Text style={styles.contactPickerText}>Contacts</Text>
              </TouchableOpacity>
            </View>
            {errors.partyName && (
              <Text style={styles.errorText}>{errors.partyName}</Text>
            )}
          </View>

          {/* Material Autocomplete */}
          <AutocompleteInput
            label="Material"
            value={formData.material}
            onChangeText={(text) => {
              setFormData({ ...formData, material: text });
              if (errors.material) setErrors({ ...errors, material: undefined });
            }}
            options={materials}
            icon="cube"
            placeholder="Select or type material"
            required
            error={errors.material}
            allowCustomValue={true}
          />

          {/* Project Autocomplete */}
          <AutocompleteInput
            label="Project"
            value={formData.project}
            onChangeText={(text) => {
              setFormData({ ...formData, project: text });
              if (errors.project) setErrors({ ...errors, project: undefined });
            }}
            options={projects.map(p => p.isDefault ? `⭐ ${p.name}` : p.name)}
            icon="briefcase"
            placeholder="Select or type project"
            required
            error={errors.project}
            allowCustomValue={true}
          />
          
          {projects.length === 0 && (
            <TouchableOpacity
              style={styles.addPartyPrompt}
              onPress={() => navigation.navigate('Projects')}
            >
              <Ionicons name="briefcase-outline" size={16} color={COLORS.PRIMARY} />
              <Text style={styles.addPartyText}>
                No projects available. Tap to add projects.
              </Text>
            </TouchableOpacity>
          )}

          {/* Submit Button */}
          <Button
            title={isSubmitting ? 'Adding...' : 'Add Transaction'}
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            variant={formData.type === 'in' ? 'success' : 'primary'}
            fullWidth
          />
        </Card>

        {/* Helpful Tip */}
        <Card variant="outlined" style={styles.tipCard}>
          <View style={styles.tipContent}>
            <Ionicons name="bulb" size={20} color={COLORS.WARNING} />
            <Text style={styles.tipText}>
              Select party from your contacts and manage projects in the Projects tab. Set a default project for quick access!
            </Text>
          </View>
        </Card>
      </ScrollView>

      {/* Contact Picker Modal */}
      <ContactPicker
        visible={showContactPicker}
        onClose={() => setShowContactPicker(false)}
        onSelectContact={handleContactSelect}
      />

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        message="Transaction added successfully!"
        onClose={() => setShowSuccessModal(false)}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
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
  typeCard: {
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.sm,
  },
  typeToggleContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  typeToggle: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.GREY_LIGHT,
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
  },
  typeToggleActiveOut: {
    borderColor: COLORS.ERROR,
    backgroundColor: COLORS.ERROR,
  },
  typeToggleActiveIn: {
    borderColor: COLORS.SUCCESS,
    backgroundColor: COLORS.SUCCESS,
  },
  typeToggleText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.xs,
  },
  typeToggleTextActive: {
    color: COLORS.WHITE,
  },
  typeToggleSubtext: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
  },
  typeToggleSubtextActive: {
    color: COLORS.WHITE,
    opacity: 0.9,
  },
  formCard: {
    marginBottom: SPACING.md,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
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
  },
  dropdownError: {
    borderColor: COLORS.ERROR,
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
  },
  dropdownPlaceholder: {
    color: COLORS.TEXT_SECONDARY,
  },
  partyInputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'stretch',
  },
  partyInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.GREY_LIGHT,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: COLORS.WHITE,
    minHeight: 48,
  },
  partyInputError: {
    borderColor: COLORS.ERROR,
    borderWidth: 2,
  },
  contactPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.PRIMARY + '10',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY + '30',
    minHeight: 48,
  },
  contactPickerText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.ERROR,
    marginTop: SPACING.xs,
  },
  partyDetailsCard: {
    marginTop: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
  },
  partyDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  partyDetailLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  partyDetailText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  defaultIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  defaultIndicatorText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.WARNING,
    fontWeight: '600',
  },
  addPartyPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
    backgroundColor: COLORS.PRIMARY + '10',
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
  },
  addPartyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.PRIMARY,
    fontWeight: '500',
    flex: 1,
  },
  tipCard: {
    backgroundColor: COLORS.WARNING + '10',
    borderColor: COLORS.WARNING + '30',
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  tipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    paddingBottom: SPACING.lg,
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
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  picker: {
    width: '100%',
    height: 200,
  },
  pickerItem: {
    height: 200,
    fontSize: FONT_SIZE.lg,
    color: COLORS.BLACK,
  },
  emptyPartyMessage: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  emptyPartyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.sm,
  },
  emptyPartyLink: {
    fontSize: FONT_SIZE.md,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
});

export default AddTransactionScreen;
