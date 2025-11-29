/**
 * Centralized API Client
 * Handles base URL, token injection, and error handling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

declare const process: any;

// Get API URL from environment variable
// Must be set in .env file: EXPO_PUBLIC_API_URL=http://YOUR_IP:3000/api
const API_BASE_URL: string =
  (typeof process !== 'undefined' &&
    (process as any)?.env?.EXPO_PUBLIC_API_URL) ||
  (() => {
    if (__DEV__) {
      console.warn(
        '⚠️  EXPO_PUBLIC_API_URL not set in .env file!\n' +
        '   Create .env file with: EXPO_PUBLIC_API_URL=http://YOUR_IP:3000/api\n' +
        '   Using localhost as fallback (may not work on physical device)'
      );
    }
    return 'http://localhost:3000/api';
  })();

const TIMEOUT = 30000; // 30 seconds

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
};

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    requireAuth = true,
  } = options;

  // Get token from AsyncStorage if auth required
  let token: string | null = null;
  if (requireAuth) {
    token = await AsyncStorage.getItem('userToken');
    if (!token) {
      throw new Error('Not authenticated. Please login again.');
    }
  }

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token && requireAuth) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    // Handle 401 and 403 - unauthorized/forbidden (token expired/invalid)
    if (response.status === 401 || response.status === 403) {
      await AsyncStorage.multiRemove(['userToken', 'userData', 'activeTripId', 'tripDataPoints']);
      // Throw error - navigation will be handled by useAuth hook or calling component
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      throw new Error(
        data?.error || data?.message || `Request failed: ${response.status}`
      );
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your connection.');
    }
    
    if (error.message === 'Network request failed') {
      throw new Error(
        'Cannot connect to server. Make sure:\n' +
        '1. Backend is running\n' +
        '2. Your device and PC are on the same Wi-Fi\n' +
        '3. EXPO_PUBLIC_API_URL in .env points to your PC\'s IP address'
      );
    }
    
    throw error;
  }
}

export default apiRequest;
export { API_BASE_URL };

