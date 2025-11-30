import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { fetchFamilyTrips, type Trip } from '@/utils/api';
import { deleteTrip } from '@/services/tripService';

export default function FamilyTripsScreen() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState(0);

  const loadFamilyTrips = async () => {
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    if (user?.role !== 'parent') {
      setError('Only parents can view family trips');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await fetchFamilyTrips(token);
      setTrips(data.trips ?? []);
      setFamilyMembers(data.family_members ?? 0);
    } catch (err: any) {
      setError(err.message ?? 'Failed to fetch family trips');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFamilyTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    loadFamilyTrips();
  };

  const handleDeleteTrip = async (tripId: number, driverName: string) => {
    Alert.alert(
      'Delete Trip',
      `Are you sure you want to delete ${driverName}'s trip? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTrip(tripId);
              // Reload trips after deletion
              loadFamilyTrips();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete trip');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Trip }) => {
    const date = item.start_time ? new Date(item.start_time) : null;
    const score = item.score?.overall_score;
    const isValidScore = typeof score === 'number' && !isNaN(score);
    const driverName = item.user?.name || 'Unknown';

    return (
      <ThemedView style={styles.card}>
        <Pressable
          onPress={() => router.push(`/trip-details?id=${item.trip_id}`)}
          style={styles.cardContent}
        >
          <View style={styles.cardInfo}>
            <ThemedText type="subtitle">
              {driverName} • {date ? date.toLocaleString() : 'Unknown start time'}
            </ThemedText>
            <ThemedText>
              Distance: {item.distance_km ?? '—'} km • Avg speed: {item.avg_speed ?? '—'} km/h
            </ThemedText>
            {isValidScore && (
              <ThemedText style={styles.score}>
                Score: {score.toFixed(1)}/100
              </ThemedText>
            )}
          </View>
        </Pressable>
        <Pressable
          style={styles.deleteButton}
          onPress={() => handleDeleteTrip(item.trip_id, driverName)}
        >
          <ThemedText style={styles.deleteButtonText}>Delete</ThemedText>
        </Pressable>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Family Trips</ThemedText>
        <ThemedText>
          Viewing trips from {familyMembers} family member{familyMembers !== 1 ? 's' : ''}
        </ThemedText>
      </ThemedView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <ThemedView style={styles.center}>
          <ThemedText type="subtitle">Error</ThemedText>
          <ThemedText>{error}</ThemedText>
        </ThemedView>
      ) : trips.length === 0 ? (
        <ThemedView style={styles.center}>
          <ThemedText type="subtitle">No family trips yet</ThemedText>
          <ThemedText>
            Family members' trips will appear here once they start recording trips.
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(t) => String(t.trip_id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    gap: 6,
    marginBottom: 16,
  },
  center: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 8,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardInfo: {
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  score: {
    marginTop: 4,
    color: '#3b82f6',
    fontWeight: '600',
  },
});

