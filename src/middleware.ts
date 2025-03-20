import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token');


  const { pathname } = req.nextUrl;

  // If token exists and user tries to access '/' or '/login', redirect to '/dashboard'
  if (token && (pathname === '/' || pathname.startsWith('/login'))) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // If token is missing and user tries to access protected routes, redirect to '/login'
  if (!token && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Allow the request to proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*', '/admin/:path*'], // Define protected & public routes
};
