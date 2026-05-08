'use client';

import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, initialized } = useAuth();

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [initialized, isAuthenticated]);

  if (!initialized || !isAuthenticated) {
    return fallback ?? (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
