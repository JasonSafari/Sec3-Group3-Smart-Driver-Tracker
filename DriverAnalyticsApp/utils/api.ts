// API utility functions for Sprint 3 features

declare const process: any;
const API_BASE_URL: string =
  (typeof process !== 'undefined' &&
    (process as any)?.env?.EXPO_PUBLIC_API_URL) ||
  'http://localhost:3000/api';

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
  };
};

export type TripFilters = {
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

export type RouteHeatMap = {
  lat: number;
  lng: number;
  speed: number;
  intensity: number;
};

export type RouteAnalysis = {
  total_distance_km: number;
  duration_minutes: number;
  average_speed: number;
  max_speed: number;
  speed_segments: {
    low: number;
    medium: number;
    high: number;
    very_high: number;
  };
  acceleration_segments: {
    harsh_braking: number;
    normal_braking: number;
    cruising: number;
    accelerating: number;
  };
  route_efficiency: number;
  total_data_points: number;
};

export async function fetchTrips(
  token: string,
  filters?: TripFilters
): Promise<{ trips: Trip[]; pagination?: any }> {
  const queryParams = new URLSearchParams();
  if (filters?.startDate) queryParams.append('startDate', filters.startDate);
  if (filters?.endDate) queryParams.append('endDate', filters.endDate);
  if (filters?.minDistance) queryParams.append('minDistance', String(filters.minDistance));
  if (filters?.maxDistance) queryParams.append('maxDistance', String(filters.maxDistance));
  if (filters?.minScore) queryParams.append('minScore', String(filters.minScore));
  if (filters?.maxScore) queryParams.append('maxScore', String(filters.maxScore));
  if (filters?.limit) queryParams.append('limit', String(filters.limit));
  if (filters?.offset) queryParams.append('offset', String(filters.offset));
  if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

  const url = `${API_BASE_URL}/trips${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Failed to fetch trips');
  }
  return data;
}

export async function searchTrips(
  token: string,
  query: string,
  startDate?: string,
  endDate?: string
): Promise<{ results: Trip[]; count: number }> {
  const queryParams = new URLSearchParams({ q: query });
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);

  const response = await fetch(`${API_BASE_URL}/trips/search?${queryParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Failed to search trips');
  }
  return data;
}

export async function fetchFamilyTrips(token: string): Promise<{ trips: Trip[]; family_members: number }> {
  const response = await fetch(`${API_BASE_URL}/trips/family`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Failed to fetch family trips');
  }
  return data;
}

export async function fetchRouteHeatMap(
  token: string,
  tripId: number
): Promise<{ heat_map: RouteHeatMap[]; statistics: any }> {
  const response = await fetch(`${API_BASE_URL}/routes/heatmap/${tripId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Failed to fetch heat map');
  }
  return data;
}

export async function fetchRouteAnalysis(
  token: string,
  tripId: number
): Promise<{ analysis: RouteAnalysis }> {
  const response = await fetch(`${API_BASE_URL}/routes/analysis/${tripId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Failed to fetch route analysis');
  }
  return data;
}

export async function exportTripsToCSV(
  token: string,
  startDate?: string,
  endDate?: string
): Promise<string> {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);

  const response = await fetch(`${API_BASE_URL}/trips/export/csv?${queryParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data?.error || data?.message || 'Failed to export trips');
  }

  return await response.text();
}

export async function calculateScoreWithParams(
  token: string,
  tripId: number,
  params?: {
    speedLimit?: number;
    harshBrakeThreshold?: number;
    speedPenaltyMultiplier?: number;
    brakePenaltyMultiplier?: number;
    speedWeight?: number;
    brakeWeight?: number;
  }
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/scores/calculate/${tripId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params || {}),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'Failed to calculate score');
  }
  return data;
}

