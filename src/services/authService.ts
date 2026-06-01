import type { Profile } from '@/types/supabase';
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
  const supabaseClient = await import('@/lib/supabase/client').then(m => m.createClient());
  const { data, error } = await supabaseClient.auth.signUp({ email, password });
  return { data, error };
}

export async function resetPassword(email: string) {
  const supabaseClient = await import('@/lib/supabase/client').then(m => m.createClient());
  const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  });
  return { data, error };
}

export async function signOut() {
  const res = await fetch('/api/auth/logout', { method: 'POST' });
  return res.ok ? { error: null } : { error: new Error('Logout gagal') };
}

export async function getSession(): Promise<{ user: User | null; profile: Profile | null }> {
  const res = await fetch('/api/auth/me');
  const data = await res.json();
  return { user: data.user, profile: data.profile };
}
