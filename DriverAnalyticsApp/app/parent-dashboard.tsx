import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import {
  getFamilyMembers,
  getMyFamily,
  leaveFamily,
  type FamilyMember,
} from '@/services/familyService';
import { getUserStats } from '@/services/analyticsService';
import { getUserTrips, deleteTrip, type Trip } from '@/services/tripService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from '@/components/toast';
import { getUserFriendlyError, getSuccessMessage } from '@/utils/errorMessages';
import { EmptyState } from '@/components/empty-state';

export default function ParentDashboard() {
  const { user, token, loading: authLoading, setUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedTeenId, setSelectedTeenId] = useState<number | null>(null);
  const [teenStats, setTeenStats] = useState<any>(null);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [familyInfo, setFamilyInfo] = useState<{ invite_code?: string; family_name?: string } | null>(null);
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Don't load data while auth is still loading
    if (authLoading) return;
    // Only load if we have a token
    if (token) {
      loadFamilyData();
    } else {
      // No token, redirect to login
      router.replace('/login');
    }
  }, [token, authLoading]);

  useEffect(() => {
    if (selectedTeenId && token && !authLoading) {
      loadTeenData(selectedTeenId);
    }
  }, [selectedTeenId, token, authLoading]);

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'error') => {
    setToast({ message, type });
    setShowToast(true);
  };

  const loadFamilyData = async () => {
    if (!token) return;

    try {
      // Load family members and family info in parallel
      const [membersData, familyData] = await Promise.all([
        getFamilyMembers(),
        getMyFamily().catch(() => null), // Don't fail if this errors
      ]);
      
      const teens = membersData.members.filter((m) => m.role === 'teen');
      setFamilyMembers(teens);
      
      if (familyData) {
        setFamilyInfo({
          invite_code: familyData.family.invite_code,
          family_name: familyData.family.family_name,
        });
      }
      
      if (teens.length > 0 && !selectedTeenId) {
        setSelectedTeenId(teens[0].user_id);
      }
    } catch (error: any) {
      console.error('Error loading family:', error);
      // Check if it's an auth error (session expired, not authenticated)
      const errorMessage = error?.message || '';
      if (
        errorMessage.includes('Session expired') ||
        errorMessage.includes('Not authenticated') ||
        errorMessage.includes('Please login again') ||
        errorMessage.includes('Access denied') ||
        errorMessage.includes('Unauthorized')
      ) {
        // Redirect to login on auth failure - don't show toast, just redirect
        // Clear loading state first
        setLoading(false);
        setRefreshing(false);
        // Use a small delay to ensure state is updated before navigation
        setTimeout(() => {
          router.replace('/login');
        }, 100);
        return; // Exit early to prevent further processing
      }
      // For other errors, show a toast message
      const friendlyError = getUserFriendlyError(error);
      showToastMessage(friendlyError, 'error');
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
      // Check if it's an auth error (session expired, not authenticated)
      const errorMessage = error?.message || '';
      if (
        errorMessage.includes('Session expired') ||
        errorMessage.includes('Not authenticated') ||
        errorMessage.includes('Please login again') ||
        errorMessage.includes('Access denied')
      ) {
        // Redirect to login on auth failure
        router.replace('/login');
      }
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFamilyData();
    if (selectedTeenId) {
      loadTeenData(selectedTeenId);
    }
  };

  const handleLeaveFamily = async () => {
    Alert.alert(
      'Leave Family',
      'Are you sure you want to leave this family? You will need a new invite code to rejoin.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await leaveFamily();
              // Update token if new one provided
              if (result.token) {
                await AsyncStorage.setItem('userToken', result.token);
              }
              // Update user data
              if (result.user) {
                setUser(result.user);
                await AsyncStorage.setItem('userData', JSON.stringify(result.user));
              }
              Alert.alert('Success', 'You have left the family.', [
                {
                  text: 'OK',
                  onPress: () => {
                    router.replace('/create-family');
                  },
                },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to leave family');
            }
          },
        },
      ]
    );
  };

  const handleViewInviteCode = async () => {
    if (familyInfo?.invite_code) {
      await Clipboard.setStringAsync(familyInfo.invite_code);
      Alert.alert('Invite Code', `Code: ${familyInfo.invite_code}\n\nCopied to clipboard!`);
      setShowInviteCode(true);
    } else {
      // Try to load it
      try {
        const data = await getMyFamily();
        const code = data.family.invite_code;
        await Clipboard.setStringAsync(code);
        Alert.alert('Invite Code', `Code: ${code}\n\nCopied to clipboard!`);
        setFamilyInfo({ invite_code: code, family_name: data.family.family_name });
        setShowInviteCode(true);
      } catch (error: any) {
        Alert.alert('Error', 'Could not load invite code');
      }
    }
  };

  const handleDeleteTrip = async (tripId: number, teenName: string) => {
    Alert.alert(
      'Delete Trip',
      `Are you sure you want to delete ${teenName}'s trip? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTrip(tripId);
              showToastMessage(getSuccessMessage('tripDelete'), 'success');
              // Reload data after deletion
              if (selectedTeenId) {
                loadTeenData(selectedTeenId);
              }
            } catch (error: any) {
              const friendlyError = getUserFriendlyError(error);
              showToastMessage(friendlyError, 'error');
            }
          },
        },
      ]
    );
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
      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'error'}
        visible={showToast}
        onHide={() => setShowToast(false)}
      />
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
          <ThemedText type="subtitle" style={styles.emptyTitle}>
            No teens in family yet
          </ThemedText>
          <ThemedText style={styles.emptyText}>
            Share your invite code with your teen so they can join your family.
          </ThemedText>
          {familyInfo?.invite_code && (
            <ThemedView style={styles.inviteCodeDisplay}>
              <ThemedText style={styles.inviteCodeLabel}>Invite Code:</ThemedText>
              <ThemedText style={styles.inviteCodeValue}>{familyInfo.invite_code}</ThemedText>
            </ThemedView>
          )}
          <Pressable
            style={styles.button}
            onPress={handleViewInviteCode}
          >
            <ThemedText style={styles.buttonText}>
              {familyInfo?.invite_code ? 'Copy Invite Code' : 'View Invite Code'}
            </ThemedText>
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
              <EmptyState
                icon="🚗"
                title="No trips yet"
                message={`${selectedTeen.name} hasn't recorded any trips yet.`}
              />
            ) : (
              <View>
                {recentTrips.map((item) => {
                  const date = item.start_time ? new Date(item.start_time) : null;
                  const score = item.score?.overall_score;
                  const isValidScore = typeof score === 'number' && !isNaN(score);
                  const teenName = selectedTeen?.name || 'Teen';
                  return (
                    <ThemedView key={item.trip_id} style={styles.tripCardContainer}>
                      <Pressable
                        style={styles.tripCardContent}
                        onPress={() => router.push(`/trip-details?id=${item.trip_id}`)}
                      >
                        <View style={styles.tripCardInfo}>
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
                        </View>
                      </Pressable>
                      <Pressable
                        style={styles.deleteTripButton}
                        onPress={() => handleDeleteTrip(item.trip_id, teenName)}
                      >
                        <ThemedText style={styles.deleteTripButtonText}>Delete</ThemedText>
                      </Pressable>
                    </ThemedView>
                  );
                })}
              </View>
            )}
          </ThemedView>
        </>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {familyInfo?.invite_code && (
          <Pressable
            style={[styles.actionButton, { backgroundColor: '#3b82f6', marginBottom: 8 }]}
            onPress={handleViewInviteCode}
          >
            <ThemedText style={styles.actionButtonText}>View Invite Code</ThemedText>
          </Pressable>
        )}
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push('/family-trips')}
        >
          <ThemedText style={styles.actionButtonText}>View All Family Trips</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.actionButton, { backgroundColor: '#f59e0b', marginTop: 8 }]}
          onPress={handleLeaveFamily}
        >
          <ThemedText style={styles.actionButtonText}>Leave Family</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.actionButton, { backgroundColor: '#dc2626', marginTop: 8 }]}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <ThemedText style={styles.actionButtonText}>Profile & Logout</ThemedText>
        </Pressable>
      </View>
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
  emptyTitle: {
    marginBottom: 8,
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
  },
  inviteCodeDisplay: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#111827',
    marginBottom: 16,
    alignItems: 'center',
  },
  inviteCodeLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  inviteCodeValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22c55e',
    letterSpacing: 4,
  },
  statsCard: {
    padding: 20,
    paddingTop: 24,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    marginBottom: 16,
    overflow: 'visible',
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
    lineHeight: 40,
    fontWeight: '700',
    overflow: 'visible',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0, // Prevent overflow
    paddingHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
    flexWrap: 'wrap',
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
  tripCardContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: '#1f2937',
    marginTop: 8,
    overflow: 'hidden',
  },
  tripCardContent: {
    flex: 1,
    padding: 12,
  },
  tripCardInfo: {
    flex: 1,
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
  deleteTripButton: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  deleteTripButtonText: {
    color: '#ffffff',
    fontSize: 14,
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

