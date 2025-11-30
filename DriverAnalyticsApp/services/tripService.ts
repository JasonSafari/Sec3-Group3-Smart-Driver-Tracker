/**
 * Trip Service
 * Handles trip lifecycle: start, upload data points, stop
 */

import apiRequest from './apiClient';

export type DataPoint = {
  timestamp?: string;
  latitude: number;
  longitude: number;
  speed?: number;
  acceleration?: number;
};

export type Trip = {
  trip_id: number;
  user_id: number;
  start_time: string | null;
  end_time: string | null;
  distance_km: string | null;
  avg_speed: string | null;
  score_id?: number | null;
  user?: {
    user_id: number;
    name: string;
    email: string;
    role: string;
  };
  score?: {
    overall_score: number;
    speed_score: number;
    brake_score: number;
    speeding_events: number;
    harsh_brakes: number;
  };
};

export type TripFilters = {
  userId?: number;
  startDate?: string;
  endDate?: string;
  minDistance?: number;
  maxDistance?: number;
  minScore?: number;
  maxScore?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
};

/**
 * Start a new trip
 */
export async function startTrip(
  startLatitude: number,
  startLongitude: number,
  weatherCondition?: string
): Promise<{
  message: string;
  trip: Trip;
}> {
  return apiRequest('/trips/start', {
    method: 'POST',
    body: {
      start_latitude: startLatitude,
      start_longitude: startLongitude,
      weather_condition: weatherCondition || 'clear',
    },
  });
}

/**
 * Upload data points for a trip
 */
export async function uploadDataPoints(
  tripId: number,
  datapoints: DataPoint[]
): Promise<{
  message: string;
  count: number;
  trip_id: number;
}> {
  return apiRequest(`/trips/${tripId}/datapoints`, {
    method: 'POST',
    body: { datapoints },
  });
}

/**
 * Stop a trip and calculate score
 */
export async function stopTrip(
  tripId: number,
  endLatitude?: number,
  endLongitude?: number
): Promise<{
  message: string;
  trip: Trip;
  score: {
    score_id: number;
    overall_score: number;
    speed_score: number;
    brake_score: number;
    speeding_events: number;
    harsh_brakes: number;
  };
}> {
  return apiRequest(`/trips/${tripId}/stop`, {
    method: 'POST',
    body: {
      end_latitude: endLatitude,
      end_longitude: endLongitude,
    },
  });
}

/**
 * Get user trips with optional filters
 */
export async function getUserTrips(
  filters?: TripFilters
): Promise<{
  message: string;
  trips: Trip[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}> {
  const queryParams = new URLSearchParams();
  if (filters?.userId) queryParams.append('userId', String(filters.userId));
  if (filters?.startDate) queryParams.append('startDate', filters.startDate);
  if (filters?.endDate) queryParams.append('endDate', filters.endDate);
  if (filters?.minDistance)
    queryParams.append('minDistance', String(filters.minDistance));
  if (filters?.maxDistance)
    queryParams.append('maxDistance', String(filters.maxDistance));
  if (filters?.minScore)
    queryParams.append('minScore', String(filters.minScore));
  if (filters?.maxScore)
    queryParams.append('maxScore', String(filters.maxScore));
  if (filters?.limit) queryParams.append('limit', String(filters.limit));
  if (filters?.offset) queryParams.append('offset', String(filters.offset));
  if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

  const endpoint = `/trips${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiRequest(endpoint);
}

/**
 * Get trip details by ID
 */
export async function getTripDetails(tripId: number): Promise<{
  message: string;
  trip: Trip;
  score?: {
    overall_score: number;
    speed_score: number;
    brake_score: number;
  };
  datapoints?: DataPoint[];
}> {
  return apiRequest(`/trips/${tripId}`);
}

/**
 * Get data points for a trip
 */
export async function getTripDataPoints(tripId: number): Promise<{
  message: string;
  count: number;
  dataPoints: DataPoint[];
}> {
  return apiRequest(`/datapoints/trip/${tripId}`);
}

/**
 * Delete a trip
 */
export async function deleteTrip(tripId: number): Promise<{
  message: string;
}> {
  return apiRequest(`/trips/${tripId}`, {
    method: 'DELETE',
  });
}

