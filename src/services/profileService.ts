import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types/supabase';

export async function updateProfile(authUserId: string, updates: { name?: string; email?: string }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('auth_user_id', authUserId)
    .select()
    .maybeSingle();
  return { profile: data as Profile | null, error };
}
