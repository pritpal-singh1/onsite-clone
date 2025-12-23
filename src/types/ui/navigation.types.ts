/**
 * Navigation Types
 * Type definitions for React Navigation
 */

/**
 * Navigation route names
 */
export enum Routes {
  // Tab routes
  DASHBOARD = 'Dashboard',
  ADD_TRANSACTION = 'Add',
  HISTORY = 'History',
  REPORTS = 'Reports',
  SETTINGS = 'Settings',

  // Stack routes
  MAIN = 'Main',
  PROJECTS = 'Projects',
  ADD_PROJECT = 'AddProject',
  PROJECT_VIEW = 'ProjectView',
  MATERIAL_MANAGEMENT = 'MaterialManagement',
}

/**
 * Tab param list
 */
export type RootTabParamList = {
  Dashboard: undefined;
  Add: undefined;
  History: undefined;
  Reports: undefined;
  Settings: undefined;
};

/**
 * Stack param list
 */
export type RootStackParamList = {
  Main: undefined;
  Projects: undefined;
  AddProject: undefined;
  ProjectView: { projectId: string };
  MaterialManagement: undefined;
};
