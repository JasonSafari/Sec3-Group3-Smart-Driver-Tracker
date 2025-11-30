import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { getUserStats } from '@/services/analyticsService';
import { getUserTrips, type Trip } from '@/services/tripService';
import { calculateAchievements } from '@/services/achievementsService';
import { AchievementsDisplay } from '@/components/achievements-display';
import { ProgressIndicator } from '@/components/progress-indicator';
import { EmptyState } from '@/components/empty-state';

export default function TeenDashboard() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState<any>(null);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [achievements, setAchievements] = useState<any[]>([]);

  const loadData = async () => {
    if (!token) return;

    try {
      const [statsData, tripsData] = await Promise.all([
        getUserStats(),
        getUserTrips({ limit: 5 }),
      ]);
      setStats(statsData.stats);
      setRecentTrips(tripsData.trips || []);
      
      // Calculate achievements
      const calculatedAchievements = calculateAchievements({
        totalTrips: statsData.stats?.totalTrips || 0,
        totalDistance: statsData.stats?.totalDistance || 0,
        perfectScores: statsData.stats?.perfectScores || 0,
        averageScore: statsData.stats?.averageScore || 0,
        consecutiveDays: 0, // TODO: Calculate from trip history
        longestTrip: 0, // TODO: Calculate from trip history
      });
      setAchievements(calculatedAchievements);
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with safe area padding */}
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

      {/* Achievements */}
      {achievements.length > 0 && (
        <AchievementsDisplay achievements={achievements} maxDisplay={6} />
      )}

      {/* Progress Indicators */}
      <ThemedView style={styles.progressSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Progress
        </ThemedText>
        <ProgressIndicator
          label="Next Achievement: 10 Trips"
          current={stats?.totalTrips || 0}
          target={10}
          unit=" trips"
          color="#3b82f6"
        />
        <ProgressIndicator
          label="Distance Goal: 100 km"
          current={stats?.totalDistance || 0}
          target={100}
          unit=" km"
          color="#22c55e"
        />
        <ProgressIndicator
          label="Score Goal: 90+ Average"
          current={overallScore}
          target={90}
          unit="/100"
          color="#f59e0b"
        />
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
                     <EmptyState
                       icon="🚗"
                       title="No trips yet"
                       message="Start your first trip from the dashboard to see your driving history here!"
                       actionLabel="Start Trip"
                       onAction={() => router.push('/start-trip')}
                     />
                   ) : (
          <View>
            {recentTrips.map((item) => {
              const date = item.start_time ? new Date(item.start_time) : null;
              const score = item.score?.overall_score;
              const isValidScore = typeof score === 'number' && !isNaN(score);
              return (
                <Pressable
                  key={item.trip_id}
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
            })}
          </View>
        )}
      </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
    paddingTop: 8,
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
  progressSection: {
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1f2937',
  },
  sectionTitle: {
    marginBottom: 16,
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

