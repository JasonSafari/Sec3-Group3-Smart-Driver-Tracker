import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/hooks/use-auth';
import { ErrorBoundary } from '@/components/error-boundary';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ErrorBoundary>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: 'Sign in' }} />
          <Stack.Screen name="register" options={{ title: 'Create account' }} />
          <Stack.Screen name="teen-dashboard" options={{ title: 'Dashboard' }} />
          <Stack.Screen name="parent-dashboard" options={{ title: 'Dashboard' }} />
          <Stack.Screen name="start-trip" options={{ title: 'Start Trip' }} />
          <Stack.Screen name="live-trip" options={{ title: 'Trip in Progress' }} />
          <Stack.Screen name="score-result" options={{ title: 'Trip Complete' }} />
          <Stack.Screen name="create-family" options={{ title: 'Create Family' }} />
          <Stack.Screen name="join-family" options={{ title: 'Join Family' }} />
          <Stack.Screen name="family-trips" options={{ title: 'Family Trips' }} />
          <Stack.Screen name="trip-details" options={{ title: 'Trip Details' }} />
          <Stack.Screen name="profile" options={{ title: 'Profile' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
