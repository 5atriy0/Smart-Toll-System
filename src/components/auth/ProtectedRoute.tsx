'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(38, 91%, 41%)' }}>
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="6" width="24" height="20" rx="3" stroke="white" strokeWidth="2.5" fill="none"/>
              <rect x="11" y="11" width="10" height="10" rx="1.5" stroke="white" strokeWidth="1.8" fill="none"/>
              <line x1="14" y1="16" x2="18" y2="16" stroke="white" strokeWidth="2"/>
              <line x1="16" y1="14" x2="16" y2="18" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
