'use client';

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export function createClient() {
  let maxAge: number | undefined;

  try {
    const rememberCookie = document.cookie
      .split('; ')
      .find(c => c.startsWith('remember_me='));
    const rememberMe = rememberCookie?.split('=')[1] === 'true';
    maxAge = rememberMe ? 30 * 24 * 60 * 60 : undefined;
  } catch {}

  return createBrowserClient(supabaseUrl, supabaseKey, {
    cookieOptions: {
      ...(maxAge !== undefined ? { maxAge } : {}),
      secure: true,
      sameSite: 'lax',
      path: '/',
    },
  });
}
