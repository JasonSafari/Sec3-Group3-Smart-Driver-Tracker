import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Minimal declaration so TypeScript accepts process.env in React Native without Node types
declare const process: any;

type AuthUser = {
  user_id: number;
  name: string;
  email: string;
  role: 'parent' | 'teen';
  family_id?: number | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: 'parent' | 'teen';
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Support both Expo env vars and a sensible default without requiring Node.js types
const API_BASE_URL: string =
  (typeof process !== 'undefined' &&
    (process as any)?.env?.EXPO_PUBLIC_API_URL) ||
  'http://localhost:3000/api';

// Log the API URL being used (for debugging)
if (__DEV__) {
  console.log('API_BASE_URL:', API_BASE_URL);
}

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start as true to check AsyncStorage

  // Load user data from AsyncStorage on mount
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem('userToken'),
          AsyncStorage.getItem('userData'),
        ]);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser) as AuthUser);
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  const handleAuthResponse = async (data: any) => {
    console.log('handleAuthResponse data:', data);
    if (!data || !data.user || !data.token) {
      console.error('Invalid auth response:', data);
      throw new Error('Invalid authentication response from server');
    }
    const userData = data.user as AuthUser;
    const tokenData = data.token as string;
    
    console.log('Storing user data:', { ...userData, token: '***' });
    
    // Store in state
    setUser(userData);
    setToken(tokenData);
    
    // Store in AsyncStorage
    try {
      await Promise.all([
        AsyncStorage.setItem('userToken', tokenData),
        AsyncStorage.setItem('userData', JSON.stringify(userData)),
      ]);
      console.log('Auth data stored successfully');
    } catch (storageError) {
      console.error('Error storing auth data:', storageError);
      throw new Error('Failed to save authentication data');
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/auth/login`);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const message =
          data?.error || data?.message || 'Unable to login. Please try again.';
        throw new Error(message);
      }

      handleAuthResponse(data);
    } catch (error: any) {
      console.error('Login error:', error);
      // Handle network errors specifically
      if (error.message === 'Network request failed' || error.name === 'TypeError') {
        throw new Error(
          'Cannot connect to server. Make sure:\n' +
          '1. Backend is running (npm run dev in backend folder)\n' +
          '2. Your phone and PC are on the same Wi-Fi\n' +
          '3. EXPO_PUBLIC_API_URL in .env points to your PC\'s IP address'
        );
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      role: 'parent' | 'teen';
    }) => {
      setLoading(true);
      try {
        console.log('Attempting register to:', `${API_BASE_URL}/auth/register`);
        console.log('Register payload:', { ...payload, password: '***' });
        
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        console.log('Register response status:', response.status);
        console.log('Register response ok:', response.ok);

        let data;
        try {
          const text = await response.text();
          console.log('Register response text:', text);
          data = text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error('Failed to parse response:', parseError);
          throw new Error('Invalid response from server. Please try again.');
        }

        if (!response.ok) {
          const message =
            data?.error ||
            data?.message ||
            (Array.isArray(data?.errors) && data.errors[0]?.msg) ||
            `Registration failed (${response.status}). Please check your details and try again.`;
          console.error('Register error response:', data);
          throw new Error(message);
        }

        await handleAuthResponse(data);
      } catch (error: any) {
        console.error('Register error:', error);
        console.error('Error details:', {
          message: error?.message,
          name: error?.name,
          stack: error?.stack,
        });
        
        // Handle network errors specifically
        if (error.message === 'Network request failed' || error.name === 'TypeError' || error.message?.includes('fetch')) {
          throw new Error(
            'Cannot connect to server. Make sure:\n' +
            '1. Backend is running (npm run dev in backend folder)\n' +
            '2. Your phone and PC are on the same Wi-Fi\n' +
            '3. EXPO_PUBLIC_API_URL in .env points to your PC\'s IP address'
          );
        }
        
        // Re-throw with original message if it exists
        if (error.message) {
          throw error;
        }
        
        throw new Error('Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    // Clear state FIRST (immediate) to prevent any redirects
    setUser(null);
    setToken(null);
    
    // Then clear AsyncStorage (async, non-blocking)
    try {
      await AsyncStorage.multiRemove(['userToken', 'userData', 'activeTripId', 'tripDataPoints']);
    } catch (error) {
      console.error('Error clearing storage on logout:', error);
      // State is already cleared, so this is fine
    }
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}


