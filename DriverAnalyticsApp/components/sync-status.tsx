/**
 * Sync Status Component
 * Displays offline queue status and sync indicator
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { getSyncStatus } from '@/services/syncService';

export function SyncStatus() {
  const [status, setStatus] = useState<{ queueSize: number; isOnline: boolean } | null>(null);

  useEffect(() => {
    // Update status every 5 seconds
    const updateStatus = async () => {
      const syncStatus = await getSyncStatus();
      setStatus(syncStatus);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  // Don't show if online and no queued requests
  if (!status || (status.isOnline && status.queueSize === 0)) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      {!status.isOnline ? (
        <ThemedText style={styles.text}>
          ⚠️ Offline - {status.queueSize} request{status.queueSize !== 1 ? 's' : ''} queued
        </ThemedText>
      ) : status.queueSize > 0 ? (
        <ThemedText style={styles.text}>
          🔄 Syncing {status.queueSize} request{status.queueSize !== 1 ? 's' : ''}...
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    color: '#f59e0b',
  },
});

