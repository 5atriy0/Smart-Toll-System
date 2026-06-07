'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, signIn as apiSignIn, signOut as apiSignOut, signInWithGoogle as apiSignInWithGoogle } from '@/services/authService';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string, rememberMe: boolean) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchProfile = useCallback(async (userId: string, userEmail?: string) => {
    const supabase = createClient();
    let { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', userId)
      .maybeSingle();

    if (!data) {
      const name = userEmail?.split('@')[0] || 'User';
      const { data: newProfile } = await supabase
        .from('profiles')
        .insert({
          auth_user_id: userId,
          name,
          email: userEmail || '',
          role: 'USER',
        })
        .select()
        .single();
      if (newProfile) data = newProfile as Profile;
    }

    if (data && userEmail && data.email !== userEmail) {
      const { data: updated } = await supabase
        .from('profiles')
        .update({ email: userEmail })
        .eq('auth_user_id', userId)
        .select()
        .maybeSingle();
      if (updated) data = updated as Profile;
    }

    if (data) setProfile(data as Profile);
  }, []);

  useEffect(() => {
    getSession().then(({ user: u, profile: p }) => {
      if (u) {
        setUser(u);
        if (!p) {
          fetchProfile(u.id, u.email);
        } else {
          setProfile(p);
        }
      }
      setIsLoading(false);
    });
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    const { data, error } = await apiSignIn(email, password, rememberMe);
    if (!error && data) {
      const { user: u, profile: p } = await getSession();
      setUser(u);
      setProfile(p);
    }
    return { error };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await apiSignInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    await apiSignOut();
    setUser(null);
    setProfile(null);
    router.push('/login');
  }, [router]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();
    if (data) setProfile(data as Profile);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
