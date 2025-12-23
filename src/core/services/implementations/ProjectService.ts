/**
 * Project Service Implementation
 * Concrete implementation of IProjectService
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Project, ProjectInput } from '../../../types';
import { IProjectService } from '../interfaces/IProjectService';

const STORAGE_KEY = '@projects';

export class ProjectService implements IProjectService {
  generateProjectId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `project-${timestamp}-${random}`;
  }

  async loadProjects(): Promise<Project[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error('Error loading projects:', error);
      return [];
    }
  }

  async saveProjects(projects: Project[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error saving projects:', error);
      throw error;
    }
  }

  createProject(projectInput: ProjectInput): Project {
    const now = new Date().toISOString();
    return {
      ...projectInput,
      id: this.generateProjectId(),
      createdAt: now,
      updatedAt: now,
    };
  }

  updateProjectData(
    existingProject: Project,
    updates: Partial<ProjectInput>
  ): Project {
    return {
      ...existingProject,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
  }

  validateProjectName(name: string): string | null {
    if (!name.trim()) {
      return 'Project name is required';
    }
    if (name.length > 100) {
      return 'Project name must be less than 100 characters';
    }
    return null;
  }

  validateBudget(budget: number): string | null {
    if (budget < 0) {
      return 'Budget cannot be negative';
    }
    if (budget > 999999999) {
      return 'Budget is too large';
    }
    return null;
  }

  validateProjectForm(projectInput: ProjectInput): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    const nameError = this.validateProjectName(projectInput.name);
    if (nameError) errors.name = nameError;

    if (projectInput.budget !== undefined && projectInput.budget !== null) {
      const budgetError = this.validateBudget(projectInput.budget);
      if (budgetError) errors.budget = budgetError;
    }

    if (projectInput.startDate && projectInput.endDate) {
      const start = new Date(projectInput.startDate);
      const end = new Date(projectInput.endDate);
      if (end < start) {
        errors.endDate = 'End date must be after start date';
      }
    }

    return errors;
  }

  searchProjects(projects: Project[], query: string): Project[] {
    const lowerQuery = query.toLowerCase().trim();
    if (!lowerQuery) return projects;

    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(lowerQuery) ||
        (project.location && project.location.toLowerCase().includes(lowerQuery)) ||
        (project.client && project.client.toLowerCase().includes(lowerQuery))
    );
  }

  sortProjects(projects: Project[]): Project[] {
    return [...projects].sort((a, b) => {
      // Default project comes first
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      // Then sort alphabetically
      return a.name.localeCompare(b.name);
    });
  }

  getProjectStatus(
    project: Project
  ): 'upcoming' | 'ongoing' | 'completed' | 'unknown' {
    if (!project.startDate && !project.endDate) return 'unknown';

    const now = new Date();
    const start = project.startDate ? new Date(project.startDate) : null;
    const end = project.endDate ? new Date(project.endDate) : null;

    if (end && end < now) return 'completed';
    if (start && start > now) return 'upcoming';
    if (start && start <= now) return 'ongoing';

    return 'unknown';
  }
}

// Export singleton instance
export const projectService = new ProjectService();
