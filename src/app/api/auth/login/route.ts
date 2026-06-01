import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password, rememberMe } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 0; // 30 hari vs session

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              ...options,
              maxAge,
              secure: true,
              sameSite: 'lax',
              path: '/',
            });
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({
      error: error.message === 'Invalid login credentials'
        ? 'Email atau password salah'
        : error.message,
    }, { status: 401 });
  }

  // Flag cookie untuk client — baca cookie-nya untuk tau maxAge auth cookie
  cookieStore.set('remember_me', rememberMe ? 'true' : 'false', {
    maxAge: rememberMe ? 30 * 24 * 60 * 60 : 0,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });

  return NextResponse.json({ success: true });
}
