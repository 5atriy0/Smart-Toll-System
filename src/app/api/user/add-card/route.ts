import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client to bypass RLS
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

export async function POST(request: Request) {
  try {
    const { profile_id, uid, plate_number, vehicle_type } = await request.json();

    if (!profile_id || !uid || !plate_number || !vehicle_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Insert into vehicles
    const { data: vehicleData, error: vehicleError } = await supabaseAdmin
      .from('vehicles')
      .insert({
        profile_id,
        plate_number,
        vehicle_type
      })
      .select()
      .single();

    if (vehicleError) {
      return NextResponse.json({ error: vehicleError.message || 'Gagal menambahkan kendaraan' }, { status: 500 });
    }

    // 2. Insert into cards
    const { data: cardData, error: cardError } = await supabaseAdmin
      .from('cards')
      .insert({
        profile_id,
        vehicle_id: vehicleData.id,
        uid,
        balance: 0,
        status: 'ACTIVE'
      })
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
