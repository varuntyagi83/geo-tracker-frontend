import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function hexToBytes(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes.buffer as ArrayBuffer;
}

async function verifyToken(token: string): Promise<boolean> {
  const secret = process.env.USER_SECRET_KEY;
  if (!secret) return false; // If secret not set, fall back to existence check

  try {
    const dotIdx = token.indexOf('.');
    if (dotIdx === -1) return false;
    const payload = token.slice(0, dotIdx);
    const sig = token.slice(dotIdx + 1);

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const sigBytes = hexToBytes(sig);
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payload));
    if (!valid) return false;

    // Check expiry from payload
    const payloadJson = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const exp = new Date(payloadJson.exp);
    if (exp <= new Date()) return false;

    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('geo_tracker_token');

  if (!token?.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify HMAC + expiry if secret is available
  const valid = await verifyToken(token.value);
  if (!valid && process.env.USER_SECRET_KEY) {
    // Token is invalid or expired: clear cookie and redirect
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('geo_tracker_token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
