import { Image } from 'expo-image';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';

export default function HomeScreen() {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  // Track if we've already done the initial redirect
  const [hasRedirected, setHasRedirected] = React.useState(false);
  const lastFamilyId = React.useRef<number | null>(null);

  useEffect(() => {
    // Don't redirect if still loading
    if (loading) return;

    // If not logged in, redirect to login
    if (!token || !user) {
      if (!hasRedirected) {
        setHasRedirected(true);
        router.replace('/login');
      }
      lastFamilyId.current = null;
      return;
    }
    
    // Reset redirect flag if family_id changed (user joined/created family)
    const currentFamilyId = user.family_id ?? null;
    if (currentFamilyId !== lastFamilyId.current) {
      lastFamilyId.current = currentFamilyId;
      setHasRedirected(false); // Allow redirect after family status change
    }
    
    // Only redirect once on initial app load if user is logged in
    if (!hasRedirected && token && user) {
      setHasRedirected(true);
      lastFamilyId.current = user.family_id ?? null;
      
      // Small delay to ensure navigation is ready
      const timer = setTimeout(() => {
        // Redirect based on role and family status
        if (user.role === 'teen') {
          if (!user.family_id) {
            router.replace('/join-family');
          } else {
            router.replace('/teen-dashboard');
          }
        } else if (user.role === 'parent') {
          if (!user.family_id) {
            router.replace('/create-family');
          } else {
            router.replace('/parent-dashboard');
          }
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [loading, token, user, user?.family_id, hasRedirected, router]);

  // Show login/register screen if not logged in
  if (!loading && (!token || !user)) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={require('@/assets/images/partial-react-logo.png')}
            style={styles.reactLogo}
          />
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Driver Analytics</ThemedText>
          <HelloWave />
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Monitor and improve teen driving</ThemedText>
          <ThemedText>
            Sign in or create an account to start tracking trips and driver performance.
          </ThemedText>
        </ThemedView>

        <View style={styles.authRow}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/login')}
          >
            <ThemedText type="defaultSemiBold" style={styles.primaryButtonText}>
              Sign in
            </ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/register')}
          >
            <ThemedText type="defaultSemiBold" style={styles.secondaryButtonText}>
              Create account
            </ThemedText>
          </Pressable>
        </View>

        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Developer tips</ThemedText>
          <ThemedText>
            Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to customize this
            screen. Press{' '}
            <ThemedText type="defaultSemiBold">
              {Platform.select({
                ios: 'cmd + d',
                android: 'cmd + m',
                web: 'F12',
              })}
            </ThemedText>{' '}
            to open developer tools.
          </ThemedText>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  // If logged in, show a simple home screen
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Driver Analytics</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Welcome back, {user?.name}</ThemedText>
        <ThemedText>
          Use the tabs below to navigate to your dashboard, trips, or profile.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  authRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  primaryButtonText: {
    color: '#f9fafb',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  secondaryButtonText: {
    color: '#2563eb',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
