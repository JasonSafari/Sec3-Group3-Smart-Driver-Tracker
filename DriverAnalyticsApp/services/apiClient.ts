/**
 * Centralized API Client
 * Handles base URL, token injection, error handling, and offline queueing
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { queueRequest } from './offlineQueue';

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
  skipQueue?: boolean; // Set to true to prevent queueing (e.g., for retry attempts)
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
    skipQueue = false,
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
    
    // Handle network failures - queue for retry if not already a retry attempt
    if (error.message === 'Network request failed' || error.name === 'TypeError') {
      // Check if it's a network error (TypeError usually means fetch failed)
      const isNetworkError = 
        error.message === 'Network request failed' ||
        error.message?.includes('fetch') ||
        error.message?.includes('network');
      
      if (isNetworkError && !skipQueue && method !== 'GET') {
        // Queue POST/PUT/DELETE requests for retry (GET requests are idempotent but less critical)
        try {
          await queueRequest({
            endpoint,
            method,
            body,
            headers,
            requireAuth,
          });
          console.log(`📦 Queued ${method} ${endpoint} for offline retry`);
        } catch (queueError) {
          console.error('Error queueing request:', queueError);
        }
      }
      
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

