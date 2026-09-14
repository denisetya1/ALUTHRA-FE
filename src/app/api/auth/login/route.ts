import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({ message: 'Invalid origin' }, { status: 403 });
  let body: { email?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ message: 'Invalid request' }, { status: 400 }); }
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string' || body.email.length > 254 || body.password.length > 128) return NextResponse.json({ message: 'Enter a valid email and password.' }, { status: 400 });
  try {
    const upstream = await fetch(`${process.env.API_BASE_URL || 'http://127.0.0.1:3000/api/v1'}/admin/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: body.email, password: body.password }), cache: 'no-store', signal: AbortSignal.timeout(10000) });
    if (!upstream.ok) {
      const status = [400, 401, 429].includes(upstream.status) ? upstream.status : 502;
      const message = status === 401 ? 'Incorrect email or password.' : status === 429 ? 'Too many attempts. Please wait a minute.' : status === 400 ? 'Enter a valid email and password.' : 'Login service is unavailable. Please try again.';
      return NextResponse.json({ message }, { status });
    }
    const data = await upstream.json();
    if (typeof data.access_token !== 'string') throw new Error('Invalid upstream response');
    const response = NextResponse.json({ ok: true });
    response.cookies.set('admin_session', data.access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 3600 });
    return response;
  } catch { return NextResponse.json({ message: 'Login service is unavailable. Please try again.' }, { status: 502 }); }
}
