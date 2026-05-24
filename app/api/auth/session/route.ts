import { NextRequest, NextResponse } from 'next/server';

async function verifyToken(token: string): Promise<boolean> {
  const secret = process.env.USER_SECRET_KEY;
  if (!secret) return false;

  const dotIndex = token.indexOf('.');
  if (dotIndex === -1 || dotIndex === token.length - 1) return false;

  const payloadB64 = token.slice(0, dotIndex);
  const sig = token.slice(dotIndex + 1);

  const keyData = new TextEncoder().encode(secret);
  const msgData = new TextEncoder().encode(payloadB64);

  let cryptoKey: CryptoKey;
  try {
    cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
  } catch {
    return false;
  }

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  const signatureHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  if (signatureHex.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < signatureHex.length; i++) {
    diff |= signatureHex.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  if (diff !== 0) return false;

  try {
    const padded = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
    const payload = JSON.parse(json) as { exp?: string };
    if (!payload.exp) return false;
    const exp = new Date(payload.exp);
    if (isNaN(exp.getTime()) || new Date() > exp) return false;
    return true;
  } catch {
    return false;
  }
}

// POST: record that a session exists (called after successful Railway login)
export async function POST(req: NextRequest) {
  let token: string | undefined;
  try {
    const body = await req.json();
    token = body?.token;
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const valid = await verifyToken(token);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set('geo_session', '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 604800,
    path: '/',
  });
  return res;
}

// DELETE: clear the same-domain session flag on logout
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete('geo_session');
  return res;
}
