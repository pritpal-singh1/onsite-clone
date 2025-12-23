/**
 * Project Context for managing projects state
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useState,
} from 'react';
import { Project, ProjectInput, ProjectContextType } from '../types/interfaces';
import {
  loadProjects,
  saveProjects,
  createProject,
  updateProjectData,
} from '../services/projectService';

interface State {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { id: string; project: Project } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_DEFAULT_PROJECT'; payload: string };

const initialState: State = {
  projects: [],
  loading: true,
  error: null,
};

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const projectReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, loading: false };
    case 'ADD_PROJECT':
      return { ...state, projects: [...state.projects, action.payload] };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.id ? action.payload.project : project
        ),
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter((project) => project.id !== action.payload),
      };
    case 'SET_DEFAULT_PROJECT':
      return {
        ...state,
        projects: state.projects.map((project) => ({
          ...project,
          isDefault: project.id === action.payload,
        })),
      };
    default:
      return state;
  }
};

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);
  const [saveQueued, setSaveQueued] = useState(false);

  // Load projects on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const projects = await loadProjects();

        // Auto-select first project as default if only one exists and no default is set
        if (projects.length === 1 && !projects[0].isDefault) {
          const updatedProjects = projects.map(p => ({ ...p, isDefault: true }));
          dispatch({ type: 'SET_PROJECTS', payload: updatedProjects });
        } else {
          dispatch({ type: 'SET_PROJECTS', payload: projects });
        }
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to load projects',
        });
      }
    };
    loadData();
  }, []);

  // Debounced save when projects change
  useEffect(() => {
    if (state.loading) return;
    if (!saveQueued) {
      setSaveQueued(true);
      setTimeout(() => {
        saveProjects(state.projects);
        setSaveQueued(false);
      }, 500);
    }
  }, [state.projects, state.loading]);

  const addProject = (projectInput: ProjectInput): void => {
    // If this is the first project, automatically set it as default
    const isFirstProject = state.projects.length === 0;
    let inputWithDefault = { ...projectInput };

    if (isFirstProject) {
      inputWithDefault.isDefault = true;
    } else if (projectInput.isDefault) {
      // If this is set as default, unset all other defaults
      dispatch({ type: 'SET_DEFAULT_PROJECT', payload: '' }); // Unset all defaults first
    }

    const newProject = createProject(inputWithDefault);
    dispatch({ type: 'ADD_PROJECT', payload: newProject });
  };

  const updateProject = (id: string, updates: Partial<ProjectInput>): void => {
    const existingProject = state.projects.find((p) => p.id === id);
    if (!existingProject) return;

    // If setting as default, unset all other defaults first
    if (updates.isDefault) {
      dispatch({ type: 'SET_DEFAULT_PROJECT', payload: '' });
    }

    const updatedProject = updateProjectData(existingProject, updates);
    dispatch({ type: 'UPDATE_PROJECT', payload: { id, project: updatedProject } });
  };

  const deleteProject = (id: string): void => {
    dispatch({ type: 'DELETE_PROJECT', payload: id });
  };

  const getDefaultProject = (): Project | null => {
    return state.projects.find((project) => project.isDefault) || null;
  };

  const setDefaultProject = (id: string): void => {
    dispatch({ type: 'SET_DEFAULT_PROJECT', payload: id });
    // Update the timestamps
    const project = state.projects.find((p) => p.id === id);
    if (project) {
      updateProject(id, { isDefault: true });
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects: state.projects,
        loading: state.loading,
        error: state.error,
        addProject,
        updateProject,
        deleteProject,
        getDefaultProject,
        setDefaultProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
