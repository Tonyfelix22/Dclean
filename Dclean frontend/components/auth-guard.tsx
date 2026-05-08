'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Shield } from 'lucide-react';

/**
 * Wrap any page with <AuthGuard> to require authentication.
 * Redirects to /landing while loading, then to /login if not authenticated.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/landing');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show a branded full-screen loader while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-2xl animate-pulse-glow">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/40 to-accent/40 blur-xl animate-pulse" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-2xl font-bold gradient-text">Dclean</h2>
          <div className="flex gap-1.5 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
