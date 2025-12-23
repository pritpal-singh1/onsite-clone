import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/helpers';
import { MaterialBreakdown, MaterialBreakdownData, Transaction } from '../types';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZE,
} from '../constants';
import { Card, EmptyState, LoadingSpinner } from '../components';

const ProjectViewScreen: React.FC = () => {
  const { transactions, loading } = useTransactions();
  const [selectedProject, setSelectedProject] = useState('all');
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  // Get unique project names
  const projects = ['all', ...new Set(transactions.map((t: Transaction) => t.project))];

  // Filter transactions by project
  const filteredTransactions =
    selectedProject === 'all'
      ? transactions
      : transactions.filter((t: Transaction) => t.project === selectedProject);

  // Calculate totals
  const calculateTotals = () => {
    const totalIn = filteredTransactions
      .filter((t: Transaction) => t.type === 'in')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const totalOut = filteredTransactions
      .filter((t: Transaction) => t.type === 'out')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    return {
      totalIn,
      totalOut,
      balance: totalIn - totalOut,
    };
  };

  // Group by material
  const getMaterialBreakdown = (): MaterialBreakdown => {
    const breakdown: MaterialBreakdown = {};
    filteredTransactions.forEach((transaction: Transaction) => {
      const material = transaction.material;
      if (!breakdown[material]) {
        breakdown[material] = { in: 0, out: 0, count: 0 };
      }
      if (transaction.type === 'in') {
        breakdown[material].in += transaction.amount;
      } else {
        breakdown[material].out += transaction.amount;
      }
      breakdown[material].count += 1;
    });
    return breakdown;
  };

  const totals = calculateTotals();
  const materialBreakdown = getMaterialBreakdown();

  if (loading) {
    return <LoadingSpinner message="Loading projects..." />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <Card variant="elevated" style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="briefcase" size={24} color={COLORS.WHITE} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Project Analysis</Text>
            <Text style={styles.headerSubtitle}>
              {projects.length - 1} {projects.length === 2 ? 'project' : 'projects'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Project Selector */}
      <Card style={styles.selectorCard}>
        <Text style={styles.selectorLabel}>Select Project</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowProjectPicker(true)}
        >
          <View style={styles.dropdownContent}>
            <Ionicons name="folder-outline" size={20} color={COLORS.PRIMARY} />
            <Text style={styles.dropdownButtonText}>
              {selectedProject === 'all' ? 'All Projects' : selectedProject}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color={COLORS.TEXT_SECONDARY} />
        </TouchableOpacity>
      </Card>

      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon="folder-open-outline"
          title="No transactions"
          message={
            selectedProject === 'all'
              ? 'Start adding transactions to see project analytics'
              : 'No transactions found for this project'
          }
        />
      ) : (
        <>
          {/* Project Summary */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="stats-chart" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.sectionTitle}>Financial Summary</Text>
            </View>

            {/* Summary Cards Grid */}
            <View style={styles.summaryGrid}>
              <Card variant="elevated" style={styles.summaryCard}>
                <View style={styles.summaryIconContainer}>
                  <Ionicons name="arrow-down-circle" size={32} color={COLORS.SUCCESS} />
                </View>
                <Text style={styles.summaryLabel}>Total Income</Text>
                <Text style={[styles.summaryValue, styles.incomeText]}>
                  {formatCurrency(totals.totalIn)}
                </Text>
              </Card>

              <Card variant="elevated" style={styles.summaryCard}>
                <View style={styles.summaryIconContainer}>
                  <Ionicons name="arrow-up-circle" size={32} color={COLORS.ERROR} />
                </View>
                <Text style={styles.summaryLabel}>Total Expenses</Text>
                <Text style={[styles.summaryValue, styles.expenseText]}>
                  {formatCurrency(totals.totalOut)}
                </Text>
              </Card>
            </View>

            {/* Balance Card */}
            <View
              style={[
                styles.balanceCard,
                totals.balance >= 0 ? styles.balancePositive : styles.balanceNegative,
              ]}
            >
              <View style={styles.balanceContent}>
                <View style={styles.balanceIconContainer}>
                  <Ionicons
                    name={totals.balance >= 0 ? 'trending-up' : 'trending-down'}
                    size={28}
                    color={COLORS.WHITE}
                  />
                </View>
                <View style={styles.balanceTextContainer}>
                  <Text style={styles.balanceLabel}>Net Balance</Text>
                  <Text style={styles.balanceValue}>
                    {formatCurrency(totals.balance)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Material Breakdown */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="cube" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.sectionTitle}>Material Breakdown</Text>
            </View>

            {Object.entries(materialBreakdown).length === 0 ? (
              <EmptyState
                icon="cube-outline"
                title="No materials"
                message="No material data available for this project"
              />
            ) : (
              Object.entries(materialBreakdown).map(
                ([material, data]: [string, MaterialBreakdownData]) => (
                  <Card key={material} style={styles.materialCard}>
                    <View style={styles.materialHeader}>
                      <View style={styles.materialTitleRow}>
                        <View style={styles.materialIconContainer}>
                          <Ionicons name="cube-outline" size={18} color={COLORS.PRIMARY} />
                        </View>
                        <Text style={styles.materialName}>{material}</Text>
                      </View>
                      <View style={styles.transactionBadge}>
                        <Text style={styles.transactionBadgeText}>
                          {data.count}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.materialStats}>
                      <View style={styles.materialStatRow}>
                        <View style={styles.materialStatLabel}>
                          <View style={[styles.statDot, styles.statDotIncome]} />
                          <Text style={styles.materialLabel}>Income</Text>
                        </View>
                        <Text style={[styles.materialValue, styles.incomeText]}>
                          {formatCurrency(data.in)}
                        </Text>
                      </View>

                      <View style={styles.materialStatRow}>
                        <View style={styles.materialStatLabel}>
                          <View style={[styles.statDot, styles.statDotExpense]} />
                          <Text style={styles.materialLabel}>Expenses</Text>
                        </View>
                        <Text style={[styles.materialValue, styles.expenseText]}>
                          {formatCurrency(data.out)}
                        </Text>
                      </View>

                      <View style={[styles.materialStatRow, styles.materialNetRow]}>
                        <View style={styles.materialStatLabel}>
                          <Ionicons
                            name="calculator-outline"
                            size={14}
                            color={COLORS.TEXT_SECONDARY}
                          />
                          <Text style={styles.materialLabelBold}>Net</Text>
                        </View>
                        <Text
                          style={[
                            styles.materialValue,
                            styles.materialNetValue,
                            data.in - data.out >= 0 ? styles.incomeText : styles.expenseText,
                          ]}
                        >
                          {formatCurrency(data.in - data.out)}
                        </Text>
                      </View>
                    </View>
                  </Card>
                )
              )
            )}
          </View>
        </>
      )}

      {/* Project Picker Modal */}
      <Modal
        visible={showProjectPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowProjectPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Project</Text>
              <TouchableOpacity onPress={() => setShowProjectPicker(false)}>
                <Ionicons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
              </TouchableOpacity>
            </View>
            <Picker
              selectedValue={selectedProject}
              onValueChange={(value) => {
                setSelectedProject(value as string);
                setShowProjectPicker(false);
              }}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              <Picker.Item label="All Projects" value="all" />
              {projects
                .filter((p: string) => p !== 'all')
                .map((project: string) => (
                  <Picker.Item key={project} label={project} value={project} />
                ))}
            </Picker>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },
  headerCard: {
    margin: SPACING.md,
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
  selectorCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  selectorLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.xs,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.GREY_LIGHT,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.WHITE,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  dropdownButtonText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
  },
  summaryIconContainer: {
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  incomeText: {
    color: COLORS.SUCCESS,
  },
  expenseText: {
    color: COLORS.ERROR,
  },
  balanceCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balancePositive: {
    backgroundColor: COLORS.SUCCESS,
  },
  balanceNegative: {
    backgroundColor: COLORS.ERROR,
  },
  balanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  balanceTextContainer: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.WHITE,
    opacity: 0.9,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  materialCard: {
    marginBottom: SPACING.md,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GREY_LIGHT,
  },
  materialTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  materialIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  materialName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  transactionBadge: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 32,
    alignItems: 'center',
  },
  transactionBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.WHITE,
  },
  materialStats: {
    gap: SPACING.sm,
  },
  materialStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  materialNetRow: {
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.GREY_LIGHT,
  },
  materialStatLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statDotIncome: {
    backgroundColor: COLORS.SUCCESS,
  },
  statDotExpense: {
    backgroundColor: COLORS.ERROR,
  },
  materialLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
  },
  materialLabelBold: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    fontWeight: '600',
  },
  materialValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  materialNetValue: {
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderTopRightRadius: BORDER_RADIUS.lg,
    paddingBottom: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GREY_LIGHT,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  picker: {
    width: '100%',
    height: 200,
  },
  pickerItem: {
    height: 200,
    fontSize: FONT_SIZE.lg,
    color: COLORS.BLACK,
  },
});

export default ProjectViewScreen;
