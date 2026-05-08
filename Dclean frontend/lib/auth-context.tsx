'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from './api-client';
import type { User } from './api.types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; first_name?: string; last_name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);

  // Load user on mount
  const refreshUser = useCallback(async () => {
    const token = apiClient.getAuthToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      setInitialized(true);
      return;
    }

    try {
      setLoading(true);
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch {
      // Silently fail - user will be redirected to login
      setUser(null);
      apiClient.clearAuthToken();
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.login({ email, password });
      
      if (response.access) {
        // Token is already set in apiClient.login(), now fetch user data
        const userData = await apiClient.getCurrentUser();
        setUser(userData);
        // Use window.location for guaranteed redirect
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { email: string; username: string; password: string; password2: string; first_name?: string; last_name?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const user = await apiClient.register(data);
      setUser(user);
      // Use window.location for guaranteed redirect after registration
      window.location.href = '/';
    } catch (err: any) {
      let errorMessage = 'Registration failed';
      
      if (err.details && typeof err.details === 'object') {
        // Handle Django validation errors format: {field: [error1, error2]}
        const errorMessages: string[] = [];
        Object.entries(err.details).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach(msg => errorMessages.push(`${msg}`));
          } else {
            errorMessages.push(`${messages}`);
          }
        });
        errorMessage = errorMessages.join('\n');
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch {
      // Silently fail - clear local state anyway
      setUser(null);
      apiClient.clearAuthToken();
      router.push('/login');
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    refreshUser,
    initialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
