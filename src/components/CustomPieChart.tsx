import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';

interface PieChartData {
  name: string;
  amount: number;
  color: string;
}

interface CustomPieChartProps {
  data: PieChartData[];
  size?: number;
  onSlicePress?: (item: PieChartData, index: number) => void;
}

const CustomPieChart: React.FC<CustomPieChartProps> = ({ 
  data, 
  size = 240,
  onSlicePress 
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) - 10;
  const innerRadius = radius * 0.55; // Donut hole

  const createPieSlice = (startAngle: number, endAngle: number, color: string, isSelected: boolean) => {
    const currentRadius = isSelected ? radius + 8 : radius;

    // Special case: If it's a complete circle (360 degrees or close to it)
    const angleDiff = endAngle - startAngle;
    if (angleDiff >= 359.9) {
      // Draw two semicircles to create a full donut ring
      const pathData = [
        `M ${centerX} ${centerY - currentRadius}`,
        `A ${currentRadius} ${currentRadius} 0 1 1 ${centerX} ${centerY + currentRadius}`,
        `A ${currentRadius} ${currentRadius} 0 1 1 ${centerX} ${centerY - currentRadius}`,
        `M ${centerX} ${centerY - innerRadius}`,
        `A ${innerRadius} ${innerRadius} 0 1 0 ${centerX} ${centerY + innerRadius}`,
        `A ${innerRadius} ${innerRadius} 0 1 0 ${centerX} ${centerY - innerRadius}`,
        'Z'
      ].join(' ');
      return pathData;
    }

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + currentRadius * Math.cos(startAngleRad);
    const y1 = centerY + currentRadius * Math.sin(startAngleRad);
    const x2 = centerX + currentRadius * Math.cos(endAngleRad);
    const y2 = centerY + currentRadius * Math.sin(endAngleRad);

    const x3 = centerX + innerRadius * Math.cos(endAngleRad);
    const y3 = centerY + innerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(startAngleRad);
    const y4 = centerY + innerRadius * Math.sin(startAngleRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${currentRadius} ${currentRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');

    return pathData;
  };

  const handleSlicePress = (item: PieChartData, index: number) => {
    setSelectedIndex(selectedIndex === index ? null : index);
    onSlicePress?.(item, index);
  };

  const getSliceTouchArea = (startAngle: number, endAngle: number) => {
    const midAngle = (startAngle + endAngle) / 2;
    const midAngleRad = (midAngle * Math.PI) / 180;
    const touchRadius = (radius + innerRadius) / 2;
    
    const x = centerX + touchRadius * Math.cos(midAngleRad);
    const y = centerY + touchRadius * Math.sin(midAngleRad);
    
    return { x, y };
  };

  let currentAngle = -90; // Start from top
  const selectedItem = selectedIndex !== null ? data[selectedIndex] : null;
  
  // First pass: calculate slice data
  const slicesData = data.map((item, index) => {
    const percentage = (item.amount / total);
    const angle = percentage * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    const isSelected = selectedIndex === index;
    
    const pathData = createPieSlice(startAngle, endAngle, item.color, isSelected);
    const touchArea = getSliceTouchArea(startAngle, endAngle);
    
    currentAngle = endAngle;
    
    return {
      item,
      index,
      pathData,
      isSelected,
      startAngle,
      endAngle,
      touchArea,
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G>
          {slicesData.map((slice) => (
            <Path
              key={slice.index}
              d={slice.pathData}
              fill={slice.item.color}
              stroke="#fff"
              strokeWidth={2}
              opacity={selectedIndex === null || slice.isSelected ? 1 : 0.6}
              onPress={() => handleSlicePress(slice.item, slice.index)}
            />
          ))}
          {/* Center circle for donut effect */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={innerRadius - 2}
            fill="#f8f9fa"
          />
        </G>
      </Svg>
      
      {/* Invisible touchable overlays */}
      {slicesData.map((slice) => {
        const angleSpan = slice.endAngle - slice.startAngle;
        const touchSize = Math.max(60, (angleSpan / 360) * size);
        
        return (
          <Pressable
            key={`touch-${slice.index}`}
            onPress={() => handleSlicePress(slice.item, slice.index)}
            style={[
              styles.touchOverlay,
              {
                left: slice.touchArea.x - touchSize / 2,
                top: slice.touchArea.y - touchSize / 2,
                width: touchSize,
                height: touchSize,
              },
            ]}
          />
        );
      })}
      
      <View style={styles.centerLabel} pointerEvents="none">
        {selectedItem ? (
          <>
            <Text style={styles.selectedMaterial} numberOfLines={2}>
              {selectedItem.name}
            </Text>
            <Text style={styles.selectedAmount}>
              ₹{selectedItem.amount.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.selectedPercentage}>
              {((selectedItem.amount / total) * 100).toFixed(1)}%
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Expenses</Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 10,
  },
  touchOverlay: {
    position: 'absolute',
    borderRadius: 100,
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    maxWidth: '60%',
  },
  totalLabel: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 17,
    color: '#1a1a1a',
    fontWeight: 'bold',
    marginTop: 4,
  },
  selectedMaterial: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  selectedAmount: {
    fontSize: 20,
    color: '#1a1a1a',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedPercentage: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '700',
  },
});

export default CustomPieChart;
