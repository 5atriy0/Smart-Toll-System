import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email dan password wajib diisi' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    const msg = error.message.toLowerCase();

    if (msg.includes('weak_password') || msg.includes('password should contain')) {
      return NextResponse.json({
        error: 'Password terlalu lemah. Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol.',
      }, { status: 400 });
    }

    if (error.message === 'User already registered') {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 });
    }

    if (msg.includes('rate_limit') || msg.includes('rate limit') || msg.includes('email rate')) {
      return NextResponse.json({
        error: 'Terlalu banyak permintaan. Silakan coba lagi dalam beberapa menit.',
      }, { status: 429 });
    }

    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ user: data.user, session: data.session });
}
