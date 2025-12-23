/**
 * Material Context
 * Manages material types for the application
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { saveMaterials, loadMaterials } from '../services/storageService';
import { MATERIAL_TYPES } from '../constants';

interface MaterialContextType {
  materials: string[];
  loading: boolean;
  error: string | null;
  addMaterial: (material: string) => void;
  removeMaterial: (material: string) => void;
  resetToDefaults: () => void;
}

type MaterialAction =
  | { type: 'SET_MATERIALS'; payload: string[] }
  | { type: 'ADD_MATERIAL'; payload: string }
  | { type: 'REMOVE_MATERIAL'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface MaterialState {
  materials: string[];
  loading: boolean;
  error: string | null;
}

const initialState: MaterialState = {
  materials: [],
  loading: true,
  error: null,
};

const MaterialContext = createContext<MaterialContextType | undefined>(undefined);

function materialReducer(state: MaterialState, action: MaterialAction): MaterialState {
  switch (action.type) {
    case 'SET_MATERIALS':
      return { ...state, materials: action.payload, loading: false };
    case 'ADD_MATERIAL':
      if (state.materials.includes(action.payload)) {
        return state;
      }
      return { ...state, materials: [...state.materials, action.payload] };
    case 'REMOVE_MATERIAL':
      return {
        ...state,
        materials: state.materials.filter((m) => m !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export const MaterialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(materialReducer, initialState);

  // Load materials on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const materials = await loadMaterials();

        // If no materials exist, use defaults
        if (materials.length === 0) {
          const defaults = [...MATERIAL_TYPES];
          await saveMaterials(defaults);
          dispatch({ type: 'SET_MATERIALS', payload: defaults });
        } else {
          dispatch({ type: 'SET_MATERIALS', payload: materials });
        }
      } catch (error) {
        console.error('Error loading materials:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load materials' });
      }
    };

    loadData();
  }, []);

  const addMaterial = async (material: string) => {
    try {
      const trimmedMaterial = material.trim();
      if (!trimmedMaterial) {
        throw new Error('Material name cannot be empty');
      }

      if (state.materials.includes(trimmedMaterial)) {
        throw new Error('Material already exists');
      }

      const updatedMaterials = [...state.materials, trimmedMaterial];
      await saveMaterials(updatedMaterials);
      dispatch({ type: 'ADD_MATERIAL', payload: trimmedMaterial });
    } catch (error) {
      console.error('Error adding material:', error);
      throw error;
    }
  };

  const removeMaterial = async (material: string) => {
    try {
      const updatedMaterials = state.materials.filter((m) => m !== material);
      await saveMaterials(updatedMaterials);
      dispatch({ type: 'REMOVE_MATERIAL', payload: material });
    } catch (error) {
      console.error('Error removing material:', error);
      throw error;
    }
  };

  const resetToDefaults = async () => {
    try {
      const defaults = [...MATERIAL_TYPES];
      await saveMaterials(defaults);
      dispatch({ type: 'SET_MATERIALS', payload: defaults });
    } catch (error) {
      console.error('Error resetting materials:', error);
      throw error;
    }
  };

  const value: MaterialContextType = {
    materials: state.materials,
    loading: state.loading,
    error: state.error,
    addMaterial,
    removeMaterial,
    resetToDefaults,
  };

  return <MaterialContext.Provider value={value}>{children}</MaterialContext.Provider>;
};

export const useMaterials = (): MaterialContextType => {
  const context = useContext(MaterialContext);
  if (context === undefined) {
    throw new Error('useMaterials must be used within a MaterialProvider');
  }
  return context;
};
