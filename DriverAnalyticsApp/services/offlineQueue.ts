/**
 * Offline Queue Service
 * Handles queuing failed API requests and retrying them when connection is restored
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = 'offlineRequestQueue';
const MAX_QUEUE_SIZE = 100; // Prevent queue from growing too large

export type QueuedRequest = {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  requireAuth?: boolean;
};

/**
 * Add a failed request to the offline queue
 */
export async function queueRequest(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
  try {
    const queue = await getQueue();
    
    // Prevent queue from growing too large
    if (queue.length >= MAX_QUEUE_SIZE) {
      // Remove oldest requests
      queue.splice(0, queue.length - MAX_QUEUE_SIZE + 1);
    }
    
    const queuedRequest: QueuedRequest = {
      ...request,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };
    
    queue.push(queuedRequest);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error queueing request:', error);
  }
}

/**
 * Get all queued requests
 */
export async function getQueue(): Promise<QueuedRequest[]> {
  try {
    const queueJson = await AsyncStorage.getItem(QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Error getting queue:', error);
    return [];
  }
}

/**
 * Remove a request from the queue (after successful retry)
 */
export async function removeFromQueue(requestId: string): Promise<void> {
  try {
    const queue = await getQueue();
    const filtered = queue.filter(req => req.id !== requestId);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing from queue:', error);
  }
}

/**
 * Clear the entire queue
 */
export async function clearQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(QUEUE_KEY);
  } catch (error) {
    console.error('Error clearing queue:', error);
  }
}

/**
 * Increment retry count for a request
 */
export async function incrementRetryCount(requestId: string): Promise<void> {
  try {
    const queue = await getQueue();
    const request = queue.find(req => req.id === requestId);
    if (request) {
      request.retryCount += 1;
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    }
  } catch (error) {
    console.error('Error incrementing retry count:', error);
  }
}

/**
 * Get queue size
 */
export async function getQueueSize(): Promise<number> {
  const queue = await getQueue();
  return queue.length;
}

