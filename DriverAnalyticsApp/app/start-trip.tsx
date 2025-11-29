import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { startTrip } from '@/services/tripService';

export default function StartTripScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission is required to start a trip');
        return;
      }

      setPermissionGranted(true);
      
      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation);
    } catch (error: any) {
      setLocationError('Failed to get location: ' + error.message);
    }
  };

  const handleStartTrip = async () => {
    if (!token) {
      Alert.alert('Error', 'Not authenticated');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location not available. Please wait...');
      return;
    }

    setLoading(true);
    try {
      const result = await startTrip(
        location.coords.latitude,
        location.coords.longitude,
        'clear'
      );

      // Store trip ID in AsyncStorage
      await AsyncStorage.setItem('activeTripId', String(result.trip.trip_id));
      await AsyncStorage.setItem('tripDataPoints', JSON.stringify([]));

      // Navigate to live trip screen
      router.replace('/live-trip');
    } catch (error: any) {
      Alert.alert('Failed to start trip', error.message || 'Please try again');
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <BackHeader title="Start Trip" showHome />
      <ThemedView style={styles.header}>
        <ThemedText type="title">Start Trip</ThemedText>
        <ThemedText>Get ready to record your driving session</ThemedText>
      </ThemedView>

      {locationError ? (
        <ThemedView style={styles.errorCard}>
          <ThemedText style={styles.errorText}>{locationError}</ThemedText>
          <Pressable
            style={styles.retryButton}
            onPress={requestLocationPermission}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </Pressable>
        </ThemedView>
      ) : !permissionGranted ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>Requesting location permission...</ThemedText>
        </View>
      ) : location ? (
        <ThemedView style={styles.locationCard}>
          <ThemedText type="subtitle">Location Ready</ThemedText>
          <ThemedText style={styles.coords}>
            Lat: {location.coords.latitude.toFixed(6)}
          </ThemedText>
          <ThemedText style={styles.coords}>
            Lng: {location.coords.longitude.toFixed(6)}
          </ThemedText>
          <ThemedText style={styles.accuracy}>
            Accuracy: {location.coords.accuracy?.toFixed(0) || '—'} m
          </ThemedText>
        </ThemedView>
      ) : (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <ThemedText style={styles.loadingText}>Getting location...</ThemedText>
        </View>
      )}

      <Pressable
        style={[
          styles.startButton,
          (!location || loading) && styles.startButtonDisabled,
        ]}
        onPress={handleStartTrip}
        disabled={!location || loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <ThemedText style={styles.startButtonText}>START TRIP</ThemedText>
        )}
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    color: '#9ca3af',
  },
  errorCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#7f1d1d',
    marginBottom: 24,
  },
  errorText: {
    color: '#fca5a5',
    marginBottom: 12,
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  locationCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    marginBottom: 24,
  },
  coords: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  accuracy: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  startButton: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    marginBottom: 32,
  },
  startButtonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.5,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
});

