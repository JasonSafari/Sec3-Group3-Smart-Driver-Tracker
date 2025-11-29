import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';

type Trip = {
  trip_id: number;
  user_id: number;
  start_time: string | null;
  end_time: string | null;
  distance_km: string | null;
  avg_speed: string | null;
};

export default function TripsScreen() {
  const { token } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = async () => {
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch('http://localhost:3000/api/trips', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.error || data?.message || 'Failed to fetch trips';
        throw new Error(message);
      }

      setTrips(data.trips ?? []);
    } catch (err: any) {
      setError(err.message ?? 'Failed to fetch trips');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrips();
  };

  const renderItem = ({ item }: { item: Trip }) => {
    const date = item.start_time ? new Date(item.start_time) : null;
    return (
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle">
          {date ? date.toLocaleString() : 'Unknown start time'}
        </ThemedText>
        <ThemedText>
          Distance: {item.distance_km ?? '—'} km • Avg speed: {item.avg_speed ?? '—'} km/h
        </ThemedText>
      </ThemedView>
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#0f172a', dark: '#020617' }}
      headerImage={null}
    >
      <ThemedView style={styles.header}>
        <ThemedText type="title">My Trips</ThemedText>
        <ThemedText>Trips associated with your account.</ThemedText>
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
          <ThemedText type="subtitle">No trips yet</ThemedText>
          <ThemedText>
            Once you start recording trips from the backend or app, they will appear here.
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
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
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
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
});


