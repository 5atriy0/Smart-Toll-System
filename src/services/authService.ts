import type { Profile } from '@/lib/types/supabase';
import type { User } from '@supabase/supabase-js';

export async function signIn(email: string, password: string, rememberMe: boolean) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, rememberMe }),
  });
  const data = await res.json();
  if (!res.ok) return { data: null, error: new Error(data.error) };
  return { data, error: null };
}

export async function signUp(email: string, password: string) {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) return { data: null, error: new Error(data.error) };
  return { data, error: null };
}

export async function resetPassword(email: string) {
  const supabaseClient = await import('@/lib/supabase/client').then(m => m.createClient());
  const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { data, error };
}

export async function signOut() {
  const res = await fetch('/api/auth/logout', { method: 'POST' });
  return res.ok ? { error: null } : { error: new Error('Logout gagal') };
}

export async function signInWithGoogle() {
  const { createClient } = await import('@/lib/supabase/client');
  const supabase = createClient();
  const redirectTo = `${window.location.origin}/auth/callback`;
  console.log('[signInWithGoogle] redirectTo:', redirectTo);
  console.log('[signInWithGoogle] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) console.error('[signInWithGoogle] error:', error);
  if (data?.url) console.log('[signInWithGoogle] OAuth URL:', data.url);
  return { data, error };
}

export async function getSession(): Promise<{ user: User | null; profile: Profile | null }> {
  const res = await fetch('/api/auth/me');
  const data = await res.json();
  return { user: data.user, profile: data.profile };
}
