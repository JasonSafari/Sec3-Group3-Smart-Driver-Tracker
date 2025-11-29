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


