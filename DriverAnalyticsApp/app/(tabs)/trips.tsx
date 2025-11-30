import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { fetchTrips, searchTrips, exportTripsToCSV, type Trip, type TripFilters } from '@/utils/api';
import { EmptyState } from '@/components/empty-state';
import { Toast } from '@/components/toast';
import { getUserFriendlyError, getSuccessMessage } from '@/utils/errorMessages';

export default function TripsScreen() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TripFilters>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [showToast, setShowToast] = useState(false);

  const loadTrips = async (search?: string) => {
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      let data;
      
      if (search && search.trim()) {
        data = await searchTrips(token, search, filters.startDate, filters.endDate);
        setTrips(data.results ?? []);
      } else {
        data = await fetchTrips(token, filters);
        setTrips(data.trips ?? []);
      }
    } catch (err: any) {
      const friendlyError = getUserFriendlyError(err);
      setError(friendlyError);
      showToastMessage(friendlyError, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'error') => {
    setToast({ message, type });
    setShowToast(true);
  };

  useEffect(() => {
    loadTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filters]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTrips(searchQuery);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      loadTrips(searchQuery);
    } else {
      loadTrips();
    }
  };

  const handleExport = async () => {
    if (!token) {
      showToastMessage('Please log in to export trips', 'error');
      return;
    }
    
    try {
      showToastMessage('Exporting trips to CSV...', 'info');
      const csv = await exportTripsToCSV(token, filters.startDate, filters.endDate);
      
      // In a real app, you'd use a file system library to save the file
      // For now, we'll just show a success message
      showToastMessage(`Export complete! CSV data ready (${csv.length} characters)`, 'success');
    } catch (err: any) {
      const friendlyError = getUserFriendlyError(err);
      showToastMessage(friendlyError, 'error');
    }
  };

  const renderItem = ({ item }: { item: Trip }) => {
    const date = item.start_time ? new Date(item.start_time) : null;
    const score = item.score?.overall_score;
    const isValidScore = typeof score === 'number' && !isNaN(score);
    
    return (
      <Pressable
        onPress={() => router.push(`/trip-details?id=${item.trip_id}`)}
      >
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">
            {date ? date.toLocaleString() : 'Unknown start time'}
          </ThemedText>
          <ThemedText>
            Distance: {item.distance_km ?? '—'} km • Avg speed: {item.avg_speed ?? '—'} km/h
          </ThemedText>
          {isValidScore && (
            <ThemedText style={styles.score}>
              Score: {score.toFixed(1)}/100
            </ThemedText>
          )}
        </ThemedView>
      </Pressable>
    );
  };

  // Render header component for FlatList
  const renderHeader = () => (
    <ThemedView style={styles.header}>
      <ThemedText type="title">My Trips</ThemedText>
      <ThemedText>Trips associated with your account.</ThemedText>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search trips..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          placeholderTextColor="#9ca3af"
        />
        <Pressable style={styles.searchButton} onPress={handleSearch}>
          <ThemedText>Search</ThemedText>
        </Pressable>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Pressable
          style={styles.actionButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <ThemedText>Filters</ThemedText>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={handleExport}>
          <ThemedText>Export CSV</ThemedText>
        </Pressable>
        {user?.role === 'parent' && (
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/family-trips')}
          >
            <ThemedText>Family Trips</ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedView>
  );

  // Render empty/loading/error states
  const renderListContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      );
    }
    
    if (error) {
      return (
        <ThemedView style={styles.center}>
          <ThemedText type="subtitle">Error</ThemedText>
          <ThemedText>{error}</ThemedText>
        </ThemedView>
      );
    }
    
    if (trips.length === 0) {
      return (
        <EmptyState
          icon="🚗"
          title="No trips yet"
          message={
            searchQuery.trim()
              ? `No trips found matching "${searchQuery}". Try a different search term.`
              : "You haven't recorded any trips yet. Start your first trip from the dashboard!"
          }
          actionLabel={searchQuery.trim() ? undefined : "Go to Dashboard"}
          onAction={searchQuery.trim() ? undefined : () => router.push('/(tabs)/dashboard')}
        />
      );
    }
    
    return null; // FlatList will render items
  };

  return (
    <ThemedView style={styles.container}>
      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'error'}
        visible={showToast}
        onHide={() => setShowToast(false)}
      />
      <FlatList
        data={trips}
        keyExtractor={(t) => String(t.trip_id)}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderListContent}
        contentContainerStyle={[
          styles.listContent,
          trips.length === 0 && styles.emptyContent
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#1f2937',
    color: '#f9fafb',
  },
  searchButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#374151',
    minWidth: 80,
    alignItems: 'center',
  },
  center: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 32,
    paddingHorizontal: 16,
    gap: 12,
  },
  emptyContent: {
    flex: 1,
  },
  card: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 8,
  },
  score: {
    marginTop: 4,
    color: '#3b82f6',
    fontWeight: '600',
  },
});


