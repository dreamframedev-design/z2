'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import Reveal from '@/components/ui/Reveal';
import { supabase } from '@/lib/supabase/client';
import { useGuild } from '@/components/providers/GuildProvider';

interface Idea {
  id: string;
  world: string;
  title: string;
  body: string | null;
  status: string;
  score: number;
  voters: number;
}

type Status = 'loading' | 'setup' | 'error' | 'ready';

const WORLDS = ['games', 'sound', 'film', 'dreamframe', 'forge', 'general'] as const;
const WORLD_COLOR: Record<string, string> = {
  games: 'var(--blood)',
  sound: 'var(--ember)',
  film: 'var(--blood)',
  dreamframe: 'var(--ember)',
  forge: 'var(--blood)',
  general: 'var(--ash)',
};

/* ----------------------------------------------------------- sign-in panel */

function AuthPanel() {
  const { signInDiscord, signInEmail } = useGuild();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setBusy(true);
    setErr(null);
    const { error } = await signInEmail(email);
    setBusy(false);
    if (error) setErr(error);
    else setSent(true);
  };

  return (
    <div className="border hairline bg-[var(--surface)] p-8 sm:p-10">
      <p className="label-mono text-[10px] text-[var(--blood)]">Guild login</p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--ash)]">
        Sign in to submit signals and vote on what the guild builds next.
      </p>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => signInDiscord()}
          className="label-mono flex items-center justify-center gap-2 bg-[var(--blood)] px-6 py-3.5 text-[11px] text-[var(--bone)] transition-colors hover:bg-[var(--ember)]"
        >
          <span aria-hidden>◈</span> Continue with Discord
        </button>
        <span className="label-mono text-[10px] text-[var(--ash-dim)]">or</span>
        {sent ? (
          <p className="text-sm text-[var(--ember)]">Check your email for the magic link ↗</p>
        ) : (
          <form onSubmit={onEmail} className="flex flex-1 flex-col gap-2 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@signal.dev"
              className="mono flex-1 border hairline bg-[var(--void)] px-4 py-3 text-sm text-[var(--bone)] outline-none transition-colors placeholder:text-[var(--ash-dim)] focus:border-[var(--line-strong)]"
            />
            <button
              type="submit"
              disabled={busy}
              className="label-mono border hairline px-5 py-3 text-[11px] text-[var(--ash)] transition-colors hover:text-[var(--bone)] disabled:opacity-50"
            >
              {busy ? 'Sending…' : 'Email me a link'}
            </button>
          </form>
        )}
      </div>
      {err && <p className="mono mt-3 text-xs text-[var(--blood)]">{err}</p>}
    </div>
  );
}

/* ----------------------------------------------------------- submit a signal */

function SubmitForm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [world, setWorld] = useState<string>('general');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) return;
    setBusy(true);
    setErr(null);
    const { error } = await supabase
      .from('ideas')
      .insert({ author_id: userId, world, title: title.trim(), body: body.trim() });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    setTitle('');
    setBody('');
    setOpen(false);
    onDone();
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="label-mono border hairline px-5 py-3 text-[11px] text-[var(--bone)] transition-colors hover:border-[var(--line-strong)]"
      >
        ＋ Transmit a signal
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="border hairline bg-[var(--surface)] p-6 sm:p-8">
      <div className="flex flex-wrap gap-2">
        {WORLDS.map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setWorld(w)}
            className="label-mono rounded-full border px-3 py-1 text-[10px] transition-colors"
            style={{
              borderColor: world === w ? (WORLD_COLOR[w] ?? 'var(--ash)') : 'var(--line)',
              color: world === w ? (WORLD_COLOR[w] ?? 'var(--bone)') : 'var(--ash)',
            }}
          >
            {w}
          </button>
        ))}
      </div>
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={140}
        placeholder="The signal — one bold line"
        className="display-2 mt-5 w-full border-0 border-b hairline bg-transparent pb-2 text-lg text-[var(--bone)] outline-none placeholder:text-[var(--ash-dim)] focus:border-[var(--line-strong)]"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Why it matters (optional)"
        className="mt-4 w-full resize-none bg-transparent text-sm text-[var(--ash)] outline-none placeholder:text-[var(--ash-dim)]"
      />
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={busy || title.trim().length < 3}
          className="label-mono bg-[var(--blood)] px-6 py-3 text-[11px] text-[var(--bone)] transition-colors hover:bg-[var(--ember)] disabled:opacity-40"
        >
          {busy ? 'Transmitting…' : 'Transmit'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="label-mono text-[10px] text-[var(--ash)] transition-colors hover:text-[var(--bone)]"
        >
          Cancel
        </button>
        {err && <span className="mono text-xs text-[var(--blood)]">{err}</span>}
      </div>
    </form>
  );
}

/* --------------------------------------------------------------- filter chip */

function FilterChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="label-mono rounded-full border px-3 py-1 text-[10px] transition-colors"
      style={{ borderColor: active ? color : 'var(--line)', color: active ? color : 'var(--ash)' }}
    >
      {label}
    </button>
  );
}

/* ----------------------------------------------------------------- board */

export default function SignalBoard() {
  const { user, signOut, operators } = useGuild();
  const [status, setStatus] = useState<Status>('loading');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [errMsg, setErrMsg] = useState('');
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [worldFilter, setWorldFilter] = useState<string | null>(null);
  const reloadTimer = useRef<number | undefined>(undefined);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('idea_scores')
      .select('*')
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(24);

    if (error) {
      const missing = error.code === 'PGRST205' || /does not exist|schema cache/i.test(error.message);
      setStatus(missing ? 'setup' : 'error');
      setErrMsg(error.message);
      return;
    }
    setIdeas((data as Idea[]) ?? []);
    setStatus('ready');

    if (user) {
      const { data: mine } = await supabase.from('votes').select('idea_id').eq('voter_id', user.id);
      setVoted(new Set((mine ?? []).map((v: { idea_id: string }) => v.idea_id)));
    } else {
      setVoted(new Set());
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Live: votes + new signals appear without a refresh (Supabase Realtime).
  // Lights up once the tables are in the supabase_realtime publication
  // (see supabase/schema.sql). Harmless if not yet enabled.
  useEffect(() => {
    const reloadSoon = () => {
      window.clearTimeout(reloadTimer.current);
      reloadTimer.current = window.setTimeout(() => load(), 350);
    };
    const channel = supabase
      .channel('signal-board')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, reloadSoon)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, reloadSoon)
      .subscribe();
    return () => {
      window.clearTimeout(reloadTimer.current);
      supabase.removeChannel(channel);
    };
  }, [load]);

  const toggleVote = async (idea: Idea) => {
    if (!user) {
      document.getElementById('guild-auth')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const has = voted.has(idea.id);
    // optimistic
    setVoted((prev) => {
      const n = new Set(prev);
      if (has) n.delete(idea.id);
      else n.add(idea.id);
      return n;
    });
    setIdeas((prev) =>
      prev.map((i) =>
        i.id === idea.id
          ? { ...i, score: i.score + (has ? -1 : 1), voters: i.voters + (has ? -1 : 1) }
          : i
      )
    );
    if (has) {
      await supabase.from('votes').delete().eq('idea_id', idea.id).eq('voter_id', user.id);
    } else {
      await supabase.from('votes').insert({ idea_id: idea.id, voter_id: user.id });
    }
  };

  const displayName =
    (user?.user_metadata?.name as string) ||
    (user?.user_metadata?.full_name as string) ||
    user?.email ||
    'operator';

  const shown = worldFilter ? ideas.filter((i) => i.world === worldFilter) : ideas;
  const totalVotes = ideas.reduce((sum, i) => sum + i.voters, 0);

  return (
    <section id="signal" className="border-t hairline">
      <div className="mx-auto max-w-[1400px] px-6 py-24 sm:px-12 sm:py-32">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="label-mono text-[10px] text-[var(--blood)]">The Commons · Signal Board</span>
            <h2 className="display-2 mt-4 max-w-2xl text-[clamp(1.8rem,4vw,3rem)] text-[var(--bone)]">
              The guild votes on what we build next.
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-[var(--ash)]">
              Submit a signal, rank the queue. Top signals get forwarded to the forge — and, soon,
              to the agentic build engine.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="label-mono flex flex-wrap items-center gap-2 text-[10px] text-[var(--ash)]">
              <span
                className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--blood)]"
                style={{ boxShadow: '0 0 8px var(--glow)' }}
              />
              {operators} online
              <span className="text-[var(--ash-dim)]">
                · {ideas.length} signals · {totalVotes} votes
              </span>
            </span>
            {user && (
              <span className="label-mono flex items-center gap-2 text-[10px] text-[var(--ash)]">
                {displayName}
                <button
                  onClick={() => signOut()}
                  className="text-[var(--ash-dim)] transition-colors hover:text-[var(--bone)]"
                >
                  sign out
                </button>
              </span>
            )}
          </div>
        </Reveal>

        <Reveal>
          {status === 'loading' && (
            <p className="label-mono py-10 text-[11px] text-[var(--ash-dim)]">
              <span className="z2-caret">acquiring signal</span>
            </p>
          )}

          {status === 'setup' && (
            <div className="border hairline bg-[var(--surface)] p-8 sm:p-10">
              <p className="label-mono text-[10px] text-[var(--ember)]">Board offline</p>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--ash)]">
                Wired to Supabase, but the tables aren&apos;t live yet. Run{' '}
                <span className="mono text-[var(--bone)]">supabase/schema.sql</span> in your Supabase
                SQL editor to ignite it — seeded signals appear here instantly.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="border hairline bg-[var(--surface)] p-8">
              <p className="label-mono text-[10px] text-[var(--blood)]">Signal lost</p>
              <p className="mono mt-3 text-sm text-[var(--ash)]">{errMsg}</p>
            </div>
          )}

          {status === 'ready' && (
            <>
              {ideas.length === 0 ? (
                <p className="py-8 text-sm text-[var(--ash)]">No signals yet — transmit the first.</p>
              ) : (
                <>
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <FilterChip active={worldFilter === null} onClick={() => setWorldFilter(null)} label="all" color="var(--bone)" />
                  {WORLDS.map((w) => (
                    <FilterChip
                      key={w}
                      active={worldFilter === w}
                      onClick={() => setWorldFilter(w)}
                      label={w}
                      color={WORLD_COLOR[w] ?? 'var(--ash)'}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-px overflow-hidden border hairline bg-[var(--line)] sm:grid-cols-2">
                  {shown.map((idea, i) => {
                    const hasVoted = voted.has(idea.id);
                    const isTop = !worldFilter && i === 0 && idea.score > 0;
                    return (
                      <div
                        key={idea.id}
                        className="group flex items-start gap-5 bg-[var(--void)] p-6 transition-colors duration-500 hover:bg-[var(--surface)] sm:p-8"
                        style={isTop ? { boxShadow: 'inset 3px 0 0 var(--ember)' } : undefined}
                      >
                        <button
                          type="button"
                          onClick={() => toggleVote(idea)}
                          aria-pressed={hasVoted}
                          aria-label={hasVoted ? 'Retract vote' : 'Vote'}
                          className="flex shrink-0 flex-col items-center gap-1 border px-3 py-2 transition-colors"
                          style={{
                            borderColor: hasVoted ? 'var(--ember)' : 'var(--line)',
                            color: hasVoted ? 'var(--ember)' : 'var(--ash)',
                          }}
                        >
                          <span>▲</span>
                          <span className="mono text-sm text-[var(--bone)]">{idea.score}</span>
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            {isTop && (
                              <span className="label-mono flex items-center gap-1 text-[9px] text-[var(--ember)]">
                                <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-[var(--ember)]" />
                                top signal
                              </span>
                            )}
                            <span className="label-mono text-[9px]" style={{ color: WORLD_COLOR[idea.world] ?? 'var(--ash)' }}>
                              {idea.world}
                            </span>
                            <span className="label-mono text-[9px] text-[var(--ash-dim)]">
                              {idea.voters} {idea.voters === 1 ? 'voter' : 'voters'}
                            </span>
                            {idea.status !== 'open' && (
                              <span className="label-mono text-[9px] text-[var(--ash-dim)]">· {idea.status}</span>
                            )}
                          </div>
                          <h3 className="display-2 mt-2 text-lg text-[var(--bone)] sm:text-xl">{idea.title}</h3>
                          {idea.body && (
                            <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--ash)]">{idea.body}</p>
                          )}
                        </div>

                        <span className="ml-auto hidden shrink-0 self-center text-[var(--ash-dim)] transition-all duration-500 group-hover:translate-x-1 group-hover:text-[var(--ember)] sm:block">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                    );
                  })}
                </div>
                </>
              )}

              {/* submit / login */}
              <div id="guild-auth" className="mt-8 scroll-mt-28">
                {user ? <SubmitForm userId={user.id} onDone={load} /> : <AuthPanel />}
              </div>
            </>
          )}
        </Reveal>
      </div>
    </section>
  );
}
