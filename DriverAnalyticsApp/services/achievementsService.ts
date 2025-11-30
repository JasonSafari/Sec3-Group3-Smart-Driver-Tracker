/**
 * Achievements Service
 * Manages user achievements and badges
 */

export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'trips' | 'safety' | 'distance' | 'consistency';
  unlocked: boolean;
  progress?: number;
  target?: number;
};

export type AchievementProgress = {
  totalTrips: number;
  totalDistance: number;
  perfectScores: number;
  averageScore: number;
  consecutiveDays: number;
  longestTrip: number;
};

/**
 * Calculate achievements based on user stats
 */
export function calculateAchievements(progress: AchievementProgress): Achievement[] {
  const achievements: Achievement[] = [
    // Trip-based achievements
    {
      id: 'first_trip',
      name: 'First Steps',
      description: 'Complete your first trip',
      icon: '🎯',
      category: 'trips',
      unlocked: progress.totalTrips >= 1,
      progress: progress.totalTrips,
      target: 1,
    },
    {
      id: 'ten_trips',
      name: 'Getting Started',
      description: 'Complete 10 trips',
      icon: '🚗',
      category: 'trips',
      unlocked: progress.totalTrips >= 10,
      progress: progress.totalTrips,
      target: 10,
    },
    {
      id: 'fifty_trips',
      name: 'Road Warrior',
      description: 'Complete 50 trips',
      icon: '🏆',
      category: 'trips',
      unlocked: progress.totalTrips >= 50,
      progress: progress.totalTrips,
      target: 50,
    },
    {
      id: 'hundred_trips',
      name: 'Century Club',
      description: 'Complete 100 trips',
      icon: '💯',
      category: 'trips',
      unlocked: progress.totalTrips >= 100,
      progress: progress.totalTrips,
      target: 100,
    },
    
    // Distance achievements
    {
      id: 'hundred_km',
      name: 'Century Driver',
      description: 'Drive 100 km total',
      icon: '📏',
      category: 'distance',
      unlocked: progress.totalDistance >= 100,
      progress: progress.totalDistance,
      target: 100,
    },
    {
      id: 'thousand_km',
      name: 'Thousand K Club',
      description: 'Drive 1,000 km total',
      icon: '🌟',
      category: 'distance',
      unlocked: progress.totalDistance >= 1000,
      progress: progress.totalDistance,
      target: 1000,
    },
    
    // Safety achievements
    {
      id: 'perfect_score',
      name: 'Perfect Driver',
      description: 'Get a perfect score (100/100)',
      icon: '⭐',
      category: 'safety',
      unlocked: progress.perfectScores >= 1,
      progress: progress.perfectScores,
      target: 1,
    },
    {
      id: 'excellent_average',
      name: 'Consistent Excellence',
      description: 'Maintain 90+ average score',
      icon: '✨',
      category: 'safety',
      unlocked: progress.averageScore >= 90,
      progress: progress.averageScore,
      target: 90,
    },
    {
      id: 'good_average',
      name: 'Safe Driver',
      description: 'Maintain 80+ average score',
      icon: '🛡️',
      category: 'safety',
      unlocked: progress.averageScore >= 80,
      progress: progress.averageScore,
      target: 80,
    },
    
    // Consistency achievements
    {
      id: 'three_days',
      name: 'Three Day Streak',
      description: 'Drive for 3 consecutive days',
      icon: '🔥',
      category: 'consistency',
      unlocked: progress.consecutiveDays >= 3,
      progress: progress.consecutiveDays,
      target: 3,
    },
    {
      id: 'week_streak',
      name: 'Week Warrior',
      description: 'Drive for 7 consecutive days',
      icon: '💪',
      category: 'consistency',
      unlocked: progress.consecutiveDays >= 7,
      progress: progress.consecutiveDays,
      target: 7,
    },
  ];

  return achievements;
}

/**
 * Get unlocked achievements count
 */
export function getUnlockedCount(achievements: Achievement[]): number {
  return achievements.filter(a => a.unlocked).length;
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(
  achievements: Achievement[],
  category: Achievement['category']
): Achievement[] {
  return achievements.filter(a => a.category === category);
}

/**
 * Get progress percentage for an achievement
 */
export function getAchievementProgress(achievement: Achievement): number {
  if (achievement.unlocked) return 100;
  if (!achievement.target || !achievement.progress) return 0;
  return Math.min(100, (achievement.progress / achievement.target) * 100);
}

