import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { getUserStats } from '@/services/analyticsService';
import { getUserTrips, type Trip } from '@/services/tripService';

export default function TeenDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!token) return;

    try {
      const [statsData, tripsData] = await Promise.all([
        getUserStats(),
        getUserTrips({ limit: 5 }),
      ]);
      setStats(statsData.stats);
      setRecentTrips(tripsData.trips || []);
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      // Check if it's an auth error (session expired, not authenticated)
      const errorMessage = error?.message || '';
      if (
        errorMessage.includes('Session expired') ||
        errorMessage.includes('Not authenticated') ||
        errorMessage.includes('Please login again')
      ) {
        // Redirect to login on auth failure
        router.replace('/login');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Don't load data while auth is still loading
    if (authLoading) return;
    // Only load if we have a token
    if (token) {
      loadData();
    } else {
      // No token, redirect to login
      router.replace('/login');
    }
  }, [token, authLoading]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#22c55e'; // green
    if (score >= 70) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </ThemedView>
    );
  }

  const overallScore = stats?.averageScore || 0;
  const scoreColor = getScoreColor(overallScore);

  return (
    <ThemedView style={styles.container}>
      {/* No header on dashboard - it's already home */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Welcome, {user?.name}</ThemedText>
        <ThemedText>Your driving dashboard</ThemedText>
      </ThemedView>

      {/* Overall Score Card */}
      <ThemedView style={styles.scoreCard}>
        <ThemedText style={styles.scoreLabel}>Overall Score</ThemedText>
        <ThemedText style={[styles.scoreValue, { color: scoreColor }]}>
          {overallScore.toFixed(1)}/100
        </ThemedText>
      </ThemedView>

      {/* Quick Stats */}
      <ThemedView style={styles.statsRow}>
        <ThemedView style={styles.statCard}>
          <ThemedText style={styles.statValue}>{stats?.totalTrips || 0}</ThemedText>
          <ThemedText style={styles.statLabel}>Total Trips</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statCard}>
          <ThemedText style={styles.statValue}>
            {stats?.totalDistance?.toFixed(1) || '0'} km
          </ThemedText>
          <ThemedText style={styles.statLabel}>Total Distance</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statCard}>
          <ThemedText style={[styles.statValue, { color: scoreColor }]}>
            {overallScore.toFixed(1)}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Avg Score</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push('/start-trip')}
        >
          <ThemedText style={styles.buttonText}>Start Trip</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/(tabs)/trips')}
        >
          <ThemedText style={styles.secondaryButtonText}>View All Trips</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: '#dc2626', marginTop: 8 }]}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <ThemedText style={styles.buttonText}>Profile & Logout</ThemedText>
        </Pressable>
      </View>

      {/* Recent Trips */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Recent Trips</ThemedText>
        {recentTrips.length === 0 ? (
          <ThemedText style={styles.emptyText}>No trips yet. Start your first trip!</ThemedText>
        ) : (
          <FlatList
            data={recentTrips}
            keyExtractor={(t) => String(t.trip_id)}
            renderItem={({ item }) => {
              const date = item.start_time ? new Date(item.start_time) : null;
              const score = item.score?.overall_score;
              const isValidScore = typeof score === 'number' && !isNaN(score);
              return (
                <Pressable
                  onPress={() => router.push(`/trip-details?id=${item.trip_id}`)}
                >
                  <ThemedView style={styles.tripCard}>
                    <ThemedText>
                      {date ? date.toLocaleDateString() : 'Unknown date'}
                    </ThemedText>
                    <ThemedText>
                      {item.distance_km || '—'} km • {item.avg_speed || '—'} km/h
                    </ThemedText>
                    {isValidScore && (
                      <ThemedText
                        style={[styles.tripScore, { color: getScoreColor(score) }]}
                      >
                        Score: {score.toFixed(1)}/100
                      </ThemedText>
                    )}
                  </ThemedView>
                </Pressable>
              );
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
  },
  scoreCard: {
    paddingTop: 32,
    overflow: 'visible',
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 8,
  },
  scoreValue: {
    lineHeight: 56,
    fontSize: 48,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#374151',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#e5e5e5',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: 8,
  },
  emptyText: {
    color: '#9ca3af',
    marginTop: 8,
  },
  tripCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#1f2937',
    marginTop: 8,
  },
  tripScore: {
    marginTop: 4,
    fontWeight: '600',
  },
});

