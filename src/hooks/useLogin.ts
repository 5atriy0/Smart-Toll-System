import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/services/authService';

export function useLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    try {
      const rememberCookie = document.cookie
        .split('; ')
        .find(c => c.startsWith('remember_me='));
      if (rememberCookie?.split('=')[1] === 'true') {
        const savedEmail = localStorage.getItem('tollytics_email');
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      }
    } catch {}
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: authError } = await signIn(email, password, rememberMe);

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    try {
      if (rememberMe) {
        localStorage.setItem('tollytics_email', email);
      } else {
        localStorage.removeItem('tollytics_email');
      }
    } catch {}

    const { profile } = await import('@/services/authService').then(m => m.getSession());
    if (profile?.role === 'USER') {
      router.push('/user');
    } else {
      router.push('/dashboard');
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    rememberMe,
    setRememberMe,
    showPassword,
    setShowPassword,
    handleLogin,
  };
}
