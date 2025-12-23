import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useTransactions } from '../context/TransactionContext';
import { useProjects } from '../context/ProjectContext';
import { formatCurrency } from '../utils/helpers';
import { ExpensesByMaterial, PieChartDataItem, Transaction } from '../types';
import CustomPieChart from '../components/CustomPieChart';
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZE,
  CHART_COLORS,
} from '../constants';
import { Card, EmptyState, LoadingSpinner, Dropdown, SuccessModal, ErrorModal } from '../components';
import { generateMonthlyExcelReport } from '../services';

const { width } = Dimensions.get('window');

const ReportingScreen: React.FC = () => {
  const { transactions, loading } = useTransactions();
  const { projects } = useProjects();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [exportLoading, setExportLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Get unique months from transactions
  const getAvailableMonths = (): string[] => {
    const months = new Set<string>();
    transactions.forEach((transaction: Transaction) => {
      const monthKey = format(parseISO(transaction.date), 'yyyy-MM');
      months.add(monthKey);
    });
    return Array.from(months).sort().reverse();
  };

  const availableMonths: string[] = getAvailableMonths();

  // Format month options for dropdown
  const monthOptions = availableMonths.map(month => ({
    label: format(new Date(month + '-01'), 'MMMM yyyy'),
    value: month,
  }));

  // Get selected month display value
  const selectedMonthDisplay = selectedMonth
    ? format(new Date(selectedMonth + '-01'), 'MMMM yyyy')
    : '';

  // Get project options for dropdown
  const projectOptions = [
    { label: 'All Projects', value: 'all' },
    ...projects.map(project => ({
      label: project.name,
      value: project.id,
    })),
  ];

  // Filter transactions by selected month and project
  const getFilteredTransactions = () => {
    return transactions.filter((transaction: Transaction) => {
      const transactionMonth = format(parseISO(transaction.date), 'yyyy-MM');
      const matchesMonth = transactionMonth === selectedMonth;
      const matchesProject = selectedProject === 'all' || transaction.project === projects.find(p => p.id === selectedProject)?.name;
      return matchesMonth && matchesProject;
    });
  };

  const monthlyTransactions = getFilteredTransactions();

  // Calculate monthly totals
  const calculateMonthlyTotals = () => {
    const totalIn = monthlyTransactions
      .filter((t: Transaction) => t.type === 'in')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    const totalOut = monthlyTransactions
      .filter((t: Transaction) => t.type === 'out')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

    return {
      totalIn,
      totalOut,
      balance: totalIn - totalOut,
      transactionCount: monthlyTransactions.length,
      incomeCount: monthlyTransactions.filter((t) => t.type === 'in').length,
      expenseCount: monthlyTransactions.filter((t) => t.type === 'out').length,
    };
  };

  // Get expenses by material for pie chart
  const getExpensesByMaterial = (): ExpensesByMaterial => {
    const expenses: ExpensesByMaterial = {};
    monthlyTransactions
      .filter((t: Transaction) => t.type === 'out')
      .forEach((transaction: Transaction) => {
        const material = transaction.material;
        expenses[material] = (expenses[material] || 0) + transaction.amount;
      });
    return expenses;
  };

  // Get expenses by project
  const getExpensesByProject = () => {
    const projectExpenses: { [key: string]: { in: number; out: number; balance: number } } = {};

    monthlyTransactions.forEach((transaction: Transaction) => {
      const projectName = transaction.project;
      if (!projectExpenses[projectName]) {
        projectExpenses[projectName] = { in: 0, out: 0, balance: 0 };
      }

      if (transaction.type === 'in') {
        projectExpenses[projectName].in += transaction.amount;
      } else {
        projectExpenses[projectName].out += transaction.amount;
      }
      projectExpenses[projectName].balance = projectExpenses[projectName].in - projectExpenses[projectName].out;
    });

    return Object.entries(projectExpenses)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.out - a.out);
  };

  // Get top parties (payers/payees)
  const getTopParties = () => {
    const parties: { [key: string]: { in: number; out: number; count: number } } = {};

    monthlyTransactions.forEach((transaction: Transaction) => {
      const partyName = transaction.partyName;
      if (!parties[partyName]) {
        parties[partyName] = { in: 0, out: 0, count: 0 };
      }

      if (transaction.type === 'in') {
        parties[partyName].in += transaction.amount;
      } else {
        parties[partyName].out += transaction.amount;
      }
      parties[partyName].count++;
    });

    return Object.entries(parties)
      .map(([name, data]) => ({ name, ...data, total: data.in + data.out }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5); // Top 5
  };

  const totals = calculateMonthlyTotals();
  const expensesByMaterial = getExpensesByMaterial();
  const expensesByProject = getExpensesByProject();
  const topParties = getTopParties();

  const pieChartData: PieChartDataItem[] = Object.entries(expensesByMaterial).map(
    ([material, amount], index): PieChartDataItem => ({
      name: material,
      amount: amount,
      color: CHART_COLORS[index % CHART_COLORS.length],
      legendFontColor: COLORS.TEXT_PRIMARY,
      legendFontSize: FONT_SIZE.sm,
    })
  );

  // Handle Excel export
  const handleExportExcel = async () => {
    if (monthlyTransactions.length === 0) {
      setErrorMessage('No transactions found for the selected month');
      setShowErrorModal(true);
      return;
    }

    setExportLoading(true);

    try {
      const [monthName, yearStr] = selectedMonthDisplay.split(' ');
      const year = parseInt(yearStr, 10);

      const result = await generateMonthlyExcelReport(
        monthlyTransactions,
        monthName,
        year
      );

      if (result.success) {
        setShowSuccessModal(true);
      } else {
        setErrorMessage(result.error || 'Failed to export report');
        setShowErrorModal(true);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred while exporting');
      setShowErrorModal(true);
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading reports..." />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <Card variant="elevated" style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="analytics" size={24} color={COLORS.WHITE} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Financial Reports</Text>
            <Text style={styles.headerSubtitle}>Monthly analytics and insights</Text>
          </View>
        </View>
      </Card>

      {/* Filters Section */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          {/* Month Filter */}
          <View style={styles.filterItem}>
            <Dropdown
              label="Period"
              value={selectedMonth}
              options={monthOptions}
              onSelect={setSelectedMonth}
              icon="calendar-outline"
            />
          </View>

          {/* Project Filter */}
          <View style={styles.filterItem}>
            <Dropdown
              label="Project"
              value={selectedProject}
              options={projectOptions}
              onSelect={setSelectedProject}
              icon="briefcase-outline"
            />
          </View>
        </View>
      </View>

      {/* Export Button */}
      {monthlyTransactions.length > 0 && (
        <View style={styles.exportButtonContainer}>
          <TouchableOpacity
            style={[styles.exportButton, exportLoading && styles.exportButtonDisabled]}
            onPress={handleExportExcel}
            disabled={exportLoading}
            activeOpacity={0.8}
          >
            <View style={styles.exportButtonContent}>
              <View style={styles.exportIconContainer}>
                <Ionicons name="document-text" size={24} color={COLORS.WHITE} />
              </View>
              <View style={styles.exportTextContainer}>
                <Text style={styles.exportButtonTitle}>
                  {exportLoading ? 'Generating Report...' : 'Export to Excel'}
                </Text>
                <Text style={styles.exportButtonSubtitle}>
                  Download monthly report as .xlsx file
                </Text>
              </View>
              <Ionicons
                name={exportLoading ? "hourglass-outline" : "download"}
                size={20}
                color={COLORS.WHITE}
              />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {monthlyTransactions.length === 0 ? (
        <EmptyState
          icon="bar-chart-outline"
          title="No data available"
          message={
            transactions.length === 0
              ? 'Start adding transactions to see reports'
              : 'No transactions found for this month'
          }
        />
      ) : (
        <>
          {/* Stats Cards Grid */}
          <View style={styles.statsSection}>
            <View style={styles.statsRow}>
              <Card variant="elevated" style={styles.statCard}>
                <Ionicons name="trending-up" size={24} color={COLORS.SUCCESS} />
                <Text style={styles.statValue}>{totals.incomeCount}</Text>
                <Text style={styles.statLabel}>Payments In</Text>
              </Card>

              <Card variant="elevated" style={styles.statCard}>
                <Ionicons name="trending-down" size={24} color={COLORS.ERROR} />
                <Text style={styles.statValue}>{totals.expenseCount}</Text>
                <Text style={styles.statLabel}>Payments Out</Text>
              </Card>
            </View>
          </View>

          {/* Summary Cards */}
          <View style={styles.summarySection}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="wallet" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.sectionTitle}>Financial Summary</Text>
            </View>

            <Card variant="elevated" style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelRow}>
                  <Ionicons name="arrow-down-circle" size={18} color={COLORS.SUCCESS} />
                  <Text style={styles.summaryLabel}>Total Income</Text>
                </View>
                <Text style={[styles.summaryValue, styles.incomeText]}>
                  {formatCurrency(totals.totalIn)}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryLabelRow}>
                  <Ionicons name="arrow-up-circle" size={18} color={COLORS.ERROR} />
                  <Text style={styles.summaryLabel}>Total Expenses</Text>
                </View>
                <Text style={[styles.summaryValue, styles.expenseText]}>
                  {formatCurrency(totals.totalOut)}
                </Text>
              </View>

              <View style={[styles.summaryRow, styles.balanceRow]}>
                <View style={styles.summaryLabelRow}>
                  <Ionicons
                    name={totals.balance >= 0 ? 'checkmark-circle' : 'alert-circle'}
                    size={18}
                    color={totals.balance >= 0 ? COLORS.SUCCESS : COLORS.ERROR}
                  />
                  <Text style={styles.balanceLabel}>Net Balance</Text>
                </View>
                <Text
                  style={[
                    styles.summaryValue,
                    styles.balanceValue,
                    totals.balance >= 0 ? styles.incomeText : styles.expenseText,
                  ]}
                >
                  {formatCurrency(totals.balance)}
                </Text>
              </View>
            </Card>
          </View>

          {/* Pie Chart for Expenses */}
          {pieChartData.length > 0 && (
            <View style={styles.chartSection}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="pie-chart" size={20} color={COLORS.PRIMARY} />
                <Text style={styles.sectionTitle}>Expense Distribution</Text>
              </View>

              <Card variant="elevated" style={styles.chartCard}>
                <CustomPieChart data={pieChartData} size={Math.min(width - 96, 240)} />
                <Text style={styles.chartNote}>
                  Tap on segments to see details
                </Text>
              </Card>
            </View>
          )}

          {/* Project-wise Breakdown */}
          {selectedProject === 'all' && expensesByProject.length > 0 && (
            <View style={styles.breakdownSection}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="briefcase" size={20} color={COLORS.PRIMARY} />
                <Text style={styles.sectionTitle}>Project-wise Analysis</Text>
              </View>

              {expensesByProject.map((project, index) => {
                const totalProjectAmount = project.in + project.out;
                const color = CHART_COLORS[index % CHART_COLORS.length];
                return (
                  <Card key={project.name} style={styles.materialCard}>
                    <View style={styles.materialHeader}>
                      <View style={styles.materialTitleRow}>
                        <View
                          style={[
                            styles.materialColorIndicator,
                            { backgroundColor: color },
                          ]}
                        />
                        <Text style={styles.materialName}>{project.name}</Text>
                      </View>
                      <View
                        style={[
                          styles.percentageBadge,
                          { backgroundColor: project.balance >= 0 ? COLORS.SUCCESS + '20' : COLORS.ERROR + '20' },
                        ]}
                      >
                        <Text style={[styles.percentageText, { color: project.balance >= 0 ? COLORS.SUCCESS : COLORS.ERROR }]}>
                          {project.balance >= 0 ? '+' : ''}{formatCurrency(project.balance)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.materialBody}>
                      <View style={styles.projectStatsRow}>
                        <View style={styles.projectStatItem}>
                          <Ionicons name="arrow-down-circle" size={16} color={COLORS.SUCCESS} />
                          <Text style={styles.projectStatLabel}>Income</Text>
                          <Text style={[styles.projectStatValue, { color: COLORS.SUCCESS }]}>
                            {formatCurrency(project.in)}
                          </Text>
                        </View>

                        <View style={styles.projectStatDivider} />

                        <View style={styles.projectStatItem}>
                          <Ionicons name="arrow-up-circle" size={16} color={COLORS.ERROR} />
                          <Text style={styles.projectStatLabel}>Expense</Text>
                          <Text style={[styles.projectStatValue, { color: COLORS.ERROR }]}>
                            {formatCurrency(project.out)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}

          {/* Top Parties */}
          {topParties.length > 0 && (
            <View style={styles.breakdownSection}>
              <View style={styles.sectionHeaderRow}>
                <Ionicons name="people" size={20} color={COLORS.PRIMARY} />
                <Text style={styles.sectionTitle}>Top Parties</Text>
              </View>

              {topParties.map((party, index) => (
                <Card key={party.name} style={styles.materialCard}>
                  <View style={styles.materialHeader}>
                    <View style={styles.materialTitleRow}>
                      <View style={styles.partyRank}>
                        <Text style={styles.partyRankText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.materialName}>{party.name}</Text>
                    </View>
                    <View style={styles.percentageBadge}>
                      <Text style={styles.percentageText}>
                        {party.count} txns
                      </Text>
                    </View>
                  </View>

                  <View style={styles.materialBody}>
                    <View style={styles.projectStatsRow}>
                      <View style={styles.projectStatItem}>
                        <Ionicons name="arrow-down" size={14} color={COLORS.SUCCESS} />
                        <Text style={[styles.projectStatValue, { color: COLORS.SUCCESS }]}>
                          {formatCurrency(party.in)}
                        </Text>
                      </View>

                      <View style={styles.projectStatDivider} />

                      <View style={styles.projectStatItem}>
                        <Ionicons name="arrow-up" size={14} color={COLORS.ERROR} />
                        <Text style={[styles.projectStatValue, { color: COLORS.ERROR }]}>
                          {formatCurrency(party.out)}
                        </Text>
                      </View>

                      <View style={styles.projectStatDivider} />

                      <View style={styles.projectStatItem}>
                        <Text style={styles.projectStatLabel}>Total</Text>
                        <Text style={styles.projectStatValue}>
                          {formatCurrency(party.total)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Card>
              ))}
            </View>
          )}

          {/* Material Breakdown */}
          <View style={styles.breakdownSection}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="list" size={20} color={COLORS.PRIMARY} />
              <Text style={styles.sectionTitle}>Detailed Breakdown</Text>
            </View>

            {Object.entries(expensesByMaterial).length === 0 ? (
              <EmptyState
                icon="cube-outline"
                title="No expenses"
                message="No expense data available for this period"
              />
            ) : (
              Object.entries(expensesByMaterial)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([material, amount], index) => {
                  const percentage = ((amount as number) / totals.totalOut) * 100;
                  const color = CHART_COLORS[index % CHART_COLORS.length];
                  return (
                    <Card key={material} style={styles.materialCard}>
                      <View style={styles.materialHeader}>
                        <View style={styles.materialTitleRow}>
                          <View
                            style={[
                              styles.materialColorIndicator,
                              { backgroundColor: color },
                            ]}
                          />
                          <Text style={styles.materialName}>{material}</Text>
                        </View>
                        <View
                          style={[
                            styles.percentageBadge,
                            { backgroundColor: color + '20' },
                          ]}
                        >
                          <Text style={[styles.percentageText, { color }]}>
                            {percentage.toFixed(1)}%
                          </Text>
                        </View>
                      </View>

                      <View style={styles.materialBody}>
                        <View style={styles.materialAmountRow}>
                          <Ionicons
                            name="cash-outline"
                            size={16}
                            color={COLORS.TEXT_SECONDARY}
                          />
                          <Text style={styles.materialAmount}>
                            {formatCurrency(amount as number)}
                          </Text>
                        </View>

                        {/* Progress Bar */}
                        <View style={styles.progressBarContainer}>
                          <View
                            style={[
                              styles.progressBar,
                              {
                                width: `${percentage}%`,
                                backgroundColor: color,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </Card>
                  );
                })
            )}
          </View>
        </>
      )}

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title="Export Complete!"
        message="Your Excel report has been saved successfully"
        onClose={() => setShowSuccessModal(false)}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        title="Export Failed"
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
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
  filtersContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterItem: {
    flex: 1,
  },
  projectStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  projectStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  projectStatLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
  projectStatValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
  },
  projectStatDivider: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.GREY_LIGHT,
  },
  partyRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  partyRankText: {
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  selectorCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  exportButtonContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  exportButton: {
    backgroundColor: COLORS.SUCCESS,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.SUCCESS,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  exportTextContainer: {
    flex: 1,
  },
  exportButtonTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 4,
  },
  exportButtonSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.WHITE,
    opacity: 0.9,
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
  statsSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.lg,
  },
  statValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 4,
    textAlign: 'center',
  },
  summarySection: {
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
  summaryCard: {
    padding: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GREY_LIGHT,
  },
  balanceRow: {
    borderBottomWidth: 0,
    paddingTop: SPACING.lg,
    marginTop: SPACING.xs,
  },
  summaryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.TEXT_SECONDARY,
  },
  balanceLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  summaryValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
  },
  balanceValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
  },
  incomeText: {
    color: COLORS.SUCCESS,
  },
  expenseText: {
    color: COLORS.ERROR,
  },
  chartSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  chartCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  chartNote: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.TEXT_SECONDARY,
    marginTop: SPACING.md,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  breakdownSection: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
  },
  materialCard: {
    marginBottom: SPACING.md,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  materialTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  materialColorIndicator: {
    width: 4,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
  },
  materialName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    flex: 1,
  },
  percentageBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  percentageText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  materialBody: {
    gap: SPACING.sm,
  },
  materialAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  materialAmount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: COLORS.GREY_LIGHT,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
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

export default ReportingScreen;
