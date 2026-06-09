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

    const { profile_id, uid, plate_number, vehicle_type } = await request.json();
    if (!profile_id || !uid || !plate_number || !vehicle_type) {
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

    const { data: vehicleData, error: vehicleError } = await supabaseAdmin
      .from('vehicles')
      .insert({ profile_id, plate_number, vehicle_type })
      .select()
      .single();

    if (vehicleError) {
      return NextResponse.json({ error: vehicleError.message || 'Gagal menambahkan kendaraan' }, { status: 500 });
    }

    const { data: cardData, error: cardError } = await supabaseAdmin
      .from('cards')
      .insert({ profile_id, vehicle_id: vehicleData.id, uid, balance: 0, status: 'ACTIVE' })
      .select()
      .single();

    if (cardError) {
      return NextResponse.json({ error: cardError.message || 'Gagal menambahkan kartu' }, { status: 500 });
    }

    return NextResponse.json({ success: true, vehicle: vehicleData, card: cardData });
  } catch (error: any) {
    console.error('Error adding card via API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
