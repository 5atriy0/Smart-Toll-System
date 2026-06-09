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
    const { profile_id, uid, vehicle_id } = await request.json();

    if (!profile_id || !uid) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Attempt to delete the card
    const { error: cardError } = await supabaseAdmin
      .from('cards')
      .delete()
      .match({ uid, profile_id });

    if (cardError) {
      // If error is foreign key constraint (23503), means there are transactions
      if (cardError.code === '23503') {
        return NextResponse.json({ error: 'Tidak dapat menghapus kartu karena sudah memiliki riwayat transaksi.' }, { status: 400 });
      }
      return NextResponse.json({ error: cardError.message || 'Gagal menghapus kartu' }, { status: 500 });
    }

    // Attempt to delete the vehicle if we have vehicle_id
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
