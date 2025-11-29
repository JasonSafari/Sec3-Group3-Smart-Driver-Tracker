import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAuth } from '@/hooks/use-auth';
import { ThemedText } from './themed-text';

type BackHeaderProps = {
  title: string;
  showHome?: boolean;
};

export function BackHeader({ title, showHome = false }: BackHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();

  // Don't show header on dashboard screens (they're already home)
  const isDashboard = title.includes('Dashboard');
  
  const goHome = () => {
    // Navigate to appropriate dashboard based on role
    // Don't navigate if already on dashboard
    if (isDashboard) {
      return; // Already home, don't navigate
    }
    
    if (user?.role === 'teen') {
      router.push('/teen-dashboard');
    } else if (user?.role === 'parent') {
      router.push('/parent-dashboard');
    } else {
      router.push('/(tabs)');
    }
  };

  // Don't show header on dashboard screens
  if (isDashboard && !showHome) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.backButton}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            // If can't go back, navigate to appropriate dashboard
            goHome();
          }
        }}
      >
        <ThemedText style={styles.backText}>← Back</ThemedText>
      </Pressable>
      {showHome && !isDashboard && (
        <Pressable
          style={styles.homeButton}
          onPress={goHome}
        >
          <ThemedText style={styles.homeText}>Home</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '500',
  },
  homeButton: {
    padding: 8,
  },
  homeText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '500',
  },
});

