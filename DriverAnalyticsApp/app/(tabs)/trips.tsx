import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Card from '../../src/components/Card';
import { colors, spacing, typography } from '../../src/theme';

type Trip = {
  id: string;
  startedAt: string; // ISO date
  distanceKm: number;
  durationMinutes: number;
};

const MOCK_TRIPS: Trip[] = [
  {
    id: '1',
    startedAt: '2025-11-18T16:00:00Z',
    distanceKm: 12.4,
    durationMinutes: 25,
  },
  {
    id: '2',
    startedAt: '2025-11-18T18:30:00Z',
    distanceKm: 5.8,
    durationMinutes: 12,
  },
];

export default function TripsScreen() {
  const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // TODO: replace with real API call: GET /api/trips
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTrips(MOCK_TRIPS); // simulate updated data
    } catch (e) {
      Alert.alert('Error', 'Failed to refresh trips');
    } finally {
      setRefreshing(false);
    }
  }, []);

  const renderTrip = ({ item }: { item: Trip }) => {
    const startedDate = new Date(item.startedAt);
    const dateString = startedDate.toLocaleDateString();
    const timeString = startedDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const handlePress = () => {
      // later: router.push(`/trips/${item.id}`);
      Alert.alert('Trip Details', `Trip ID: ${item.id} (details screen coming soon)`);
    };

    return (
      <Card onPress={handlePress}>
        <Text style={styles.tripTitle}>
          {dateString} • {timeString}
        </Text>
        <Text style={styles.tripMeta}>
          Distance: {item.distanceKm.toFixed(1)} km • Duration: {item.durationMinutes} min
        </Text>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Trips</Text>

      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={renderTrip}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No trips yet. Start a trip to see it here.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    color: colors.primary,
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  tripTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as any,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  tripMeta: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
});
