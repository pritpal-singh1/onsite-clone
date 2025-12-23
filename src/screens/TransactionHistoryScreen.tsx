import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Alert,
  Linking,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency, groupTransactionsByMonth } from '../utils/helpers';
import { Transaction } from '../types';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZE,
} from '../constants';
import { Card, Button, EmptyState, LoadingSpinner } from '../components';

type FilterType = 'all' | 'in' | 'out';

const TransactionHistoryScreen: React.FC = () => {
  const { transactions, deleteTransaction, loading } = useTransactions();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    // Search by party name, material, or project
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.partyName.toLowerCase().includes(query) ||
          t.material.toLowerCase().includes(query) ||
          t.project.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [transactions, searchQuery, filterType]);

  const groupedTransactions = useMemo(
    () => groupTransactionsByMonth(filteredTransactions),
    [filteredTransactions]
  );

  const handleSendReminder = (transaction: Transaction): void => {
    const message = `Hi ${transaction.partyName}, just a reminder about the payment of ${formatCurrency(
      transaction.amount
    )} for ${transaction.material} at ${transaction.project}.`;

    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          Alert.alert('Error', 'WhatsApp is not installed on this device');
        }
      })
      .catch((error) => {
        console.error('Error opening WhatsApp:', error);
        Alert.alert('Error', 'Failed to open WhatsApp');
      });
  };

  const handleDeleteTransaction = (id: string): void => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTransaction(id),
        },
      ]
    );
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Card style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <View style={styles.partyNameRow}>
            <View
              style={[
                styles.typeIconContainer,
                item.type === 'in' ? styles.typeIconIn : styles.typeIconOut,
              ]}
            >
              <Ionicons
                name={item.type === 'in' ? 'arrow-down' : 'arrow-up'}
                size={16}
                color={COLORS.WHITE}
              />
            </View>
            <Text style={styles.partyName}>{item.partyName}</Text>
          </View>
          <Text style={styles.transactionDate}>
            {format(parseISO(item.date), 'dd MMM yyyy, hh:mm a')}
          </Text>
          <Text style={styles.transactionDay}>
            {format(parseISO(item.date), 'EEEE')}
          </Text>
        </View>
        <Text
          style={[
            styles.amount,
            item.type === 'in' ? styles.amountIn : styles.amountOut,
          ]}
        >
          {item.type === 'in' ? '+' : '-'}
          {formatCurrency(item.amount)}
        </Text>
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="cube-outline" size={14} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.detailText}>{item.material}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="briefcase-outline" size={14} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.detailText}>{item.project}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        {item.type === 'in' && (
          <Button
            title="Send Reminder"
            onPress={() => handleSendReminder(item)}
            variant="success"
            size="small"
          />
        )}
        <Button
          title="Delete"
          onPress={() => handleDeleteTransaction(item.id)}
          variant="danger"
          size="small"
        />
      </View>
    </Card>
  );

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => (
    <View style={styles.sectionHeader}>
      <Ionicons name="calendar-outline" size={16} color={COLORS.PRIMARY} />
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Header Card */}
      <Card variant="elevated" style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="time-outline" size={24} color={COLORS.WHITE} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Transaction History</Text>
            <Text style={styles.headerSubtitle}>
              {filteredTransactions.length}{' '}
              {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Search Bar */}
      <Card style={styles.searchCard}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.TEXT_SECONDARY} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, material, or project..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.TEXT_SECONDARY}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.TEXT_SECONDARY} />
            </TouchableOpacity>
          )}
        </View>
      </Card>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filterType === 'all' && styles.filterChipActive,
          ]}
          onPress={() => setFilterType('all')}
        >
          <Text
            style={[
              styles.filterChipText,
              filterType === 'all' && styles.filterChipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filterType === 'in' && styles.filterChipActive,
          ]}
          onPress={() => setFilterType('in')}
        >
          <Ionicons
            name="arrow-down"
            size={14}
            color={filterType === 'in' ? COLORS.WHITE : COLORS.SUCCESS}
          />
          <Text
            style={[
              styles.filterChipText,
              filterType === 'in' && styles.filterChipTextActive,
            ]}
          >
            Payment In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filterType === 'out' && styles.filterChipActive,
          ]}
          onPress={() => setFilterType('out')}
        >
          <Ionicons
            name="arrow-up"
            size={14}
            color={filterType === 'out' ? COLORS.WHITE : COLORS.ERROR}
          />
          <Text
            style={[
              styles.filterChipText,
              filterType === 'out' && styles.filterChipTextActive,
            ]}
          >
            Payment Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Loading transactions..." />;
  }

  if (transactions.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <EmptyState
          icon="receipt-outline"
          title="No transactions yet"
          message="Start adding transactions to see your complete history here"
        />
      </View>
    );
  }

  if (filteredTransactions.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <EmptyState
          icon="search-outline"
          title="No results found"
          message="Try adjusting your search or filter criteria"
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setFilterType('all');
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={groupedTransactions}
        renderItem={renderTransaction}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader()}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  headerCard: {
    marginBottom: SPACING.md,
  },
  headerContent: {
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
  searchCard: {
    marginBottom: SPACING.md,
  },
  searchContainer: {
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
  filterContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.GREY_LIGHT,
  },
  filterChipActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },
  filterChipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: COLORS.WHITE,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionHeaderText: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  transactionCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  transactionInfo: {
    flex: 1,
  },
  partyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  typeIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  typeIconIn: {
    backgroundColor: COLORS.SUCCESS,
  },
  typeIconOut: {
    backgroundColor: COLORS.ERROR,
  },
  partyName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  transactionDate: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 2,
    marginLeft: 40,
  },
  transactionDay: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.TEXT_SECONDARY,
    fontStyle: 'italic',
    marginLeft: 40,
  },
  amount: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    marginLeft: SPACING.md,
  },
  amountIn: {
    color: COLORS.SUCCESS,
  },
  amountOut: {
    color: COLORS.ERROR,
  },
  transactionDetails: {
    borderTopWidth: 1,
    borderTopColor: COLORS.GREY_LIGHT,
    paddingTop: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
});

export default TransactionHistoryScreen;
