/**
 * Analytics Service
 * Handles user statistics and analytics
 */

import apiRequest from './apiClient';

export type UserStats = {
  totalTrips: number;
  totalDistance: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  totalSpeedingEvents: number;
  totalHarshBrakes: number;
  improvementTrend: 'up' | 'down' | 'stable';
};

export type ScoreHistory = {
  date: string;
  score: number;
  trip_id: number;
}[];

export type FamilyStats = {
  totalMembers: number;
  totalTrips: number;
  averageScore: number;
  memberStats: {
    user_id: number;
    name: string;
    totalTrips: number;
    averageScore: number;
  }[];
};

/**
 * Get user statistics
 */
export async function getUserStats(userId?: number): Promise<{
  stats: UserStats;
}> {
  const endpoint = userId ? `/analytics/user/${userId}` : '/analytics/user';
  return apiRequest(endpoint);
}

/**
 * Get score history for a user
 */
export async function getScoreHistory(userId?: number): Promise<{
  history: ScoreHistory;
}> {
  const endpoint = userId
    ? `/analytics/scores/${userId}`
    : '/analytics/scores';
  return apiRequest(endpoint);
}

/**
 * Get family analytics (parent only)
 */
export async function getFamilyStats(): Promise<{
  stats: FamilyStats;
}> {
  return apiRequest('/analytics/family');
}

