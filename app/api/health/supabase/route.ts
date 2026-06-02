import { NextResponse } from 'next/server';

/** Connectivity probe: confirms the Supabase URL + publishable key reach the project. */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ ok: false, reason: 'missing env' }, { status: 500 });
  }
  try {
    // /auth/v1/settings returns 200 for a valid publishable key (the new
    // sb_publishable_* keys aren't JWTs, so the apikey header is the right form).
    const res = await fetch(`${url}/auth/v1/settings`, {
      headers: { apikey: key },
      cache: 'no-store',
    });
    return NextResponse.json({ ok: res.ok, status: res.status, project: url });
  } catch (e) {
    return NextResponse.json({ ok: false, reason: String(e) }, { status: 502 });
  }
}
