/**
 * Chart UI Types
 * Type definitions for chart components
 */

/**
 * Pie chart data item interface
 */
export interface PieChartDataItem {
  name: string;
  amount: number;
  color: string;
  legendFontColor?: string;
  legendFontSize?: number;
}

/**
 * Custom pie chart props interface
 */
export interface CustomPieChartProps {
  data: PieChartDataItem[];
  size?: number;
  onSlicePress?: (item: PieChartDataItem, index: number) => void;
}

/**
 * Chart configuration
 */
export interface ChartConfig {
  width: number;
  height: number;
  colors: string[];
  showLegend?: boolean;
  showLabels?: boolean;
}
