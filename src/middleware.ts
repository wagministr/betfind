import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Create a Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );
  
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If we're on the main page and already logged in, redirect to dashboard
  if (req.nextUrl.pathname === '/' && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If trying to access a protected route without being logged in, redirect to auth
  if (
    (req.nextUrl.pathname.startsWith('/dashboard') || 
     req.nextUrl.pathname.startsWith('/profile')) && 
    !session
  ) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  return res;
}

// Define specific paths the middleware should run on
export const config = {
  matcher: ['/', '/dashboard/:path*', '/profile/:path*', '/auth/:path*'],
}; 