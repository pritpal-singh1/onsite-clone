/**
 * Component Props Types
 * Centralized type definitions for UI component props
 */

import { ViewStyle, TextStyle, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';

/**
 * Button Component Props
 */
export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Input Component Props
 */
export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
  prefix?: string;
}

/**
 * Dropdown Option Type
 */
export interface DropdownOption {
  label: string;
  value: string;
}

/**
 * Dropdown Component Props
 */
export interface DropdownProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  error?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * Card Component Props
 */
export interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
}

/**
 * AutocompleteInput Component Props
 */
export interface AutocompleteInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  options: readonly string[] | string[];
  placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  required?: boolean;
  error?: string;
  allowCustomValue?: boolean;
}

/**
 * ContactPicker Component Props
 */
export interface ContactPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectContact: (name: string, phone?: string) => void;
}

/**
 * ErrorBoundary Component Props
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * ErrorBoundary Component State
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * LoadingSpinner Component Props
 */
export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
  message?: string;
}

/**
 * EmptyState Component Props
 */
export interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

/**
 * SuccessModal Component Props
 */
export interface SuccessModalProps {
  visible: boolean;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
}

/**
 * ErrorModal Component Props
 */
export interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  onRetry?: () => void;
}

/**
 * CustomPieChart Component Props
 */
export interface CustomPieChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
    percentage: number;
  }>;
  size?: number;
  innerRadius?: number;
  showLabels?: boolean;
  showLegend?: boolean;
}
