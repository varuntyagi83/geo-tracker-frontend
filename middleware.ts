import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // geo_session is a same-domain (georaydar.com) httpOnly cookie set by /api/auth/session
  // after a successful login to the Railway backend. All actual API auth uses the
  // Railway httpOnly cookie (geo_tracker_token on geotracker-production-89b8.up.railway.app).
  const session = request.cookies.get('geo_session');

  if (!session?.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
