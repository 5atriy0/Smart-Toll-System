'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/services/authService';
import { LoginView } from '@/views/LoginView'

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    getSession().then(({ session }) => {
      if (session) router.push('/');
    });
  }, [router]);

  return <LoginView />
}
