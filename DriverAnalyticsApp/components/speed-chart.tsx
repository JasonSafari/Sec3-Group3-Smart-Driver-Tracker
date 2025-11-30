/**
 * Speed Chart Component
 * Displays speed over time using React Native components
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

export type ChartDataPoint = {
  timestamp: string | Date;
  speed: number;
  acceleration?: number;
};

type SpeedChartProps = {
  data: ChartDataPoint[];
  height?: number;
};

export function SpeedChart({ data, height = 200 }: SpeedChartProps) {
  if (!data || data.length === 0) {
    return (
      <ThemedView style={[styles.container, { height }]}>
        <ThemedText style={styles.emptyText}>No speed data available</ThemedText>
      </ThemedView>
    );
  }

  const screenWidth = Dimensions.get('window').width - 64;
  const chartHeight = height - 80;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = screenWidth - padding.left - padding.right;
  const chartAreaHeight = chartHeight - padding.top - padding.bottom;

  // Calculate min/max for scaling
  const speeds = data.map((point) => point.speed || 0);
  const maxSpeed = Math.max(...speeds, 1);
  const minSpeed = Math.min(...speeds, 0);
  const speedRange = maxSpeed - minSpeed || 1;

  // Generate Y-axis labels
  const yAxisSteps = 5;
  const yAxisLabels = Array.from({ length: yAxisSteps + 1 }, (_, i) => {
    const value = minSpeed + speedRange * (i / yAxisSteps);
    return value;
  });

  // Calculate bar positions
  const barWidth = Math.max(2, chartWidth / data.length - 1);
  const bars = data.map((point, index) => {
    const speed = point.speed || 0;
    const normalizedSpeed = (speed - minSpeed) / speedRange;
    const barHeight = normalizedSpeed * chartAreaHeight;
    const x = padding.left + (index / (data.length - 1 || 1)) * chartWidth;
    const y = padding.top + chartAreaHeight - barHeight;
    
    // Color based on speed
    let color = '#22c55e'; // Green - normal
    if (speed > 80) color = '#ef4444'; // Red - speeding
    else if (speed > 50) color = '#f59e0b'; // Orange - fast
    
    return { x, y, height: barHeight, color, speed };
  });

  return (
    <ThemedView style={[styles.container, { height }]}>
      <ThemedText type="subtitle" style={styles.title}>
        Speed Over Time
      </ThemedText>
      <View style={styles.chartContainer}>
        <View style={[styles.chart, { width: screenWidth, height: chartHeight }]}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            {yAxisLabels.map((value, i) => {
              const y = padding.top + chartAreaHeight - (i / yAxisSteps) * chartAreaHeight;
              return (
                <View key={`y-${i}`} style={[styles.yLabel, { top: y - 8 }]}>
                  <ThemedText style={styles.yLabelText}>{value.toFixed(0)}</ThemedText>
                </View>
              );
            })}
          </View>

          {/* Chart area */}
          <View style={[styles.chartArea, { 
            width: chartWidth, 
            height: chartAreaHeight,
            left: padding.left,
            top: padding.top,
          }]}>
            {/* Grid lines */}
            {yAxisLabels.map((_, i) => {
              const y = (i / yAxisSteps) * chartAreaHeight;
              return (
                <View
                  key={`grid-${i}`}
                  style={[styles.gridLine, { top: y }]}
                />
              );
            })}

            {/* Speed bars */}
            {bars.map((bar, index) => (
              <View
                key={`bar-${index}`}
                style={[
                  styles.bar,
                  {
                    left: bar.x - padding.left - barWidth / 2,
                    bottom: 0,
                    width: barWidth,
                    height: bar.height,
                    backgroundColor: bar.color,
                  },
                ]}
              />
            ))}
          </View>

          {/* X-axis label */}
          <View style={[styles.xAxisLabel, { bottom: 10 }]}>
            <ThemedText style={styles.axisLabelText}>Time</ThemedText>
          </View>

          {/* Y-axis label */}
          <View style={[styles.yAxisLabel, { left: 10, top: chartHeight / 2 - 30 }]}>
            <ThemedText style={styles.axisLabelText}>Speed (km/h)</ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1f2937',
  },
  title: {
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    position: 'relative',
  },
  yAxis: {
    position: 'absolute',
    left: 0,
    width: 40,
    height: '100%',
  },
  yLabel: {
    position: 'absolute',
    right: 8,
  },
  yLabelText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  chartArea: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#374151',
    opacity: 0.3,
  },
  bar: {
    position: 'absolute',
    borderRadius: 1,
  },
  xAxisLabel: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -20 }],
  },
  yAxisLabel: {
    position: 'absolute',
    width: 80,
    transform: [{ rotate: '-90deg' }],
  },
  axisLabelText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    padding: 16,
  },
});

