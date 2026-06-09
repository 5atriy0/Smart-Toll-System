import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, { ...options, secure: true, sameSite: 'lax', path: '/' });
            });
          },
        },
      }
    );

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile_id, uid, vehicle_id } = await request.json();
    if (!profile_id || !uid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', profile_id)
      .eq('auth_user_id', authUser.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error: cardError } = await supabaseAdmin
      .from('cards')
      .delete()
      .match({ uid, profile_id });

    if (cardError) {
      if (cardError.code === '23503') {
        return NextResponse.json({ error: 'Tidak dapat menghapus kartu karena sudah memiliki riwayat transaksi.' }, { status: 400 });
      }
      return NextResponse.json({ error: cardError.message || 'Gagal menghapus kartu' }, { status: 500 });
    }

    if (vehicle_id) {
      const { error: vehicleError } = await supabaseAdmin
        .from('vehicles')
        .delete()
        .match({ id: vehicle_id, profile_id });

      if (vehicleError && vehicleError.code !== '23503') {
        console.warn('Could not delete orphaned vehicle:', vehicleError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting card via API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
