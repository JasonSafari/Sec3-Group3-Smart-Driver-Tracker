/**
 * Trip Map Component
 * Displays trip route on a map
 */

import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

// Try to import expo-maps, fallback to a simple view if not available
let MapView: any = null;
let Polyline: any = null;
let Marker: any = null;

try {
  const maps = require('expo-maps');
  MapView = maps.MapView;
  Polyline = maps.Polyline;
  Marker = maps.Marker;
} catch (e) {
  console.warn('expo-maps not available, map will show placeholder');
}

export type DataPoint = {
  latitude: number;
  longitude: number;
  speed?: number;
  acceleration?: number;
  timestamp?: string;
};

type TripMapProps = {
  dataPoints: DataPoint[];
  height?: number;
  showMarkers?: boolean;
};

export function TripMap({
  dataPoints,
  height = 300,
  showMarkers = true,
}: TripMapProps) {
  const [mapReady, setMapReady] = useState(false);

  if (!dataPoints || dataPoints.length === 0) {
    return (
      <ThemedView style={[styles.container, { height }]}>
        <ThemedText style={styles.emptyText}>No route data available</ThemedText>
      </ThemedView>
    );
  }

  // Get start and end points
  const startPoint = dataPoints[0];
  const endPoint = dataPoints[dataPoints.length - 1];
  const coordinates = dataPoints.map((dp) => ({
    latitude: dp.latitude,
    longitude: dp.longitude,
  }));

  // Calculate center point
  const centerLat =
    coordinates.reduce((sum, coord) => sum + coord.latitude, 0) /
    coordinates.length;
  const centerLng =
    coordinates.reduce((sum, coord) => sum + coord.longitude, 0) /
    coordinates.length;

  // Calculate region bounds
  const minLat = Math.min(...coordinates.map((c) => c.latitude));
  const maxLat = Math.max(...coordinates.map((c) => c.latitude));
  const minLng = Math.min(...coordinates.map((c) => c.longitude));
  const maxLng = Math.max(...coordinates.map((c) => c.longitude));

  const region = {
    latitude: centerLat,
    longitude: centerLng,
    latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.01),
    longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.01),
  };

  // Color code polyline based on speed
  const getSpeedColor = (speed: number = 0): string => {
    if (speed > 80) return '#ef4444'; // Red - speeding
    if (speed > 50) return '#f59e0b'; // Orange - fast
    return '#22c55e'; // Green - normal
  };

  // Group coordinates by speed for color coding (simplified - use average)
  const avgSpeed =
    dataPoints.reduce((sum, dp) => sum + (dp.speed || 0), 0) /
    dataPoints.length;
  const lineColor = getSpeedColor(avgSpeed);

  // If MapView is not available, show a placeholder
  if (!MapView) {
    return (
      <ThemedView style={[styles.container, { height }]}>
        <View style={styles.placeholder}>
          <ThemedText style={styles.placeholderText}>🗺️</ThemedText>
          <ThemedText style={styles.placeholderSubtext}>
            Map visualization
          </ThemedText>
          <ThemedText style={styles.placeholderInfo}>
            {dataPoints.length} data points
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { height }]}>
      <MapView
        style={styles.map}
        initialRegion={region}
        onMapReady={() => setMapReady(true)}
      >
        {/* Route polyline */}
        {mapReady && Polyline && (
          <>
            <Polyline
              coordinates={coordinates}
              strokeColor={lineColor}
              strokeWidth={4}
            />
            {/* Start marker */}
            {showMarkers && startPoint && Marker && (
              <Marker
                coordinate={{
                  latitude: startPoint.latitude,
                  longitude: startPoint.longitude,
                }}
                title="Start"
                pinColor="green"
              />
            )}
            {/* End marker */}
            {showMarkers && endPoint && startPoint !== endPoint && Marker && (
              <Marker
                coordinate={{
                  latitude: endPoint.latitude,
                  longitude: endPoint.longitude,
                }}
                title="End"
                pinColor="red"
              />
            )}
          </>
        )}
      </MapView>
      {!mapReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1f2937',
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    padding: 16,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111827',
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 4,
  },
  placeholderInfo: {
    fontSize: 12,
    color: '#6b7280',
  },
});

