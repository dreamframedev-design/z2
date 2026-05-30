'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Reveal from '@/components/ui/Reveal';
import { setScrollLocked } from '@/components/providers/SmoothScroll';
import { CAPABILITIES, CLIPS, DISPATCHES, type Clip } from '@/lib/site-data';

/* ----------------------------------------------------------------- MARQUEE */

export function Marquee() {
  const words = ['Games', 'Spatial Sound', 'Film', 'Instruments', 'Worlds', 'Experiments'];
  const strip = [...words, ...words];
  return (
    <div className="relative overflow-hidden border-y hairline py-5">
      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
        {strip.map((w, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className="display-2 text-2xl text-[var(--bone)] opacity-70 sm:text-3xl">
              {w}
            </span>
            <span className="text-[var(--blood)]">✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ CAPABILITIES */

export function Capabilities() {
  return (
    <section id="capabilities" className="mx-auto max-w-[1400px] px-6 py-24 sm:px-12 sm:py-32">
      <Reveal className="mb-14 flex items-end justify-between">
        <h2 className="display-2 max-w-2xl text-[clamp(1.8rem,4vw,3rem)] text-[var(--bone)]">
          A guild of disciplines, one obsession.
        </h2>
        <span className="label-mono hidden text-[10px] text-[var(--ash-dim)] sm:block">
          What we do
        </span>
      </Reveal>

      <div className="grid grid-cols-1 gap-px overflow-hidden border hairline bg-[var(--line)] sm:grid-cols-2">
        {CAPABILITIES.map((cap, i) => (
          <Reveal
            key={cap.id}
            delay={i * 80}
            className="group relative bg-[var(--void)] p-8 transition-colors duration-500 hover:bg-[var(--surface)] sm:p-12"
          >
            <div className="flex items-baseline gap-4">
              <span className="label-mono text-[11px] text-[var(--blood)]">{cap.no}</span>
              <h3 className="display-2 text-2xl text-[var(--bone)] sm:text-3xl">{cap.title}</h3>
            </div>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[var(--ash)]">
              {cap.body}
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {cap.tags.map((t) => (
                <span
                  key={t}
                  className="mono rounded-full border hairline px-3 py-1 text-[11px] text-[var(--ash)]"
                >
                  {t}
                </span>
              ))}
            </div>
            <span className="pointer-events-none absolute right-8 top-8 text-[var(--ash-dim)] transition-all duration-500 group-hover:translate-x-1 group-hover:text-[var(--ember)]">
              ↗
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- REEL */

function ClipCard({ clip, onOpen }: { clip: Clip; onOpen: (c: Clip) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(clip)}
      className="group relative aspect-video w-full overflow-hidden border hairline text-left"
    >
      <div
        className="absolute inset-0 scale-105 transition-transform duration-700 group-hover:scale-110"
        style={{ background: clip.poster }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {/* play */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-black/30 backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:border-white/80">
          <span className="ml-1 block border-y-[7px] border-l-[12px] border-y-transparent border-l-white" />
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
        <div>
          <p className="label-mono text-[9px]" style={{ color: clip.accent }}>
            {clip.kind}
          </p>
          <p className="mt-1 text-sm font-medium text-white">{clip.title}</p>
        </div>
        <span className="mono rounded bg-black/50 px-2 py-1 text-[10px] text-white/80">
          {clip.duration}
        </span>
      </div>
    </button>
  );
}

function Lightbox({ clip, onClose }: { clip: Clip; onClose: () => void }) {
  useEffect(() => {
    setScrollLocked(true);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      setScrollLocked(false);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

      <motion.div
        className="relative w-full max-w-5xl"
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 10 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-video w-full overflow-hidden border hairline">
          <div className="absolute inset-0" style={{ background: clip.poster }} />
          <div className="absolute inset-0 bg-black/30" />
          {/* faux scanning shimmer */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/50 bg-black/30">
                <span className="ml-1 block border-y-[9px] border-l-[15px] border-y-transparent border-l-white" />
              </span>
              <p className="label-mono mt-5 text-[10px] text-white/70">Footage incoming</p>
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between gap-6 border border-t-0 hairline bg-[var(--surface)] p-6">
          <div>
            <p className="label-mono text-[10px]" style={{ color: clip.accent }}>
              {clip.kind} · {clip.duration}
            </p>
            <h3 className="display-2 mt-2 text-xl text-[var(--bone)] sm:text-2xl">{clip.title}</h3>
            <p className="mt-2 text-sm text-[var(--ash)]">{clip.note}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="label-mono shrink-0 border hairline px-4 py-2 text-[10px] text-[var(--ash)] transition-colors hover:text-[var(--bone)]"
          >
            Close ✕
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Reel() {
  const [active, setActive] = useState<Clip | null>(null);

  return (
    <section id="reel" className="border-t hairline">
      <div className="mx-auto max-w-[1400px] px-6 py-24 sm:px-12 sm:py-32">
        <Reveal className="mb-14 flex items-end justify-between">
          <div>
            <span className="label-mono text-[10px] text-[var(--blood)]">The Reel</span>
            <h2 className="display-2 mt-4 max-w-2xl text-[clamp(1.8rem,4vw,3rem)] text-[var(--bone)]">
              Clips, captures &amp; works in progress.
            </h2>
          </div>
          <span className="label-mono hidden text-[10px] text-[var(--ash-dim)] sm:block">
            {String(CLIPS.length).padStart(2, '0')} clips
          </span>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CLIPS.map((clip, i) => (
            <Reveal key={clip.id} delay={(i % 3) * 90}>
              <ClipCard clip={clip} onOpen={setActive} />
            </Reveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active && <Lightbox clip={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
}

/* ---------------------------------------------------------------- DISPATCH */

export function Dispatch() {
  return (
    <section id="dispatch" className="border-t hairline">
      <div className="mx-auto max-w-[1400px] px-6 py-24 sm:px-12 sm:py-32">
        <Reveal className="mb-14 flex items-end justify-between">
          <div>
            <span className="label-mono text-[10px] text-[var(--blood)]">Dispatch</span>
            <h2 className="display-2 mt-4 max-w-2xl text-[clamp(1.8rem,4vw,3rem)] text-[var(--bone)]">
              Field notes from the workshop.
            </h2>
          </div>
          <a
            href="#connect"
            className="label-mono hidden text-[10px] text-[var(--ash)] transition-colors hover:text-[var(--bone)] sm:block"
          >
            Subscribe ↗
          </a>
        </Reveal>

        <div className="border-t hairline">
          {DISPATCHES.map((d, i) => (
            <Reveal key={d.id} delay={i * 70}>
              <a
                href="#connect"
                className="group grid grid-cols-1 items-baseline gap-3 border-b hairline py-7 transition-colors sm:grid-cols-[7rem_8rem_1fr_2rem] sm:gap-6"
              >
                <span className="mono text-[11px] text-[var(--ash-dim)]">{d.date}</span>
                <span className="label-mono text-[9px] text-[var(--blood)]">{d.tag}</span>
                <span className="text-lg text-[var(--bone)] transition-all duration-500 group-hover:translate-x-2 sm:text-xl">
                  {d.title}
                </span>
                <span className="hidden text-right text-[var(--ash-dim)] transition-all duration-500 group-hover:translate-x-1 group-hover:text-[var(--ember)] sm:block">
                  ↗
                </span>
                <p className="text-sm text-[var(--ash)] sm:col-span-4 sm:col-start-3 sm:max-w-2xl">
                  {d.excerpt}
                </p>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------- GUILD */

export function Guild() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <section id="guild" className="border-t hairline">
      <div className="relative mx-auto max-w-[1400px] overflow-hidden px-6 py-28 sm:px-12 sm:py-40">
        <div
          className="pointer-events-none absolute -right-40 top-0 h-[120%] w-[60%] opacity-50"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(255,34,64,0.22), transparent 70%)',
          }}
        />
        <Reveal className="relative">
          <span className="label-mono text-[10px] text-[var(--blood)]">Join the guild</span>
          <h2 className="display-hero mt-6 max-w-4xl text-[clamp(2.4rem,7vw,5.5rem)] text-[var(--bone)]">
            Get the work before
            <br />
            the world does.
          </h2>
          <p className="mt-7 max-w-md text-lg text-[var(--ash)]">
            Early builds, playtests, drops, and dispatches from the studio. No noise — just the new
            stuff, first.
          </p>

          <form
            className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (email.includes('@')) setSent(true);
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@signal.dev"
              className="mono flex-1 border hairline bg-[var(--surface)] px-5 py-4 text-sm text-[var(--bone)] outline-none transition-colors placeholder:text-[var(--ash-dim)] focus:border-[var(--line-strong)]"
            />
            <button
              type="submit"
              className="label-mono bg-[var(--blood)] px-7 py-4 text-[11px] text-[var(--ink)] transition-colors hover:bg-[var(--ember)]"
            >
              {sent ? 'You\u2019re in ✓' : 'Enlist'}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
