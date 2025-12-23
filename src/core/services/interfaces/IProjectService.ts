/**
 * Project Service Interface
 * Defines contract for project-related business logic
 */

import { Project, ProjectInput } from '../../../types';

export interface IProjectService {
  /**
   * Generate unique project ID
   */
  generateProjectId(): string;

  /**
   * Load projects from storage
   */
  loadProjects(): Promise<Project[]>;

  /**
   * Save projects to storage
   */
  saveProjects(projects: Project[]): Promise<void>;

  /**
   * Create a new project
   */
  createProject(projectInput: ProjectInput): Project;

  /**
   * Update an existing project
   */
  updateProjectData(existingProject: Project, updates: Partial<ProjectInput>): Project;

  /**
   * Validate project name
   */
  validateProjectName(name: string): string | null;

  /**
   * Validate budget
   */
  validateBudget(budget: number): string | null;

  /**
   * Validate project form data
   */
  validateProjectForm(projectInput: ProjectInput): { [key: string]: string };

  /**
   * Search projects by query
   */
  searchProjects(projects: Project[], query: string): Project[];

  /**
   * Sort projects (default first, then alphabetically)
   */
  sortProjects(projects: Project[]): Project[];

  /**
   * Calculate project status based on dates
   */
  getProjectStatus(
    project: Project
  ): 'upcoming' | 'ongoing' | 'completed' | 'unknown';
}
