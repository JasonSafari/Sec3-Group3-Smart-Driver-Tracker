// app/(tabs)/parent-dashboard.tsx
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Card from "../../src/components/Card";
import {
  getFamilyMembers,
  getTeenAlerts,
  getTeenScore,
  getTeenTrips,
} from "../../src/Services/mockApi";
import { colors, spacing, typography } from "../../src/theme";

export default function ParentDashboard() {
  const [selectedTeen, setSelectedTeen] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [trips, setTrips] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Load family members
  useEffect(() => {
    async function loadMembers() {
      const data = await getFamilyMembers();
      setMembers(data);
      setSelectedTeen(data[0]?.id ?? "");
    }
    loadMembers();
  }, []);

  // Load teen data when selected teen changes
  useEffect(() => {
    if (!selectedTeen) return;

    async function loadData() {
      setLoading(true);

      const s = await getTeenScore(selectedTeen);
      const t = await getTeenTrips(selectedTeen);
      const a = await getTeenAlerts(selectedTeen);

      setScore(s);
      setTrips(t);
      setAlerts(a);

      setLoading(false);
    }
    loadData();
  }, [selectedTeen]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Parent Dashboard</Text>

      {/* Teen selector */}
      <Card>
        <Text style={styles.sectionTitle}>Select Family Member</Text>
        <Picker
          selectedValue={selectedTeen}
          onValueChange={(v) => setSelectedTeen(v)}
          style={styles.picker}
        >
          {members.map((m) => (
            <Picker.Item label={m.name} value={m.id} key={m.id} />
          ))}
        </Picker>
      </Card>

      {/* Score */}
      <Card>
        <Text style={styles.sectionTitle}>Current Score</Text>
        <Text style={styles.score}>{score}</Text>
      </Card>

      {/* Recent Trips */}
      <Text style={styles.sectionTitle}>Recent Trips</Text>
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

      {/* Alerts */}
      <Text style={styles.sectionTitle}>Alerts</Text>
      {alerts.length === 0 ? (
        <Text style={styles.noAlerts}>No safety alerts</Text>
      ) : (
        alerts.map((a) => (
          <Card key={a.id} variant="outlined">
            <Text style={styles.alertText}>{a.message}</Text>
          </Card>
        ))
      )}
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
  picker: {
    backgroundColor: "#fff",
    borderRadius: 8,
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
  noAlerts: {
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  alertText: {
    color: colors.danger,
    fontWeight: "600",
  },
}) as any;
