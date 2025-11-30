/**
 * Sync Service
 * Handles retrying queued requests when connection is restored
 */

import { getQueue, removeFromQueue, incrementRetryCount, getQueueSize } from './offlineQueue';
import apiRequest, { API_BASE_URL } from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_RETRIES = 3; // Maximum number of retry attempts per request
const RETRY_DELAY = 2000; // 2 seconds between retries

/**
 * Check if device is online by attempting a simple fetch
 */
export async function isOnline(): Promise<boolean> {
  try {
    // Try to fetch a small resource with a short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    // Health endpoint is at root, not under /api
    const baseUrl = API_BASE_URL.replace('/api', '');
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Retry a single queued request
 */
async function retryRequest(request: any): Promise<boolean> {
  try {
    // Skip queue to prevent re-queueing if this retry fails
    await apiRequest(request.endpoint, {
      method: request.method,
      body: request.body,
      headers: request.headers,
      requireAuth: request.requireAuth,
      skipQueue: true, // Don't re-queue if this retry fails
    });
    
    // Success - remove from queue
    await removeFromQueue(request.id);
    return true;
  } catch (error: any) {
    // Increment retry count
    await incrementRetryCount(request.id);
    
    // If max retries reached, remove from queue to prevent infinite retries
    if (request.retryCount >= MAX_RETRIES) {
      console.warn(`⚠️ Max retries reached for ${request.method} ${request.endpoint}, removing from queue`);
      await removeFromQueue(request.id);
      return false;
    }
    
    return false;
  }
}

/**
 * Process all queued requests
 * Returns number of successfully synced requests
 */
export async function syncQueuedRequests(): Promise<number> {
  const queue = await getQueue();
  
  if (queue.length === 0) {
    return 0;
  }
  
  // Check if online first
  const online = await isOnline();
  if (!online) {
    return 0;
  }
  
  let successCount = 0;
  const errors: string[] = [];
  
  // Process requests sequentially to avoid overwhelming the server
  for (const request of queue) {
    try {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY)); // Small delay between requests
      const success = await retryRequest(request);
      if (success) {
        successCount++;
      }
    } catch (error: any) {
      errors.push(`${request.method} ${request.endpoint}: ${error.message}`);
    }
  }
  
  if (errors.length > 0) {
    console.warn('Some requests failed during sync:', errors);
  }
  
  return successCount;
}

/**
 * Start periodic sync (call this when app starts or connection is restored)
 */
let syncInterval: NodeJS.Timeout | null = null;

export function startPeriodicSync(intervalMs: number = 30000): void {
  // Stop existing sync if any
  stopPeriodicSync();
  
  // Sync immediately
  syncQueuedRequests();
  
  // Then sync periodically
  syncInterval = setInterval(() => {
    syncQueuedRequests();
  }, intervalMs);
}

export function stopPeriodicSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}

/**
 * Get sync status
 */
export async function getSyncStatus(): Promise<{
  queueSize: number;
  isOnline: boolean;
}> {
  const [queueSize, online] = await Promise.all([
    getQueueSize(),
    isOnline(),
  ]);
  
  return {
    queueSize,
    isOnline: online,
  };
}

