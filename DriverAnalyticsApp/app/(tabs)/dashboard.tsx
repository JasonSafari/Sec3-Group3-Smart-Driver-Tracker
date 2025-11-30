import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import TeenDashboard from '@/app/teen-dashboard';
import ParentDashboard from '@/app/parent-dashboard';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

export default function DashboardTab() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.center}>
          <ThemedText>Please log in to view your dashboard</ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Render appropriate dashboard based on role
  if (user.role === 'teen') {
    return <TeenDashboard />;
  } else if (user.role === 'parent') {
    return <ParentDashboard />;
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.center}>
        <ThemedText>Unknown user role</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

