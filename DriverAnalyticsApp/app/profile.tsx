import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            // Navigate to login and reset navigation stack
            // Use replace to prevent going back to authenticated screens
            router.replace('/login');
          } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'Failed to logout. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Profile</ThemedText>
      </ThemedView>

      {/* User Info */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Account Information</ThemedText>
        <ThemedView style={styles.infoRow}>
          <ThemedText style={styles.label}>Name</ThemedText>
          <ThemedText style={styles.value}>{user?.name || '—'}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <ThemedText style={styles.label}>Email</ThemedText>
          <ThemedText style={styles.value}>{user?.email || '—'}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.infoRow}>
          <ThemedText style={styles.label}>Role</ThemedText>
          <ThemedText style={styles.value}>
            {user?.role === 'parent' ? 'Parent' : 'Teen'}
          </ThemedText>
        </ThemedView>
        {user?.family_id && (
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.label}>Family ID</ThemedText>
            <ThemedText style={styles.value}>{user.family_id}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* Actions */}
      <View style={styles.actions}>
        {user?.role === 'parent' && !user?.family_id && (
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/create-family')}
          >
            <ThemedText style={styles.actionButtonText}>Create Family</ThemedText>
          </Pressable>
        )}
        {user?.role === 'teen' && !user?.family_id && (
          <Pressable
            style={styles.actionButton}
            onPress={() => router.push('/join-family')}
          >
            <ThemedText style={styles.actionButtonText}>Join Family</ThemedText>
          </Pressable>
        )}
        <Pressable style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
          <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
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
  header: {
    marginTop: 40,
    marginBottom: 32,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  label: {
    fontSize: 14,
    color: '#9ca3af',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  actions: {
    marginTop: 'auto',
    gap: 12,
    marginBottom: 32,
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
  logoutButton: {
    backgroundColor: '#dc2626',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

