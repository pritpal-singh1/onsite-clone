# Refactoring Guide - Construction Payment Manager

## Overview
This document outlines the comprehensive refactoring completed to improve code maintainability, scalability, and platform compatibility.

## What's Been Refactored

### 1. Component Library (`src/components/`)
Created reusable, type-safe UI components:
- **Button**: Flexible button with variants (primary, secondary, danger, success), sizes, loading states
- **Card**: Container component with elevation and outline variants
- **Input**: Form input with validation, error states, and focus handling
- **EmptyState**: Reusable empty state with icon, message, and action button
- **LoadingSpinner**: Loading indicator with optional message
- **ErrorBoundary**: Error boundary for graceful error handling
- **ContactPicker**: Full-screen modal with search, phone numbers, and avatar display

### 2. Service Layer (`src/services/`)
Extracted all business logic into dedicated services:

#### `transactionService.ts`
- Calculation functions (totals, breakdowns)
- Filtering (by project, material, type, date range)
- Sorting (by date, amount)
- Grouping (by month, project, material)
- Search and validation

#### `dateService.ts`
- Date formatting (full, date-time, date-only, month-year)
- Date parsing and manipulation
- Relative time display
- Month key generation for grouping

#### `chartService.ts`
- Pie chart data generation
- Monthly comparison data
- Project breakdown statistics
- Summary statistics calculation

#### `storageService.ts`
- Improved ID generation (timestamp + random)
- Async storage operations with error handling
- Data versioning and migration support
- Import/export functionality
- Storage info utilities

#### `contactService.ts`
- Cross-platform contact permission handling
- Contact loading with error handling
- Contact search functionality
- Phone number formatting for WhatsApp

#### `validationService.ts`
- Form field validation
- Transaction validation
- Input sanitization
- Currency formatting

### 3. Context Improvements
**TransactionContext** now includes:
- Loading states
- Error handling
- Debounced saves (500ms)
- Better ID generation
- Storage initialization

### 4. iOS/Android Compatibility
- Added `SafeAreaProvider` for proper notch handling
- Added `StatusBar` configuration
- Platform-specific styling support
- Better keyboard handling preparation

### 5. Error Handling
- ErrorBoundary component wraps entire app
- User-friendly error messages
- Development error details
- Graceful fallback UI

## How to Use New Components

### Button Component
```typescript
import { Button } from '../components';

<Button
  title="Save Transaction"
  onPress={handleSave}
  variant="primary"  // primary, secondary, danger, success
  size="medium"      // small, medium, large
  loading={isLoading}
  fullWidth
/>
```

### Input Component
```typescript
import { Input } from '../components';

<Input
  label="Amount"
  value={amount}
  onChangeText={setAmount}
  keyboardType="numeric"
  error={errors.amount}
  required
/>
```

### Card Component
```typescript
import { Card } from '../components';

<Card variant="elevated" onPress={handlePress}>
  <Text>Card Content</Text>
</Card>
```

### ContactPicker Component
```typescript
import { ContactPicker } from '../components/ContactPicker';

<ContactPicker
  visible={showContactPicker}
  onClose={() => setShowContactPicker(false)}
  onSelectContact={(name, phone) => {
    setPartyName(name);
    if (phone) {
      // Store phone for WhatsApp integration
    }
  }}
/>
```

### EmptyState Component
```typescript
import { EmptyState } from '../components';

<EmptyState
  icon="document-outline"
  title="No Transactions"
  message="Start by adding your first transaction"
  actionLabel="Add Transaction"
  onAction={() => navigation.navigate('Add')}
/>
```

## Using Services

### Transaction Service
```typescript
import {
  calculateTotals,
  filterByProject,
  sortByDateDesc,
  getRecentTransactions
} from '../services';

const totals = calculateTotals(transactions);
const projectTransactions = filterByProject(transactions, 'Building A');
const sorted = sortByDateDesc(transactions);
const recent = getRecentTransactions(transactions, 10);
```

### Date Service
```typescript
import { formatDateTime, formatCurrency } from '../services';

const formattedDate = formatDateTime(transaction.date);
const displayAmount = formatCurrency(transaction.amount);
```

### Validation Service
```typescript
import { validateTransactionForm } from '../services';

const validation = validateTransactionForm({
  amount: formData.amount,
  partyName: formData.partyName,
  material: formData.material,
  project: formData.project,
  type: formData.type,
});

if (!validation.valid) {
  setErrors(validation.errors);
  return;
}
```

## Migration Guide for Screens

### Before (Old Pattern)
```typescript
// All logic in component
const DashboardScreen = () => {
  const { transactions } = useTransactions();

  const totalIn = transactions
    .filter(t => t.type === 'in')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Total Income</Text>
        <Text style={styles.amount}>₹{totalIn}</Text>
      </View>
    </View>
  );
};
```

### After (New Pattern)
```typescript
import { Card, LoadingSpinner } from '../components';
import { calculateTotals, formatCurrency } from '../services';

const DashboardScreen = () => {
  const { transactions, loading } = useTransactions();

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const { totalIncome } = calculateTotals(transactions);

  return (
    <View style={styles.container}>
      <Card variant="elevated">
        <Text style={styles.title}>Total Income</Text>
        <Text style={styles.amount}>{formatCurrency(totalIncome)}</Text>
      </Card>
    </View>
  );
};
```

## Performance Improvements Included

1. **Debounced Storage Saves**: Reduces writes to AsyncStorage (500ms debounce)
2. **Better ID Generation**: Prevents collisions with timestamp + random
3. **Service Layer**: Business logic is now easily testable and reusable
4. **Memoization Ready**: Components structured for React.memo() if needed

## Next Steps for Screen Refactoring

When refactoring each screen, follow this pattern:

1. **Extract Components**: Break large screens into smaller components
2. **Use Services**: Replace inline logic with service functions
3. **Add Validation**: Use validation service for forms
4. **Improve UX**: Add loading states, error handling, empty states
5. **Use New Components**: Replace custom UI with component library

### Example: AddTransactionScreen Refactoring Checklist
- [ ] Replace Alert-based contact picker with ContactPicker component
- [ ] Use Input components for form fields
- [ ] Add validation with validationService
- [ ] Use Button component for submit
- [ ] Add loading state during save
- [ ] Add KeyboardAvoidingView for better keyboard handling
- [ ] Show success/error toast after save

### Example: DashboardScreen Refactoring Checklist
- [ ] Use Card components for summary cards
- [ ] Extract SummaryCard as separate component
- [ ] Use calculateTotals from transactionService
- [ ] Use EmptyState when no transactions
- [ ] Add LoadingSpinner during data load
- [ ] Use formatCurrency for amounts
- [ ] Extract TransactionCard component

## Testing Guide

### Unit Testing Services
```typescript
import { calculateTotals } from '../services/transactionService';

describe('transactionService', () => {
  it('calculates totals correctly', () => {
    const transactions = [
      { type: 'in', amount: 1000, ... },
      { type: 'out', amount: 500, ... },
    ];

    const result = calculateTotals(transactions);

    expect(result.totalIncome).toBe(1000);
    expect(result.totalExpense).toBe(500);
    expect(result.balance).toBe(500);
  });
});
```

## Constants Reference

### Colors (Updated)
Use uppercase constants for new code:
- `COLORS.PRIMARY`, `COLORS.SECONDARY`
- `COLORS.SUCCESS`, `COLORS.ERROR`, `COLORS.WARNING`
- `COLORS.TEXT_PRIMARY`, `COLORS.TEXT_SECONDARY`
- `COLORS.BACKGROUND`, `COLORS.WHITE`, `COLORS.BLACK`

Legacy lowercase versions still available during migration.

### Spacing
- `SPACING.xs` (4px) through `SPACING.xxxl` (32px)

### Font Sizes
- `FONT_SIZE.xs` (12px) through `FONT_SIZE.huge` (32px)

### Border Radius
- `BORDER_RADIUS.sm` (8px) through `BORDER_RADIUS.round` (100px)

## File Structure
```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── EmptyState.tsx
│   ├── LoadingSpinner.tsx
│   ├── ErrorBoundary.tsx
│   ├── ContactPicker.tsx
│   ├── CustomPieChart.tsx
│   └── index.ts
├── services/           # Business logic layer
│   ├── transactionService.ts
│   ├── dateService.ts
│   ├── chartService.ts
│   ├── storageService.ts
│   ├── contactService.ts
│   ├── validationService.ts
│   └── index.ts
├── context/           # React context providers
│   └── TransactionContext.tsx
├── screens/           # Screen components (to be refactored)
│   ├── DashboardScreen.tsx
│   ├── AddTransactionScreen.tsx
│   ├── TransactionHistoryScreen.tsx
│   ├── ProjectViewScreen.tsx
│   └── ReportingScreen.tsx
├── types/            # TypeScript types and interfaces
│   ├── enums.ts
│   ├── interfaces.ts
│   ├── types.ts
│   └── index.ts
├── utils/            # Utility functions
│   └── helpers.ts
└── constants/        # Application constants
    └── index.ts
```

## Benefits Achieved

1. **Maintainability**: Logic separated from UI, easier to update
2. **Testability**: Services can be unit tested independently
3. **Reusability**: Components and services reused across screens
4. **Type Safety**: Full TypeScript coverage with strict types
5. **Scalability**: Easy to add new features without touching existing code
6. **Performance**: Optimized storage operations and rendering
7. **User Experience**: Better error handling and loading states
8. **Platform Compatibility**: iOS and Android specific handling

## Breaking Changes

1. `TransactionContext` now returns `loading` and `error` properties
2. Contact picker now returns phone number as second parameter
3. Date formatting moved to `dateService` instead of inline
4. Storage operations now return success/error objects

## Backward Compatibility

- All lowercase color constants still available
- Existing screens will continue to work during migration
- No breaking changes to transaction data structure
