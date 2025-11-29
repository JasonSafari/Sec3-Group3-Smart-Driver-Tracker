import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { fetchRouteAnalysis, fetchRouteHeatMap, type RouteAnalysis } from '@/utils/api';

export default function TripDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const [analysis, setAnalysis] = useState<RouteAnalysis | null>(null);
  const [heatMap, setHeatMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !token) return;

    const loadData = async () => {
      try {
        setError(null);
        const [analysisData, heatMapData] = await Promise.all([
          fetchRouteAnalysis(token, parseInt(id)),
          fetchRouteHeatMap(token, parseInt(id)),
        ]);
        setAnalysis(analysisData.analysis);
        setHeatMap(heatMapData);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load trip details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, token]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.center}>
          <ThemedText type="subtitle">Error</ThemedText>
          <ThemedText>{error}</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title">Trip Analysis</ThemedText>

        {analysis && (
          <>
            {/* Route Statistics */}
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle">Route Statistics</ThemedText>
              <ThemedView style={styles.statRow}>
                <ThemedText>Total Distance:</ThemedText>
                <ThemedText style={styles.statValue}>
                  {analysis.total_distance_km.toFixed(2)} km
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.statRow}>
                <ThemedText>Duration:</ThemedText>
                <ThemedText style={styles.statValue}>
                  {analysis.duration_minutes} minutes
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.statRow}>
                <ThemedText>Average Speed:</ThemedText>
                <ThemedText style={styles.statValue}>
                  {analysis.average_speed.toFixed(1)} km/h
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.statRow}>
                <ThemedText>Max Speed:</ThemedText>
                <ThemedText style={styles.statValue}>
                  {analysis.max_speed.toFixed(1)} km/h
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.statRow}>
                <ThemedText>Route Efficiency:</ThemedText>
                <ThemedText style={[styles.statValue, styles.efficiency]}>
                  {analysis.route_efficiency}/100
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Speed Segments */}
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle">Speed Segments</ThemedText>
              <ThemedView style={styles.statRow}>
                <ThemedText>Low (&lt;30 km/h):</ThemedText>
                <ThemedText style={styles.statValue}>
                  {analysis.speed_segments.low} points
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.statRow}>
                <ThemedText>Medium (30-50 km/h):</ThemedText>
                <ThemedText style={styles.statValue}>
                  {analysis.speed_segments.medium} points
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.statRow}>
                <ThemedText>High (50-80 km/h):</ThemedText>
                <ThemedText style={styles.statValue}>
                  {analysis.speed_segments.high} points
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.statRow}>
                <ThemedText>Very High (&gt;80 km/h):</ThemedText>
                <ThemedText style={styles.statValue}>
                  {analysis.speed_segments.very_high} points
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Acceleration Segments */}
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle">Acceleration Segments</ThemedText>
              <ThemedView style={styles.statRow}>
                <ThemedText>Harsh Braking:</ThemedText>
                <ThemedText style={[styles.statValue, styles.warning]}>
                  {analysis.acceleration_segments.harsh_braking} points
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.statRow}>
                <ThemedText>Normal Braking:</ThemedText>
                <ThemedText style={styles.statValue}>
                  {analysis.acceleration_segments.normal_braking} points
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.statRow}>
                <ThemedText>Cruising:</ThemedText>
                <ThemedText style={styles.statValue}>
                  {analysis.acceleration_segments.cruising} points
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.statRow}>
                <ThemedText>Accelerating:</ThemedText>
                <ThemedText style={styles.statValue}>
                  {analysis.acceleration_segments.accelerating} points
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Heat Map Info */}
            {heatMap && (
              <ThemedView style={styles.section}>
                <ThemedText type="subtitle">Heat Map Data</ThemedText>
                <ThemedText>
                  {heatMap.heat_map?.length || 0} data points available for visualization
                </ThemedText>
                <ThemedText style={styles.info}>
                  Speeding instances: {heatMap.statistics?.speeding_points || 0}
                </ThemedText>
                <ThemedText style={styles.info}>
                  Harsh braking: {heatMap.statistics?.harsh_braking_points || 0}
                </ThemedText>
              </ThemedView>
            )}
          </>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statValue: {
    fontWeight: '600',
  },
  efficiency: {
    color: '#10b981',
  },
  warning: {
    color: '#ef4444',
  },
  info: {
    marginTop: 4,
    fontSize: 12,
    color: '#9ca3af',
  },
});

