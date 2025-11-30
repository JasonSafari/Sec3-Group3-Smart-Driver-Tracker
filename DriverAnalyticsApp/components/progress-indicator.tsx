/**
 * Progress Indicator Component
 * Shows progress toward a goal with visual indicator
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type ProgressIndicatorProps = {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: string;
  showPercentage?: boolean;
};

export function ProgressIndicator({
  label,
  current,
  target,
  unit = '',
  color = '#3b82f6',
  showPercentage = true,
}: ProgressIndicatorProps) {
  const percentage = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const isComplete = current >= target;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <ThemedText style={styles.value}>
          {current.toFixed(1)}{unit} / {target.toFixed(1)}{unit}
        </ThemedText>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: isComplete ? '#22c55e' : color,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <ThemedText style={styles.percentage}>
          {percentage.toFixed(0)}% complete
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#9ca3af',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});

