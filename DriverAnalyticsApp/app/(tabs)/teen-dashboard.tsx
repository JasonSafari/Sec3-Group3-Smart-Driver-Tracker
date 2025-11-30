// app/(tabs)/teen-dashboard.tsx
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Card from "../../src/components/Card";
import { getTeenScore, getTeenTrips } from "../../src/Services/mockApi";
import { colors, spacing, typography } from "../../src/theme";

export default function TeenDashboard() {
  const teenId = "teen01"; // pretend logged-in teen

  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const s = await getTeenScore(teenId);
      const t = await getTeenTrips(teenId);

      setScore(s);
      setTrips(t);

      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Driving Dashboard</Text>

      <Card>
        <Text style={styles.sectionTitle}>My Current Score</Text>
        <Text style={styles.score}>{score}</Text>
      </Card>

      <Text style={styles.sectionTitle}>My Recent Trips</Text>
      <FlatList
        data={trips.slice(0, 5)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.tripLabel}>Trip {item.id}</Text>
            <Text>Distance: {item.distanceKm} km</Text>
            <Text>Duration: {item.durationMinutes} min</Text>
            <Text>Date: {item.date}</Text>
          </Card>
        )}
      />
    </View>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold as any,
    marginBottom: spacing.md,
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    marginBottom: spacing.sm,
    fontWeight: typography.weights.bold as any,
    color: colors.textPrimary,
  },
  score: {
    fontSize: 40,
    fontWeight: "bold",
    color: colors.primary,
  },
  tripLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold as any,
  },
}) as any;
