import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function useLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login delay
    setTimeout(() => {
      setIsLoading(false);
      router.push('/');
    }, 1500);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    handleLogin,
  };
}
