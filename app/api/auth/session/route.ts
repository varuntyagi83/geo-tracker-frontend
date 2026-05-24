import { NextRequest, NextResponse } from 'next/server';

// POST: record that a session exists (called after successful Railway login)
export async function POST(req: NextRequest) {
  let token: string | undefined;
  try {
    const body = await req.json();
    token = body?.token;
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  if (!token || typeof token !== 'string' || !token.includes('.')) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
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
