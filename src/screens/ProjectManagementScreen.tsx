import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  TextInput as RNTextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProjects } from '../context/ProjectContext';
import { Project, ProjectInput } from '../types/interfaces';
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
  EmptyState,
  LoadingSpinner,
  Dropdown,
} from '../components';
import type { DropdownOption } from '../components';
import {
  validateProjectForm,
  searchProjects,
  sortProjects,
  formatCurrency,
  formatDate,
  getProjectStatus,
} from '../services/projectService';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Projects'>;

const ProjectManagementScreen: React.FC<Props> = ({ navigation }) => {
  const {
    projects,
    loading: isProjectsLoading,
    addProject,
    updateProject,
    deleteProject,
    setDefaultProject,
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
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

  const filteredProjectsList = sortProjects(
    searchProjects(projects, searchQuery)
  );

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

  const resetProjectForm = () => {
    setProjectFormData({
      name: '',
      location: '',
      client: '',
      startDate: '',
      endDate: '',
      budget: undefined,
      description: '',
      isDefault: false,
    });
    setFormValidationErrors({});
    setTouchedFormFields({});
  };

  const handleAddProject = () => {
    const validationErrors = validateProjectForm(projectFormData);
    if (Object.keys(validationErrors).length > 0) {
      setFormValidationErrors(validationErrors);
      return;
    }

    addProject(projectFormData);
    setIsAddModalVisible(false);
    resetProjectForm();
  };

  const handleEditProject = () => {
    if (!selectedProject) return;

    const validationErrors = validateProjectForm(projectFormData);
    if (Object.keys(validationErrors).length > 0) {
      setFormValidationErrors(validationErrors);
      return;
    }

    updateProject(selectedProject.id, projectFormData);
    setIsEditModalVisible(false);
    setSelectedProject(null);
    resetProjectForm();
  };

  const handleDeleteProject = (project: Project) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${project.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteProject(project.id),
        },
      ]
    );
  };

  const handleSetDefaultProject = (project: Project) => {
    setDefaultProject(project.id);
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setProjectFormData({
      name: project.name,
      location: project.location || '',
      client: project.client || '',
      startDate: project.startDate || '',
      endDate: project.endDate || '',
      budget: project.budget,
      description: project.description || '',
      isDefault: project.isDefault,
    });
    setTouchedFormFields({});
    setIsEditModalVisible(true);
  };

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

  const renderProjectForm = () => (
    <ScrollView
      style={styles.formScrollContainer}
      showsVerticalScrollIndicator={false}
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
      <View style={styles.formSection}>
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
      </View>

      {/* Timeline Section */}
      <View style={styles.formSection}>
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
      </View>

      {/* Financial Section */}
      <View style={styles.formSection}>
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
      </View>

      {/* Additional Details Section */}
      <View style={styles.formSection}>
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
      </View>

      {/* Settings Section */}
      <View style={styles.formSection}>
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
      </View>
    </ScrollView>
  );

  const renderProjectCard = ({ item }: { item: Project }) => {
    const projectStatus = getProjectStatus(item);
    const projectStatusColors = {
      upcoming: COLORS.PRIMARY,
      ongoing: COLORS.SUCCESS,
      completed: COLORS.TEXT_SECONDARY,
      unknown: COLORS.TEXT_SECONDARY,
    };

    return (
      <Card style={styles.projectCard}>
        <View style={styles.projectHeader}>
          <View style={styles.projectTitleRow}>
            <View
              style={[
                styles.projectIconContainer,
                item.isDefault && styles.projectIconContainerDefault,
              ]}
            >
              <Ionicons
                name={item.isDefault ? 'star' : 'briefcase'}
                size={20}
                color={item.isDefault ? COLORS.WARNING : COLORS.PRIMARY}
              />
            </View>
            <View style={styles.projectInfoContainer}>
              <Text style={styles.projectName}>{item.name}</Text>
              {item.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.projectActionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => openEditModal(item)}
            >
              <Ionicons name="pencil" size={18} color={COLORS.PRIMARY} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteProject(item)}
            >
              <Ionicons name="trash" size={18} color={COLORS.ERROR} />
            </TouchableOpacity>
          </View>
        </View>

        {(item.location ||
          item.client ||
          item.budget ||
          item.startDate ||
          item.endDate) && (
          <View style={styles.projectDetailsContainer}>
            {projectStatus !== 'unknown' && (
              <View style={styles.detailRow}>
                <Ionicons
                  name="time"
                  size={14}
                  color={projectStatusColors[projectStatus]}
                />
                <Text
                  style={[
                    styles.detailText,
                    {
                      color: projectStatusColors[projectStatus],
                      fontWeight: '600',
                    },
                  ]}
                >
                  {projectStatus.charAt(0).toUpperCase() +
                    projectStatus.slice(1)}
                </Text>
              </View>
            )}
            {item.location && (
              <View style={styles.detailRow}>
                <Ionicons
                  name="location"
                  size={14}
                  color={COLORS.TEXT_SECONDARY}
                />
                <Text style={styles.detailText}>{item.location}</Text>
              </View>
            )}
            {item.client && (
              <View style={styles.detailRow}>
                <Ionicons
                  name="person"
                  size={14}
                  color={COLORS.TEXT_SECONDARY}
                />
                <Text style={styles.detailText}>{item.client}</Text>
              </View>
            )}
            {item.budget && (
              <View style={styles.detailRow}>
                <Ionicons
                  name="cash"
                  size={14}
                  color={COLORS.TEXT_SECONDARY}
                />
                <Text style={styles.detailText}>
                  {formatCurrency(item.budget)}
                </Text>
              </View>
            )}
            {item.startDate && (
              <View style={styles.detailRow}>
                <Ionicons
                  name="calendar"
                  size={14}
                  color={COLORS.TEXT_SECONDARY}
                />
                <Text style={styles.detailText}>
                  {formatDate(item.startDate)} -{' '}
                  {item.endDate ? formatDate(item.endDate) : 'Ongoing'}
                </Text>
              </View>
            )}
            {item.description && (
              <View style={styles.detailRow}>
                <Ionicons
                  name="document-text"
                  size={14}
                  color={COLORS.TEXT_SECONDARY}
                />
                <Text style={styles.detailText} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>
            )}
          </View>
        )}

        {!item.isDefault && (
          <TouchableOpacity
            style={styles.setDefaultButton}
            onPress={() => handleSetDefaultProject(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="star-outline" size={18} color={COLORS.WARNING} />
            <Text style={styles.setDefaultButtonText}>Set as Default</Text>
          </TouchableOpacity>
        )}
      </Card>
    );
  };

  if (isProjectsLoading) {
    return <LoadingSpinner message="Loading projects..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Card variant="elevated" style={styles.headerCard}>
        <View style={styles.headerContentContainer}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="briefcase" size={24} color={COLORS.WHITE} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Project Management</Text>
            <Text style={styles.headerSubtitle}>
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddProject')}
          >
            <Ionicons name="add-circle" size={32} color={COLORS.PRIMARY} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Search Bar */}
      <Card style={styles.searchCard}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={COLORS.TEXT_SECONDARY} />
          <RNTextInput
            style={styles.searchInput}
            placeholder="Search projects..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.TEXT_SECONDARY}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.TEXT_SECONDARY}
              />
            </TouchableOpacity>
          )}
        </View>
      </Card>

      {/* Projects List */}
        <FlatList
          data={filteredProjectsList}
          renderItem={renderProjectCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.projectsListContent}
          ListEmptyComponent={
            <EmptyState
              icon="briefcase-outline"
              title="No projects yet"
              message={
                searchQuery
                  ? 'No projects found matching your search'
                  : 'Add your first project to get started'
              }
              actionLabel={searchQuery ? 'Clear Search' : 'Add Project'}
              onAction={() => {
                if (searchQuery) {
                  setSearchQuery('');
                } else {
                  navigation.navigate('AddProject');
                }
              }}
            />
          }
        />

        {/* Add Project Modal */}
        <Modal
          visible={isAddModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => {
            setIsAddModalVisible(false);
            resetProjectForm();
          }}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Project</Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsAddModalVisible(false);
                    resetProjectForm();
                  }}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={COLORS.TEXT_PRIMARY}
                  />
                </TouchableOpacity>
              </View>
              {renderProjectForm()}
              <View style={styles.modalFooter}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setIsAddModalVisible(false);
                    resetProjectForm();
                  }}
                  variant="secondary"
                />
                <Button title="Add Project" onPress={handleAddProject} />
              </View>
            </View>
          </SafeAreaView>
        </Modal>

        {/* Edit Project Modal */}
        <Modal
          visible={isEditModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => {
            setIsEditModalVisible(false);
            setSelectedProject(null);
            resetProjectForm();
          }}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Project</Text>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditModalVisible(false);
                    setSelectedProject(null);
                    resetProjectForm();
                  }}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={COLORS.TEXT_PRIMARY}
                  />
                </TouchableOpacity>
              </View>
              {renderProjectForm()}
              <View style={styles.modalFooter}>
                <Button
                  title="Cancel"
                  onPress={() => {
                    setIsEditModalVisible(false);
                    setSelectedProject(null);
                    resetProjectForm();
                  }}
                  variant="secondary"
                />
                <Button title="Save Changes" onPress={handleEditProject} />
              </View>
            </View>
          </SafeAreaView>
        </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },
  headerCard: {
    margin: SPACING.md,
  },
  headerContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  addButton: {
    padding: SPACING.xs,
  },
  searchCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.TEXT_PRIMARY,
    paddingVertical: SPACING.xs,
  },
  projectsListContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  projectCard: {
    marginBottom: SPACING.md,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  projectTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  projectIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  projectIconContainerDefault: {
    backgroundColor: COLORS.WARNING + '20',
  },
  projectInfoContainer: {
    flex: 1,
  },
  projectName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  defaultBadge: {
    backgroundColor: COLORS.WARNING,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  defaultBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.WHITE,
  },
  projectActionsContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  actionButton: {
    padding: SPACING.xs,
  },
  projectDetailsContainer: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.GREY_LIGHT,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    flex: 1,
  },
  setDefaultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.WARNING + '15',
    borderWidth: 1,
    borderColor: COLORS.WARNING,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.xs,
  },
  setDefaultButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.WARNING,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GREY_LIGHT,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  formScrollContainer: {
    flex: 1,
    padding: SPACING.md,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderTopColor: COLORS.GREY_LIGHT,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Status Preview Styles
  statusPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  statusPreviewText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  // Form Section Styles
  formSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Input Container Styles
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xs,
  },
  // Budget Input Styles
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.GREY_LIGHT,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.WHITE,
    overflow: 'hidden',
  },
  currencySymbolContainer: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRightWidth: 1,
    borderRightColor: COLORS.GREY_LIGHT,
  },
  currencySymbolText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.PRIMARY,
  },
  budgetInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.TEXT_PRIMARY,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  budgetHelperText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.ERROR,
    marginTop: SPACING.xs,
  },
  // Description Input Styles
  descriptionInput: {
    borderWidth: 1,
    borderColor: COLORS.GREY_LIGHT,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.TEXT_PRIMARY,
    backgroundColor: COLORS.WHITE,
    minHeight: 100,
  },
  characterCountText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  // Checkbox Styles
  defaultCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  checkboxSquare: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.GREY_LIGHT,
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
    color: COLORS.TEXT_PRIMARY,
  },
  checkboxHelperText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
});

export default ProjectManagementScreen;
