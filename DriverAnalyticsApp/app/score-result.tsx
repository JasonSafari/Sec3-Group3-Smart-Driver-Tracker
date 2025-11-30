import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { BackHeader } from '@/components/back-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ScoreResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    tripId: string;
    score: string;
    speedScore: string;
    brakeScore: string;
    distance: string;
    duration: string;
  }>();

  const overallScore = parseFloat(params.score || '0');
  const speedScore = parseFloat(params.speedScore || '0');
  const brakeScore = parseFloat(params.brakeScore || '0');

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#22c55e'; // green
    if (score >= 70) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <ThemedView style={styles.container}>
      <BackHeader title="Trip Complete" showHome />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title">Trip Complete!</ThemedText>
          <ThemedText>Your driving score</ThemedText>
        </ThemedView>

        {/* Overall Score */}
        <ThemedView style={styles.scoreCard}>
          <ThemedText style={styles.scoreLabel}>Overall Score</ThemedText>
          <ThemedText
            style={[styles.scoreValue, { color: getScoreColor(overallScore) }]}
          >
            {overallScore.toFixed(1)}/100
          </ThemedText>
          <ThemedText
            style={[styles.scoreLabelText, { color: getScoreColor(overallScore) }]}
          >
            {getScoreLabel(overallScore)}
          </ThemedText>
        </ThemedView>

        {/* Breakdown */}
        <ThemedView style={styles.breakdownCard}>
          <ThemedText type="subtitle" style={styles.breakdownTitle}>
            Score Breakdown
          </ThemedText>
          <ThemedView style={styles.breakdownRow}>
            <ThemedText style={styles.breakdownLabel}>Speed Score</ThemedText>
            <ThemedText
              style={[styles.breakdownValue, { color: getScoreColor(speedScore) }]}
            >
              {speedScore.toFixed(1)}/100
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.breakdownRow}>
            <ThemedText style={styles.breakdownLabel}>Brake Score</ThemedText>
            <ThemedText
              style={[styles.breakdownValue, { color: getScoreColor(brakeScore) }]}
            >
              {brakeScore.toFixed(1)}/100
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Trip Info */}
        <ThemedView style={styles.infoCard}>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Distance</ThemedText>
            <ThemedText style={styles.infoValue}>{params.distance} km</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Duration</ThemedText>
            <ThemedText style={styles.infoValue}>{params.duration}</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={() => router.push(`/trip-details?id=${params.tripId}`)}
          >
            <ThemedText style={styles.buttonText}>View Details</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={() => router.replace('/(tabs)')}
          >
            <ThemedText style={styles.secondaryButtonText}>Done</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginTop: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  scoreCard: {
    alignItems: 'center',
    padding: 32,
    paddingTop: 40,
    borderRadius: 20,
    backgroundColor: '#1f2937',
    marginBottom: 24,
    overflow: 'visible',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 64,
    lineHeight: 72,
    fontWeight: '700',
    marginBottom: 8,
    overflow: 'visible',
  },
  scoreLabelText: {
    fontSize: 20,
    fontWeight: '600',
  },
  breakdownCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    marginBottom: 16,
  },
  breakdownTitle: {
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  breakdownLabel: {
    fontSize: 16,
    color: '#9ca3af',
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    gap: 12,
    marginTop: 24,
    marginBottom: 16,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#374151',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#e5e5e5',
    fontSize: 16,
    fontWeight: '600',
  },
});

