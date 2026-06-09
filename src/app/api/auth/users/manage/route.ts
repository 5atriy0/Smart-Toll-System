import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId, action } = await request.json();

    if (!userId || !['activate', 'deactivate'].includes(action)) {
      return NextResponse.json({ error: 'Parameter tidak valid' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options, secure: true, sameSite: 'lax', path: '/',
              });
            });
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const newStatus = action === 'activate';

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_active: newStatus })
      .eq('id', userId);

    if (updateError) {
      console.error('Toggle account update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, is_active: newStatus });
  } catch (err) {
    console.error('Toggle account error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
