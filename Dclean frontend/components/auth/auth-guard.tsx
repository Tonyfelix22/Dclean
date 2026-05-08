'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, initialized } = useAuth();

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [initialized, isAuthenticated]);

  if (!initialized) {
    return (
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
