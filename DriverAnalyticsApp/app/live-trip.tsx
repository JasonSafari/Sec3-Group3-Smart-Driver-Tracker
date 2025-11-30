import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BackHeader } from '@/components/back-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { stopTrip, uploadDataPoints, type DataPoint } from '@/services/tripService';

export default function LiveTripScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [tripId, setTripId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [distance, setDistance] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [lastLocation, setLastLocation] = useState<Location.LocationObject | null>(null);
  
  // Use refs to track subscriptions (better for cleanup)
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const accelSubscriptionRef = useRef<Accelerometer.AccelerometerSubscription | null>(null);

  useEffect(() => {
    // Location tracking is not supported on web
    if (Platform.OS === 'web') {
      Alert.alert(
        'Not Supported',
        'Location tracking is only available on mobile devices. Please use the mobile app.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }

    let isMounted = true;
    let locSub: Location.LocationSubscription | null = null;
    let accelSub: Accelerometer.AccelerometerSubscription | null = null;

    const init = async () => {
      try {
        const storedTripId = await AsyncStorage.getItem('activeTripId');
        if (!storedTripId) {
          Alert.alert('Error', 'No active trip found');
          if (isMounted) router.back();
          return;
        }

        if (!isMounted) return;

        setTripId(parseInt(storedTripId));
        setStartTime(new Date());

        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Error', 'Location permission required');
          return;
        }

        if (!isMounted) return;

        // Start location tracking
        locSub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000, // Every 5 seconds
            distanceInterval: 10, // Every 10 meters
          },
          (newLocation) => {
            if (isMounted) {
              handleLocationUpdate(newLocation);
            }
          }
        );
        locationSubscriptionRef.current = locSub;

        // Start accelerometer
        Accelerometer.setUpdateInterval(1000); // Every 1 second
        accelSub = Accelerometer.addListener(({ x, y, z }) => {
          if (isMounted) {
            // Use z-axis for forward/backward acceleration (braking)
            const acceleration = -z * 9.81; // Convert to m/s²
            handleAccelerometerUpdate(acceleration);
          }
        });
        accelSubscriptionRef.current = accelSub;
      } catch (error: any) {
        if (isMounted) {
          Alert.alert('Error', error.message || 'Failed to start tracking');
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      // Cleanup subscriptions - use refs to ensure we have the latest values
      if (locSub && typeof locSub.remove === 'function') {
        try {
          locSub.remove();
        } catch (e) {
          console.warn('Error removing location subscription:', e);
        }
      }
      if (accelSub && typeof accelSub.remove === 'function') {
        try {
          accelSub.remove();
        } catch (e) {
          console.warn('Error removing accelerometer subscription:', e);
        }
      }
      // Also cleanup ref subscriptions
      if (locationSubscriptionRef.current && typeof locationSubscriptionRef.current.remove === 'function') {
        try {
          locationSubscriptionRef.current.remove();
        } catch (e) {
          console.warn('Error removing location subscription ref:', e);
        }
        locationSubscriptionRef.current = null;
      }
      if (accelSubscriptionRef.current && typeof accelSubscriptionRef.current.remove === 'function') {
        try {
          accelSubscriptionRef.current.remove();
        } catch (e) {
          console.warn('Error removing accelerometer subscription ref:', e);
        }
        accelSubscriptionRef.current = null;
      }
    };
  }, [router]);

  // Removed - now handled in useEffect

  const handleLocationUpdate = (newLocation: Location.LocationObject) => {
    setLocation(newLocation);
    
    // Calculate speed (convert m/s to km/h)
    if (newLocation.coords.speed !== null && newLocation.coords.speed !== undefined) {
      setCurrentSpeed(newLocation.coords.speed * 3.6); // m/s to km/h
    }

    // Calculate distance
    if (lastLocation) {
      const dist = calculateDistance(
        lastLocation.coords.latitude,
        lastLocation.coords.longitude,
        newLocation.coords.latitude,
        newLocation.coords.longitude
      );
      setDistance((prev) => prev + dist);
    }

    setLastLocation(newLocation);
  };

  const handleAccelerometerUpdate = (acceleration: number) => {
    // Store data point with current location
    if (location) {
      const newDataPoint: DataPoint = {
        timestamp: new Date().toISOString(),
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        speed: currentSpeed,
        acceleration: acceleration,
      };

      setDataPoints((prev) => [...prev, newDataPoint]);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getDuration = () => {
    if (!startTime) return '0:00';
    const seconds = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStopTrip = async () => {
    if (!tripId || !token) {
      Alert.alert('Error', 'Missing trip ID or authentication');
      return;
    }

    Alert.alert(
      'Stop Trip',
      `Stop recording? You've collected ${dataPoints.length} data points.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Stop subscriptions using refs
              if (locationSubscriptionRef.current && typeof locationSubscriptionRef.current.remove === 'function') {
                try {
                  locationSubscriptionRef.current.remove();
                } catch (e) {
                  console.warn('Error removing location subscription:', e);
                }
                locationSubscriptionRef.current = null;
              }
              if (accelSubscriptionRef.current && typeof accelSubscriptionRef.current.remove === 'function') {
                try {
                  accelSubscriptionRef.current.remove();
                } catch (e) {
                  console.warn('Error removing accelerometer subscription:', e);
                }
                accelSubscriptionRef.current = null;
              }

              // Get final location
              const finalLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
              });

              // Upload all data points
              if (dataPoints.length > 0) {
                await uploadDataPoints(tripId, dataPoints);
              }

              // Stop trip
              const result = await stopTrip(
                tripId,
                finalLocation.coords.latitude,
                finalLocation.coords.longitude
              );

              // Clear stored trip data
              await AsyncStorage.multiRemove(['activeTripId', 'tripDataPoints']);

              // Navigate to score result
              router.replace({
                pathname: '/score-result',
                params: {
                  tripId: String(tripId),
                  score: String(result.score.overall_score),
                  speedScore: String(result.score.speed_score),
                  brakeScore: String(result.score.brake_score),
                  distance: distance.toFixed(2),
                  duration: getDuration(),
                },
              });
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to stop trip');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <BackHeader title="Trip in Progress" />
      <ThemedView style={styles.header}>
        <ThemedText type="title">Trip in Progress</ThemedText>
        <ThemedText style={styles.timer}>{getDuration()}</ThemedText>
      </ThemedView>

      {/* Stats */}
      <ThemedView style={styles.statsCard}>
        <ThemedView style={styles.statRow}>
          <ThemedText style={styles.statLabel}>Distance</ThemedText>
          <ThemedText style={styles.statValue}>{distance.toFixed(2)} km</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statRow}>
          <ThemedText style={styles.statLabel}>Current Speed</ThemedText>
          <ThemedText style={styles.statValue}>
            {currentSpeed.toFixed(0)} km/h
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.statRow}>
          <ThemedText style={styles.statLabel}>Data Points</ThemedText>
          <ThemedText style={styles.statValue}>{dataPoints.length}</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Location Info */}
      {location && (
        <ThemedView style={styles.locationCard}>
          <ThemedText style={styles.locationText}>
            Lat: {location.coords.latitude.toFixed(6)}
          </ThemedText>
          <ThemedText style={styles.locationText}>
            Lng: {location.coords.longitude.toFixed(6)}
          </ThemedText>
        </ThemedView>
      )}

      {/* Stop Button */}
      <Pressable
        style={[styles.stopButton, loading && styles.stopButtonDisabled]}
        onPress={handleStopTrip}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <ThemedText style={styles.stopButtonText}>STOP TRIP</ThemedText>
        )}
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginTop: 16,
    marginBottom: 32,
    alignItems: 'center',
    paddingTop: 8,
  },
  timer: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700',
    marginTop: 16,
    color: '#22c55e',
    overflow: 'visible',
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  statLabel: {
    fontSize: 16,
    color: '#9ca3af',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  locationCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    marginBottom: 24,
  },
  locationText: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  stopButton: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 32,
  },
  stopButtonDisabled: {
    opacity: 0.5,
  },
  stopButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
});

