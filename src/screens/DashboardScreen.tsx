import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTransactions } from '../context/TransactionContext';
import { Card, EmptyState, LoadingSpinner } from '../components';
import { formatCurrency } from '../utils/helpers';
import { getRecentTransactions, calculateTotals } from '../services/transactionService';
import { formatDateTime, getRelativeTime } from '../services/dateService';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '../constants';
import { Transaction } from '../types';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { transactions, loading } = useTransactions();

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const totals = calculateTotals(transactions);
  const recentTransactions = getRecentTransactions(transactions, 5);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.headerTitle}>Dashboard Overview</Text>
          </View>
          <View style={styles.headerIcon}>
            <Ionicons name="analytics" size={32} color={COLORS.PRIMARY} />
          </View>
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summarySection}>
        {/* Balance Card - Featured */}
        <Card variant="elevated" style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View style={styles.balanceIconContainer}>
              <Ionicons name="wallet" size={24} color={COLORS.WHITE} />
            </View>
            <View style={styles.balanceBadge}>
              <Ionicons name="trending-up" size={16} color={COLORS.WHITE} />
            </View>
          </View>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(totals.balance)}
          </Text>
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Income</Text>
              <Text style={styles.balanceStatValue}>
                {formatCurrency(totals.totalIncome)}
              </Text>
            </View>
            <View style={styles.balanceStatDivider} />
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Expense</Text>
              <Text style={styles.balanceStatValue}>
                {formatCurrency(totals.totalExpense)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Quick Stats Row */}
        <View style={styles.quickStatsRow}>
          <Card variant="default" style={styles.quickStatCard}>
            <View style={[styles.quickStatIcon, styles.incomeIconBg]}>
              <Ionicons name="arrow-down-circle" size={24} color={COLORS.SUCCESS} />
            </View>
            <Text style={styles.quickStatLabel}>To Receive</Text>
            <Text style={[styles.quickStatValue, styles.incomeText]}>
              {formatCurrency(totals.totalIncome)}
            </Text>
          </Card>

          <Card variant="default" style={styles.quickStatCard}>
            <View style={[styles.quickStatIcon, styles.expenseIconBg]}>
              <Ionicons name="arrow-up-circle" size={24} color={COLORS.ERROR} />
            </View>
            <Text style={styles.quickStatLabel}>To Pay</Text>
            <Text style={[styles.quickStatValue, styles.expenseText]}>
              {formatCurrency(totals.totalExpense)}
            </Text>
          </Card>
        </View>
      </View>

      {/* Recent Transactions Section */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentTransactions.length > 0 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('History' as never)}
              style={styles.viewAllButton}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.PRIMARY} />
            </TouchableOpacity>
          )}
        </View>

        {recentTransactions.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No Transactions Yet"
            message="Start by adding your first transaction using the + button below"
            actionLabel="Add Transaction"
            onAction={() => navigation.navigate('Add' as never)}
          />
        ) : (
          <View style={styles.transactionsList}>
            {recentTransactions.map((transaction: Transaction) => (
              <Card
                key={transaction.id}
                variant="default"
                style={styles.transactionCard}
              >
                <View style={styles.transactionRow}>
                  <View
                    style={[
                      styles.transactionIconContainer,
                      transaction.type === 'in'
                        ? styles.incomeIconBg
                        : styles.expenseIconBg,
                    ]}
                  >
                    <Ionicons
                      name={
                        transaction.type === 'in'
                          ? 'arrow-down'
                          : 'arrow-up'
                      }
                      size={20}
                      color={
                        transaction.type === 'in'
                          ? COLORS.SUCCESS
                          : COLORS.ERROR
                      }
                    />
                  </View>

                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionParty}>
                      {transaction.partyName}
                    </Text>
                    <View style={styles.transactionMeta}>
                      <Ionicons
                        name="cube-outline"
                        size={12}
                        color={COLORS.TEXT_SECONDARY}
                      />
                      <Text style={styles.transactionMetaText}>
                        {transaction.material}
                      </Text>
                      <Text style={styles.transactionMetaDot}>•</Text>
                      <Ionicons
                        name="folder-outline"
                        size={12}
                        color={COLORS.TEXT_SECONDARY}
                      />
                      <Text style={styles.transactionMetaText}>
                        {transaction.project}
                      </Text>
                    </View>
                    <Text style={styles.transactionTime}>
                      {getRelativeTime(transaction.date)}
                    </Text>
                  </View>

                  <View style={styles.transactionAmount}>
                    <Text
                      style={[
                        styles.transactionAmountText,
                        transaction.type === 'in'
                          ? styles.incomeText
                          : styles.expenseText,
                      ]}
                    >
                      {transaction.type === 'in' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>

      {/* Quick Actions */}
      {transactions.length > 0 && (
        <View style={styles.quickActionsSection}>
          <Card variant="outlined" style={styles.quickActionsCard}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('Add' as never)}
              >
                <View style={[styles.quickActionIcon, styles.primaryBg]}>
                  <Ionicons name="add" size={24} color={COLORS.WHITE} />
                </View>
                <Text style={styles.quickActionLabel}>Add New</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('Projects' as never)}
              >
                <View style={[styles.quickActionIcon, styles.secondaryBg]}>
                  <Ionicons name="folder-open" size={24} color={COLORS.WHITE} />
                </View>
                <Text style={styles.quickActionLabel}>Projects</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('Reports' as never)}
              >
                <View style={[styles.quickActionIcon, styles.warningBg]}>
                  <Ionicons name="stats-chart" size={24} color={COLORS.WHITE} />
                </View>
                <Text style={styles.quickActionLabel}>Reports</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => navigation.navigate('History' as never)}
              >
                <View style={[styles.quickActionIcon, styles.infoBg]}>
                  <Ionicons name="time" size={24} color={COLORS.WHITE} />
                </View>
                <Text style={styles.quickActionLabel}>History</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  headerSection: {
    backgroundColor: COLORS.WHITE,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  welcomeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summarySection: {
    padding: SPACING.lg,
  },
  balanceCard: {
    backgroundColor: COLORS.PRIMARY,
    marginBottom: SPACING.md,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  balanceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceBadge: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.WHITE,
    opacity: 0.9,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: FONT_SIZE.huge,
    fontWeight: '700',
    color: COLORS.WHITE,
    marginBottom: SPACING.lg,
  },
  balanceStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
  },
  balanceStat: {
    flex: 1,
    alignItems: 'center',
  },
  balanceStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: SPACING.md,
  },
  balanceStatLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.WHITE,
    opacity: 0.8,
    marginBottom: SPACING.xs,
  },
  balanceStatValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quickStatCard: {
    flex: 1,
  },
  quickStatIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  incomeIconBg: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  expenseIconBg: {
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
  },
  quickStatLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.xs,
  },
  quickStatValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  incomeText: {
    color: COLORS.SUCCESS,
  },
  expenseText: {
    color: COLORS.ERROR,
  },
  recentSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  viewAllText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  transactionsList: {
    gap: SPACING.sm,
  },
  transactionCard: {
    marginBottom: SPACING.xs,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionParty: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.xs,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs / 2,
  },
  transactionMetaText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.TEXT_SECONDARY,
  },
  transactionMetaDot: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.TEXT_SECONDARY,
  },
  transactionTime: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.TEXT_LIGHT,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  quickActionsSection: {
    padding: SPACING.lg,
  },
  quickActionsCard: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },
  quickActionsTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: SPACING.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  quickActionButton: {
    width: '22%',
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  primaryBg: {
    backgroundColor: COLORS.PRIMARY,
  },
  secondaryBg: {
    backgroundColor: COLORS.SUCCESS,
  },
  warningBg: {
    backgroundColor: COLORS.WARNING,
  },
  infoBg: {
    backgroundColor: '#9C27B0',
  },
  quickActionLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: SPACING.xxl,
  },
});

export default DashboardScreen;
