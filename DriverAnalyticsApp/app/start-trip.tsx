import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { Toast } from '@/components/toast';
import { getUserFriendlyError, getSuccessMessage } from '@/utils/errorMessages';

export default function StartTripScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'error') => {
    setToast({ message, type });
    setShowToast(true);
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission is required to start a trip');
        showToastMessage('Location permission is required. Please enable it in settings.', 'warning');
        return;
      }

      setPermissionGranted(true);
      setLocationError(null);
      
      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation(currentLocation);
    } catch (error: any) {
      const friendlyError = getUserFriendlyError(error);
      setLocationError(friendlyError);
      showToastMessage(friendlyError, 'error');
    }
  };

  const handleStartTrip = async () => {
    if (!token) {
      showToastMessage('Please log in to start a trip', 'error');
      return;
    }

    if (!location) {
      showToastMessage('Location not available. Please wait for GPS to connect...', 'warning');
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

      showToastMessage(getSuccessMessage('tripStart'), 'success');
      
      // Navigate to live trip screen after short delay
      setTimeout(() => {
        router.replace('/live-trip');
      }, 500);
    } catch (error: any) {
      const friendlyError = getUserFriendlyError(error);
      showToastMessage(friendlyError, 'error');
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'error'}
        visible={showToast}
        onHide={() => setShowToast(false)}
      />
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

