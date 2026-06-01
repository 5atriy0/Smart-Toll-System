'use client';

import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/ui/ToastContainer';
import type { ReactNode } from 'react';

export function ToastWrapper({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}
