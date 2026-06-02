'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase/client';

interface GuildContextValue {
  session: Session | null;
  user: User | null;
  ready: boolean;
  /** live count of operators currently in the guild (Realtime presence) */
  operators: number;
  signInDiscord: () => Promise<{ error: string | null }>;
  signInEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const GuildContext = createContext<GuildContextValue | null>(null);

export function GuildProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [operators, setOperators] = useState(1);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setReady(true);
      return;
    }

    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Live presence — count operators currently in the guild. Ephemeral (no DB),
  // works immediately with the anon key.
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    const key =
      typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `op-${Date.now()}`;
    const channel = supabase.channel('guild-presence', { config: { presence: { key } } });
    channel
      .on('presence', { event: 'sync' }, () => {
        setOperators(Math.max(1, Object.keys(channel.presenceState()).length));
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') channel.track({ at: Date.now() });
      });
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const signInDiscord = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase is not configured' };

    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo },
    });
    return { error: error?.message ?? null };
  }, []);

  const signInEmail = useCallback(async (email: string) => {
    const supabase = getSupabase();
    if (!supabase) return { error: 'Supabase is not configured' };

    const emailRedirectTo = typeof window !== 'undefined' ? window.location.origin : undefined;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return (
    <GuildContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        ready,
        operators,
        signInDiscord,
        signInEmail,
        signOut,
      }}
    >
      {children}
    </GuildContext.Provider>
  );
}

export function useGuild() {
  const ctx = useContext(GuildContext);
  if (!ctx) throw new Error('useGuild must be used within GuildProvider');
  return ctx;
}
