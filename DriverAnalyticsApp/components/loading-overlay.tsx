
import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
  fullScreen?: boolean;
};

export function LoadingOverlay({
  visible,
  message,
  fullScreen = false,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ThemedView style={styles.content}>
        <ActivityIndicator size="large" color="#3b82f6" />
        {message && (
          <ThemedText style={styles.message}>{message}</ThemedText>
        )}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9998,
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    backgroundColor: '#1f2937',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
    minWidth: 200,
  },
  message: {
    color: '#e5e5e5',
    fontSize: 14,
    textAlign: 'center',
  },
});

