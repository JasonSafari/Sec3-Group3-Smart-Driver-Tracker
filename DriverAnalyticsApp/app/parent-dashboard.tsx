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
import { getFamilyMembers, type FamilyMember } from '@/services/familyService';
import { getUserStats } from '@/services/analyticsService';
import { getUserTrips, type Trip } from '@/services/tripService';

export default function ParentDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedTeenId, setSelectedTeenId] = useState<number | null>(null);
  const [teenStats, setTeenStats] = useState<any>(null);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFamilyData();
  }, [token]);

  useEffect(() => {
    if (selectedTeenId) {
      loadTeenData(selectedTeenId);
    }
  }, [selectedTeenId, token]);

  const loadFamilyData = async () => {
    if (!token) return;

    try {
      const data = await getFamilyMembers();
      const teens = data.members.filter((m) => m.role === 'teen');
      setFamilyMembers(teens);
      
      if (teens.length > 0 && !selectedTeenId) {
        setSelectedTeenId(teens[0].user_id);
      }
    } catch (error: any) {
      console.error('Error loading family:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadTeenData = async (teenId: number) => {
    if (!token) return;

    try {
      const [statsData, tripsData] = await Promise.all([
        getUserStats(teenId),
        getUserTrips({ userId: teenId, limit: 5 }),
      ]);
      setTeenStats(statsData.stats);
      setRecentTrips(tripsData.trips || []);
    } catch (error: any) {
      console.error('Error loading teen data:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFamilyData();
    if (selectedTeenId) {
      loadTeenData(selectedTeenId);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#22c55e';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  if (user?.role !== 'parent') {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Only parents can access this screen</ThemedText>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </ThemedView>
    );
  }

  const selectedTeen = familyMembers.find((m) => m.user_id === selectedTeenId);
  const averageScore = teenStats?.averageScore || 0;

  return (
    <ThemedView style={styles.container}>
      {/* No header on dashboard - it's already home */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Parent Dashboard</ThemedText>
        <ThemedText>Monitor your teen's driving</ThemedText>
      </ThemedView>

      {/* Teen Selector */}
      {familyMembers.length > 0 ? (
        <ThemedView style={styles.selectorCard}>
          <ThemedText style={styles.selectorLabel}>Select Teen</ThemedText>
          <View style={styles.selectorRow}>
            {familyMembers.map((member) => (
              <Pressable
                key={member.user_id}
                style={[
                  styles.selectorButton,
                  selectedTeenId === member.user_id && styles.selectorButtonActive,
                ]}
                onPress={() => setSelectedTeenId(member.user_id)}
              >
                <ThemedText
                  style={[
                    styles.selectorButtonText,
                    selectedTeenId === member.user_id &&
                      styles.selectorButtonTextActive,
                  ]}
                >
                  {member.name}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </ThemedView>
      ) : (
        <ThemedView style={styles.emptyCard}>
          <ThemedText>No family members yet</ThemedText>
          <Pressable
            style={styles.button}
            onPress={() => router.push('/create-family')}
          >
            <ThemedText style={styles.buttonText}>Create Family</ThemedText>
          </Pressable>
        </ThemedView>
      )}

      {/* Selected Teen Stats */}
      {selectedTeen && teenStats && (
        <>
          <ThemedView style={styles.statsCard}>
            <ThemedText type="subtitle">{selectedTeen.name}'s Stats</ThemedText>
            <ThemedView style={styles.scoreRow}>
              <ThemedText style={styles.scoreLabel}>Average Score</ThemedText>
              <ThemedText
                style={[styles.scoreValue, { color: getScoreColor(averageScore) }]}
              >
                {averageScore.toFixed(1)}/100
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.statsRow}>
              <ThemedView style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {teenStats.totalTrips || 0}
                </ThemedText>
                <ThemedText style={styles.statLabel}>Trips</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {teenStats.totalDistance?.toFixed(1) || '0'} km
                </ThemedText>
                <ThemedText style={styles.statLabel}>Distance</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* Recent Trips */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">Recent Trips</ThemedText>
            {recentTrips.length === 0 ? (
              <ThemedText style={styles.emptyText}>No trips yet</ThemedText>
            ) : (
              <FlatList
                data={recentTrips}
                keyExtractor={(t) => String(t.trip_id)}
                renderItem={({ item }) => {
                  const date = item.start_time ? new Date(item.start_time) : null;
                  const score = item.score?.overall_score;
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
                        {score !== undefined && (
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
        </>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push('/family-trips')}
        >
          <ThemedText style={styles.actionButtonText}>View All Family Trips</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.actionButton, { backgroundColor: '#dc2626', marginTop: 8 }]}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <ThemedText style={styles.actionButtonText}>Profile & Logout</ThemedText>
        </Pressable>
      </View>
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
  selectorCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    marginBottom: 16,
  },
  selectorLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  selectorButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#111827',
  },
  selectorButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  selectorButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  selectorButtonTextActive: {
    color: '#ffffff',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#9ca3af',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  statItem: {
    flex: 1,
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
  section: {
    marginTop: 16,
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
  actions: {
    marginTop: 24,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

