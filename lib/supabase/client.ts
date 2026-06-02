import { createClient } from '@supabase/supabase-js';

/**
 * Browser/public Supabase client (publishable key — safe client-side).
 * The foundation for Z2's guild layer: accounts, boards, idea voting, presence.
 * Server-side auth (cookies via @supabase/ssr) lands when we build the auth flow.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Surfaced clearly in dev rather than failing cryptically deep in a call.
  console.warn('[z2] Supabase env missing — set NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    // implicit flow returns the session in the URL hash on redirect, so OAuth +
    // magic-link both work in this client-only app with no server callback route.
    flowType: 'implicit',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});
