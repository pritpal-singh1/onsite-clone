import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as XLSX from 'xlsx';
import { Transaction, ExcelExportResult, MonthlyTotals, MaterialBreakdownItem } from '../types';
import { COLORS } from '../constants';
import { format } from 'date-fns';

/**
 * Service for Excel report generation and export
 */

/**
 * Calculate monthly totals from transactions
 */
const calculateMonthlyTotals = (transactions: Transaction[]): MonthlyTotals => {
  const totals = transactions.reduce(
    (acc, t) => {
      if (t.type === 'in') {
        acc.totalIn += t.amount;
        acc.incomeCount++;
      } else {
        acc.totalOut += t.amount;
        acc.expenseCount++;
      }
      acc.transactionCount++;
      return acc;
    },
    {
      totalIn: 0,
      totalOut: 0,
      balance: 0,
      transactionCount: 0,
      incomeCount: 0,
      expenseCount: 0,
    }
  );

  totals.balance = totals.totalIn - totals.totalOut;
  return totals;
};

/**
 * Calculate material breakdown from transactions
 */
const calculateMaterialBreakdown = (
  transactions: Transaction[]
): MaterialBreakdownItem[] => {
  const materialMap = new Map<string, { amount: number; count: number }>();

  // Only include outgoing transactions for material breakdown
  transactions
    .filter((t) => t.type === 'out')
    .forEach((t) => {
      const existing = materialMap.get(t.material) || { amount: 0, count: 0 };
      materialMap.set(t.material, {
        amount: existing.amount + t.amount,
        count: existing.count + 1,
      });
    });

  const totalExpense = Array.from(materialMap.values()).reduce(
    (sum, item) => sum + item.amount,
    0
  );

  return Array.from(materialMap.entries())
    .map(([material, data]) => ({
      material,
      amount: data.amount,
      percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);
};

/**
 * Create Summary sheet
 */
const createSummarySheet = (
  totals: MonthlyTotals,
  month: string,
  year: number
): XLSX.WorkSheet => {
  const data = [
    ['Monthly Report Summary'],
    [''],
    ['Report Period:', `${month} ${year}`],
    ['Generated On:', format(new Date(), 'dd MMM yyyy, hh:mm a')],
    [''],
    ['Financial Overview'],
    ['Total Income:', totals.totalIn],
    ['Total Expenses:', totals.totalOut],
    ['Net Balance:', totals.balance],
    [''],
    ['Transaction Statistics'],
    ['Total Transactions:', totals.transactionCount],
    ['Income Transactions:', totals.incomeCount],
    ['Expense Transactions:', totals.expenseCount],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws['!cols'] = [{ wch: 25 }, { wch: 20 }];

  return ws;
};

/**
 * Create Material Breakdown sheet
 */
const createMaterialBreakdownSheet = (
  breakdown: MaterialBreakdownItem[]
): XLSX.WorkSheet => {
  const headers = [['Material', 'Amount', 'Percentage', 'Transaction Count']];

  const rows = breakdown.map((item) => [
    item.material,
    item.amount,
    `${item.percentage.toFixed(1)}%`,
    item.count,
  ]);

  const data = [...headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 18 }];

  return ws;
};

/**
 * Create Transaction Details sheet
 */
const createTransactionDetailsSheet = (
  transactions: Transaction[]
): XLSX.WorkSheet => {
  const headers = [
    ['Date', 'Type', 'Party Name', 'Material', 'Project', 'Amount'],
  ];

  // Sort by date (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const rows = sortedTransactions.map((t) => [
    format(new Date(t.date), 'dd MMM yyyy'),
    t.type === 'in' ? 'Payment In' : 'Payment Out',
    t.partyName,
    t.material,
    t.project,
    t.amount,
  ]);

  const data = [...headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws['!cols'] = [
    { wch: 15 }, // Date
    { wch: 15 }, // Type
    { wch: 25 }, // Party Name
    { wch: 20 }, // Material
    { wch: 25 }, // Project
    { wch: 15 }, // Amount
  ];

  return ws;
};

/**
 * Generate monthly Excel report
 */
export const generateMonthlyExcelReport = async (
  transactions: Transaction[],
  month: string,
  year: number
): Promise<ExcelExportResult> => {
  try {
    // Validate transactions
    if (!transactions || transactions.length === 0) {
      return {
        success: false,
        error: 'No transactions found for the selected month',
      };
    }

    // Calculate totals and breakdowns
    const totals = calculateMonthlyTotals(transactions);
    const materialBreakdown = calculateMaterialBreakdown(transactions);

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create sheets
    const summarySheet = createSummarySheet(totals, month, year);
    const materialSheet = createMaterialBreakdownSheet(materialBreakdown);
    const detailsSheet = createTransactionDetailsSheet(transactions);

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
    XLSX.utils.book_append_sheet(wb, materialSheet, 'Material Breakdown');
    XLSX.utils.book_append_sheet(wb, detailsSheet, 'Transaction Details');

    // Generate Excel file
    const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

    // Save to file system
    const fileName = `Payment_Report_${month}_${year}.xlsx`;
    const fileUri = FileSystem.cacheDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, wbout, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Check if sharing is available
    const isSharingAvailable = await Sharing.isAvailableAsync();
    if (!isSharingAvailable) {
      return {
        success: false,
        error: 'Sharing is not available on this device',
      };
    }

    // Share the file
    await Sharing.shareAsync(fileUri, {
      mimeType:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Save Excel Report',
      UTI: 'com.microsoft.excel.xlsx',
    });

    return {
      success: true,
      fileUri,
    };
  } catch (error) {
    console.error('Excel export error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to generate Excel report',
    };
  }
};

/**
 * Format currency for Excel display
 */
export const formatCurrencyForExcel = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};
