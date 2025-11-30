/**
 * Achievements Display Component
 * Shows user achievements and progress
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import {
  Achievement,
  getAchievementProgress,
  getAchievementsByCategory,
} from '@/services/achievementsService';

type AchievementsDisplayProps = {
  achievements: Achievement[];
  showAll?: boolean;
  maxDisplay?: number;
};

export function AchievementsDisplay({
  achievements,
  showAll = false,
  maxDisplay = 6,
}: AchievementsDisplayProps) {
  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);
  const displayAchievements = showAll
    ? achievements
    : [...unlocked, ...locked].slice(0, maxDisplay);

  if (achievements.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.emptyText}>No achievements yet</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.title}>
        Achievements ({unlocked.length}/{achievements.length})
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayAchievements.map((achievement) => {
          const progress = getAchievementProgress(achievement);
          return (
            <ThemedView
              key={achievement.id}
              style={[
                styles.achievementCard,
                achievement.unlocked && styles.achievementUnlocked,
              ]}
            >
              <ThemedText style={styles.achievementIcon}>
                {achievement.icon}
              </ThemedText>
              <ThemedText
                style={[
                  styles.achievementName,
                  !achievement.unlocked && styles.achievementLocked,
                ]}
              >
                {achievement.name}
              </ThemedText>
              {!achievement.unlocked && achievement.target && (
                <ThemedText style={styles.achievementProgress}>
                  {achievement.progress || 0}/{achievement.target}
                </ThemedText>
              )}
              {!achievement.unlocked && (
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress}%` },
                    ]}
                  />
                </View>
              )}
            </ThemedView>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
  },
  scrollContent: {
    gap: 12,
    paddingRight: 16,
  },
  achievementCard: {
    width: 120,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    borderWidth: 2,
    borderColor: '#374151',
    alignItems: 'center',
    opacity: 0.5,
  },
  achievementUnlocked: {
    borderColor: '#22c55e',
    opacity: 1,
    backgroundColor: '#1f2937',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementLocked: {
    color: '#9ca3af',
  },
  achievementProgress: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 4,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  emptyText: {
    color: '#9ca3af',
    textAlign: 'center',
    padding: 16,
  },
});

