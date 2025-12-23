import React, { createContext, useContext, useReducer, useEffect, ReactNode, useState } from 'react';
import { Transaction, TransactionContextType, TransactionInput } from '../types';
import {
  generateTransactionId,
  loadTransactions as loadFromStorage,
  saveTransactions as saveToStorage,
  initializeStorage,
} from '../services/storageService';

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

// Action types
type ActionType =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'LOAD_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// State type
interface State {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: State = {
  transactions: [],
  loading: true,
  error: null,
};

// Reducer
const transactionReducer = (state: State, action: ActionType): State => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
        error: null,
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
        error: null,
      };
    case 'LOAD_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
        loading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

// Provider component
export const TransactionProvider = ({ children }: { children: ReactNode }): React.ReactElement => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);
  const [saveQueued, setSaveQueued] = useState(false);

  // Initialize storage on mount
  useEffect(() => {
    const init = async () => {
      await initializeStorage();
      await loadTransactions();
    };
    init();
  }, []);

  // Save transactions to storage whenever they change (debounced)
  useEffect(() => {
    if (state.loading) return; // Don't save during initial load

    if (!saveQueued) {
      setSaveQueued(true);
      setTimeout(() => {
        saveTransactions(state.transactions);
        setSaveQueued(false);
      }, 500); // Debounce saves by 500ms
    }
  }, [state.transactions, state.loading]);

  const loadTransactions = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await loadFromStorage();

      if (result.success) {
        dispatch({ type: 'LOAD_TRANSACTIONS', payload: result.data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to load transactions' });
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      dispatch({ type: 'SET_ERROR', payload: 'An unexpected error occurred' });
    }
  };

  const saveTransactions = async (transactions: Transaction[]): Promise<void> => {
    try {
      const result = await saveToStorage(transactions);
      if (!result.success) {
        console.error('Error saving transactions:', result.error);
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Failed to save transactions' });
      }
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  };

  const addTransaction = (transaction: TransactionInput): void => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateTransactionId(),
      date: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
  };

  const deleteTransaction = (id: string): void => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  // Calculate totals
  const calculateTotals = () => {
    const totalIn = state.transactions
      .filter(t => t.type === 'in')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalOut = state.transactions
      .filter(t => t.type === 'out')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalBalance: totalIn - totalOut,
      totalReceivable: totalIn,
      totalPayable: totalOut,
    };
  };

  const value = {
    transactions: state.transactions,
    loading: state.loading,
    error: state.error,
    addTransaction,
    deleteTransaction,
    calculateTotals,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

// Custom hook to use the transaction context
export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
