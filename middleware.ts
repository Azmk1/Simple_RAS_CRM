import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/magic-link/')) {
    const parts = request.nextUrl.pathname.split('/');
    if (parts.length < 3) return NextResponse.next();
    
    const token = parts[2];
    const response = NextResponse.next();
    
    const cookieName = `device_fingerprint`;
    let fingerprint = request.cookies.get(cookieName)?.value;
    
    if (!fingerprint) {
      fingerprint = crypto.randomUUID();
      const newResponse = NextResponse.next({
        request: {
          headers: new Headers(request.headers)
        }
      });
      newResponse.headers.set('x-device-fingerprint', fingerprint);
      newResponse.cookies.set(cookieName, fingerprint, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365 
      });
      return newResponse;
    }
    
    // If it exists, still pass it via header for consistency
    const existResponse = NextResponse.next({
      request: {
        headers: new Headers(request.headers)
      }
    });
    existResponse.headers.set('x-device-fingerprint', fingerprint);
    return existResponse;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/magic-link/:path*'],
}
