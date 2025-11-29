import React, { createContext, useCallback, useContext, useState } from 'react';

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
  const [loading, setLoading] = useState(false);

  const handleAuthResponse = (data: any) => {
    if (!data || !data.user || !data.token) {
      throw new Error('Invalid authentication response from server');
    }
    setUser(data.user as AuthUser);
    setToken(data.token as string);
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
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
          const message =
            data?.error ||
            data?.message ||
            (Array.isArray(data?.errors) && data.errors[0]?.msg) ||
            'Unable to register. Please check your details and try again.';
          throw new Error(message);
        }

        handleAuthResponse(data);
      } catch (error: any) {
        console.error('Register error:', error);
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
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
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


