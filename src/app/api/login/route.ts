import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { identifier, password } = await req.json();

  const response = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: data?.error?.message || 'Login failed' }, { status: 401 });
  }

  // ✅ Set cookie
  const res = NextResponse.json({
    user: data.user,
    jwt: data.jwt, // ✅ return this so frontend can access it!
  });

  res.cookies.set('token', data.jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 day
  });

  return res;
}
