import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProjects } from '../context/ProjectContext';
import { ProjectInput } from '../types/interfaces';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZE,
} from '../constants';
import {
  Card,
  Button,
  Input,
  Dropdown,
  SuccessModal,
  ErrorModal,
} from '../components';
import type { DropdownOption } from '../components';
import { validateProjectForm, formatCurrency } from '../services/projectService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'AddProject'>;

const AddProjectScreen: React.FC<Props> = ({ navigation }) => {
  const { addProject } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [projectFormData, setProjectFormData] = useState<ProjectInput>({
    name: '',
    location: '',
    client: '',
    startDate: '',
    endDate: '',
    budget: undefined,
    description: '',
    isDefault: false,
  });
  
  const [formValidationErrors, setFormValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  
  const [touchedFormFields, setTouchedFormFields] = useState<{
    [key: string]: boolean;
  }>({});

  // Generate date options for the last 2 years and next 2 years
  const dateDropdownOptions = useMemo((): DropdownOption[] => {
    const options: DropdownOption[] = [];
    const currentDate = new Date();
    const startYear = currentDate.getFullYear() - 2;
    const endYear = currentDate.getFullYear() + 2;

    for (let year = startYear; year <= endYear; year++) {
      for (let month = 1; month <= 12; month++) {
        const dateString = `${year}-${String(month).padStart(2, '0')}-01`;
        const displayDate = new Date(year, month - 1, 1);
        const formattedLabel = displayDate.toLocaleDateString('en-IN', {
          month: 'short',
          year: 'numeric',
        });
        options.push({
          label: formattedLabel,
          value: dateString,
        });
      }
    }

    return options.reverse(); // Most recent dates first
  }, []);

  // Calculate project status preview based on form dates
  const projectStatusPreview = useMemo(() => {
    if (!projectFormData.startDate && !projectFormData.endDate) return null;

    const currentDate = new Date();
    const projectStartDate = projectFormData.startDate
      ? new Date(projectFormData.startDate)
      : null;
    const projectEndDate = projectFormData.endDate
      ? new Date(projectFormData.endDate)
      : null;

    if (projectEndDate && projectEndDate < currentDate)
      return {
        status: 'completed',
        color: COLORS.TEXT_SECONDARY,
        icon: 'checkmark-circle' as const,
      };
    if (projectStartDate && projectStartDate > currentDate)
      return {
        status: 'upcoming',
        color: COLORS.PRIMARY,
        icon: 'time' as const,
      };
    if (projectStartDate && projectStartDate <= currentDate)
      return {
        status: 'ongoing',
        color: COLORS.SUCCESS,
        icon: 'play-circle' as const,
      };

    return null;
  }, [projectFormData.startDate, projectFormData.endDate]);

  const handleFormFieldChange = (field: keyof ProjectInput, value: any) => {
    setProjectFormData({ ...projectFormData, [field]: value });
    setTouchedFormFields({ ...touchedFormFields, [field]: true });

    // Real-time validation for touched fields
    if (touchedFormFields[field]) {
      const updatedFormData = { ...projectFormData, [field]: value };
      const validationErrors = validateProjectForm(updatedFormData);
      if (validationErrors[field]) {
        setFormValidationErrors({
          ...formValidationErrors,
          [field]: validationErrors[field],
        });
      } else {
        const { [field]: _, ...remainingErrors } = formValidationErrors;
        setFormValidationErrors(remainingErrors);
      }
    }
  };

  const handleAddProject = () => {
    const validationErrors = validateProjectForm(projectFormData);
    if (Object.keys(validationErrors).length > 0) {
      setFormValidationErrors(validationErrors);
      setErrorMessage(Object.values(validationErrors)[0]);
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);
    try {
      addProject(projectFormData);
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage('Failed to add project. Please try again.');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
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
        {/* Status Preview */}
        {projectStatusPreview && (
          <View
            style={[
              styles.statusPreviewCard,
              { backgroundColor: projectStatusPreview.color + '15' },
            ]}
          >
            <Ionicons
              name={projectStatusPreview.icon}
              size={20}
              color={projectStatusPreview.color}
            />
            <Text
              style={[
                styles.statusPreviewText,
                { color: projectStatusPreview.color },
              ]}
            >
              Project Status:{' '}
              {projectStatusPreview.status.charAt(0).toUpperCase() +
                projectStatusPreview.status.slice(1)}
            </Text>
          </View>
        )}

        {/* Basic Information Section */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Input
            label="Project Name"
            value={projectFormData.name}
            onChangeText={(text) => handleFormFieldChange('name', text)}
            onBlur={() =>
              setTouchedFormFields({ ...touchedFormFields, name: true })
            }
            placeholder="e.g., Downtown Plaza Construction"
            error={
              touchedFormFields.name ? formValidationErrors.name : undefined
            }
            required
          />

          <Input
            label="Location"
            value={projectFormData.location}
            onChangeText={(text) => handleFormFieldChange('location', text)}
            placeholder="e.g., Mumbai, Maharashtra"
            error={
              touchedFormFields.location
                ? formValidationErrors.location
                : undefined
            }
          />

          <Input
            label="Client"
            value={projectFormData.client}
            onChangeText={(text) => handleFormFieldChange('client', text)}
            placeholder="e.g., ABC Developers Pvt. Ltd."
            error={
              touchedFormFields.client ? formValidationErrors.client : undefined
            }
          />
        </Card>

        {/* Timeline Section */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Timeline</Text>

          <Dropdown
            label="Start Date"
            placeholder="Select start date"
            value={projectFormData.startDate}
            options={dateDropdownOptions}
            onSelect={(selectedDate) =>
              handleFormFieldChange('startDate', selectedDate)
            }
            error={
              touchedFormFields.startDate
                ? formValidationErrors.startDate
                : undefined
            }
            icon="calendar"
          />

          <Dropdown
            label="End Date"
            placeholder="Select end date"
            value={projectFormData.endDate}
            options={dateDropdownOptions}
            onSelect={(selectedDate) =>
              handleFormFieldChange('endDate', selectedDate)
            }
            error={
              touchedFormFields.endDate
                ? formValidationErrors.endDate
                : undefined
            }
            icon="calendar-outline"
          />
        </Card>

        {/* Financial Section */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Financial</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Budget</Text>
            <View style={styles.budgetInputContainer}>
              <View style={styles.currencySymbolContainer}>
                <Text style={styles.currencySymbolText}>₹</Text>
              </View>
              <RNTextInput
                style={styles.budgetInput}
                value={projectFormData.budget?.toString() || ''}
                onChangeText={(text) => {
                  const sanitizedValue = text.replace(/[^0-9.]/g, '');
                  handleFormFieldChange(
                    'budget',
                    sanitizedValue ? parseFloat(sanitizedValue) : undefined
                  );
                }}
                placeholder="0"
                keyboardType="decimal-pad"
                placeholderTextColor={COLORS.TEXT_SECONDARY}
              />
            </View>
            {projectFormData.budget && (
              <Text style={styles.budgetHelperText}>
                {formatCurrency(projectFormData.budget)}
              </Text>
            )}
            {formValidationErrors.budget && (
              <Text style={styles.errorText}>{formValidationErrors.budget}</Text>
            )}
          </View>
        </Card>

        {/* Additional Details Section */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Additional Details</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <RNTextInput
              style={styles.descriptionInput}
              value={projectFormData.description}
              onChangeText={(text) => handleFormFieldChange('description', text)}
              placeholder="Brief project description..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
              placeholderTextColor={COLORS.TEXT_SECONDARY}
            />
            <Text style={styles.characterCountText}>
              {projectFormData.description?.length || 0}/500
            </Text>
          </View>
        </Card>

        {/* Settings Section */}
        <Card style={styles.formCard}>
          <TouchableOpacity
            style={styles.defaultCheckboxContainer}
            onPress={() =>
              handleFormFieldChange('isDefault', !projectFormData.isDefault)
            }
          >
            <View
              style={[
                styles.checkboxSquare,
                projectFormData.isDefault && styles.checkboxSquareChecked,
              ]}
            >
              {projectFormData.isDefault && (
                <Ionicons name="checkmark" size={16} color={COLORS.WHITE} />
              )}
            </View>
            <View style={styles.checkboxLabelContainer}>
              <Text style={styles.checkboxLabel}>Set as default project</Text>
              <Text style={styles.checkboxHelperText}>
                This project will be auto-selected when adding transactions
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <View style={styles.buttonWrapper}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="secondary"
              fullWidth
            />
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              title={isSubmitting ? 'Adding...' : 'Add Project'}
              onPress={handleAddProject}
              loading={isSubmitting}
              disabled={isSubmitting}
              fullWidth
            />
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        message="Project added successfully!"
        onClose={handleSuccessClose}
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
  statusPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  statusPreviewText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  formCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.md,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xs,
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  currencySymbolContainer: {
    backgroundColor: COLORS.BACKGROUND,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRightWidth: 1,
    borderRightColor: COLORS.BORDER,
  },
  currencySymbolText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  budgetInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.TEXT_PRIMARY,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 48,
  },
  budgetHelperText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.xs,
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.ERROR,
    marginTop: SPACING.xs,
  },
  descriptionInput: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.TEXT_PRIMARY,
    minHeight: 100,
  },
  characterCountText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  defaultCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxSquare: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  checkboxSquareChecked: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  checkboxLabelContainer: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  checkboxHelperText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  buttonWrapper: {
    flex: 1,
  },
});

export default AddProjectScreen;
