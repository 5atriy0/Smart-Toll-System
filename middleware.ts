import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const rememberMe = request.cookies.get('remember_me')?.value === 'true';
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : undefined;

  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              ...(name.startsWith('sb-') && maxAge !== undefined ? { maxAge } : {}),
              secure: true,
              sameSite: 'lax',
              path: '/',
            });
          });
        },
      },
    }
  );

  return response;
}

export const config = {
  matcher: ['/auth/:path*', '/dashboard/:path*', '/users/:path*', '/transactions/:path*', '/analytics/:path*', '/settings/:path*', '/profile/:path*'],
};
