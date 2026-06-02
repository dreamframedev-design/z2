'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import RedField from '@/components/ui/RedField';
import DossierPanel from '@/components/terminal/DossierPanel';
import Reveal from '@/components/ui/Reveal';
import Hero from '@/components/hero/Hero';
import ScrollProgress from '@/components/ui/ScrollProgress';
import SignalDivider from '@/components/ui/SignalDivider';
import SignalBoard from '@/components/site/SignalBoard';
import { GuildProvider, useGuild } from '@/components/providers/GuildProvider';
import SmoothScroll, { setScrollLocked } from '@/components/providers/SmoothScroll';
import {
  Capabilities,
  Reel,
  FeaturedFilm,
  Dispatch,
  Guild,
} from '@/components/site/BrandSections';
import { useTerminalStore } from '@/lib/store/terminal-store';
import { Z2AudioEngine } from '@/lib/audio/Z2AudioEngine';
import { CELLS, type CellSignal } from '@/lib/cells-data';

/* ----------------------------------------------------------------- NAV */

function Nav({
  audioEnabled,
  onToggleSound,
}: {
  audioEnabled: boolean;
  onToggleSound: () => void;
}) {
  const { operators } = useGuild();
  return (
    <nav className="fixed inset-x-0 top-0 z-40 border-b hairline bg-[var(--void)]/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 sm:px-12">
        <a href="#top" className="flex items-center gap-3">
          <img src="/z2-logo.svg" alt="Z2" className="h-7 w-auto" draggable={false} />
          <span className="label-mono hidden text-[10px] text-[var(--ash-dim)] sm:inline">
            Studio
          </span>
        </a>

        <div className="flex items-center gap-6 sm:gap-8">
          {[
            ['#capabilities', 'What we do'],
            ['#work', 'Work'],
            ['#reel', 'Reel'],
            ['#exos', 'Film'],
            ['#signal', 'Signal'],
            ['#dispatch', 'Dispatch'],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="label-mono hidden text-[10px] text-[var(--ash)] transition-colors hover:text-[var(--bone)] md:inline"
            >
              {label}
            </a>
          ))}
          <a
            href="#signal"
            title="Operators in the guild right now"
            className="label-mono hidden items-center gap-2 text-[10px] text-[var(--ash)] transition-colors hover:text-[var(--bone)] sm:flex"
          >
            <span
              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--blood)]"
              style={{ boxShadow: '0 0 8px var(--glow)' }}
            />
            {operators} online
          </a>
          <button
            type="button"
            onClick={onToggleSound}
            className="label-mono flex items-center gap-2 text-[10px] text-[var(--ash)] transition-colors hover:text-[var(--bone)]"
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full transition-colors"
              style={{ background: audioEnabled ? 'var(--blood)' : 'var(--ash-dim)' }}
            />
            Sound
          </button>
          <a
            href="#guild"
            className="label-mono hidden bg-[var(--bone)] px-4 py-2 text-[10px] text-[var(--ink)] transition-colors hover:bg-[var(--blood)] hover:text-[var(--bone)] sm:inline-block"
          >
            Join
          </a>
        </div>
      </div>
    </nav>
  );
}

/* ----------------------------------------------------------------- WORK */

const STATUS_LABEL: Record<string, string> = {
  LIVE: 'Live',
  'IN DEV': 'In development',
  OPEN: 'Open',
  MEMBER: 'Members',
  WITNESSED: 'Unlisted',
};

function WorkRow({ signal, onOpen }: { signal: CellSignal; onOpen: (s: CellSignal) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(signal)}
      className="group block w-full border-t hairline py-8 text-left transition-colors last:border-b sm:py-10"
    >
      <div className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 sm:grid-cols-[3.5rem_1fr_12rem_8rem] sm:gap-6">
        <span className="font-serif-italic text-sm text-[var(--ash-dim)] transition-colors group-hover:text-[var(--ember)]">
          {signal.index}
        </span>

        <span className="display-hero relative inline-block text-3xl text-[var(--bone)] transition-all duration-500 group-hover:translate-x-2 sm:text-5xl">
          {signal.title}
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-[var(--blood)] to-[var(--ember)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
          />
        </span>

        <span className="label-mono hidden text-[10px] text-[var(--ash)] sm:block">
          {signal.kicker}
        </span>

        <span className="flex items-center justify-end gap-3 text-right">
          <span className="label-mono text-[10px] text-[var(--ash-dim)]">
            {STATUS_LABEL[signal.status] ?? signal.status}
          </span>
          <span className="text-[var(--ash-dim)] transition-all duration-500 group-hover:translate-x-1 group-hover:text-[var(--ember)]">
            ↗
          </span>
        </span>
      </div>

      <p className="mt-3 max-w-md pl-[3.25rem] text-sm text-[var(--ash)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 sm:pl-[4.25rem]">
        {signal.hook}
      </p>
    </button>
  );
}

function Work({ cells, onOpen }: { cells: CellSignal[]; onOpen: (s: CellSignal) => void }) {
  return (
    <section id="work" className="mx-auto max-w-[1400px] px-6 py-24 sm:px-12 sm:py-32">
      <Reveal className="mb-12 flex items-end justify-between">
        <div>
          <span className="label-mono text-[10px] text-[var(--blood)]">The Index</span>
          <h2 className="display-2 mt-4 max-w-2xl text-[clamp(1.8rem,4vw,3rem)] text-[var(--bone)]">
            Every project is a world. Open one.
          </h2>
        </div>
        <span className="label-mono hidden text-[10px] text-[var(--ash-dim)] sm:block">
          {String(cells.length).padStart(2, '0')} entries
        </span>
      </Reveal>

      <Reveal>
        {cells.map((c) => (
          <WorkRow key={c.id} signal={c} onOpen={onOpen} />
        ))}
      </Reveal>
    </section>
  );
}

/* ----------------------------------------------------------------- STUDIO */

function Studio() {
  return (
    <section id="studio" className="border-t hairline">
      <div className="mx-auto max-w-[1400px] px-6 py-28 sm:px-12 sm:py-44">
        <Reveal>
          <span className="label-mono text-[10px] text-[var(--blood)]">The Studio</span>
          <p className="display-2 mt-8 max-w-4xl text-[clamp(1.8rem,4.5vw,3.75rem)] leading-[1.12] text-[var(--bone)]">
            We don&apos;t know exactly what Z2 becomes. That&apos;s the point — we build at the
            edge of what we can name, and let{' '}
            <span className="font-serif-italic text-[var(--ember)]">the work</span> decide.
          </p>
          <p className="label-mono mt-12 text-[10px] text-[var(--ash)]">— The founders</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- FOOTER */

function Footer() {
  const links: [string, string][] = [
    ['What we do', '#capabilities'],
    ['Work', '#work'],
    ['Reel', '#reel'],
    ['Dispatch', '#dispatch'],
    ['Join the guild', '#guild'],
  ];
  const social: [string, string][] = [
    ['GitHub', 'https://github.com/dreamframedev-design/z2'],
    ['Email', 'mailto:hello@z2.studio'],
    ['Discord', '#guild'],
    ['YouTube', '#reel'],
  ];

  return (
    <footer id="connect" className="relative border-t hairline">
      <div className="mx-auto max-w-[1400px] px-6 pt-24 sm:px-12 sm:pt-32">
        {/* call to action band */}
        <div className="flex flex-col gap-8 border-b hairline pb-16 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="display-hero max-w-3xl text-[clamp(2rem,6vw,4.5rem)] text-[var(--bone)]">
            Let&apos;s build something
            <br />
            <span className="text-[var(--ember)]">unclassifiable</span>.
          </h2>
          <a
            href="mailto:hello@z2.studio"
            className="label-mono group flex shrink-0 items-center gap-3 border hairline px-7 py-4 text-[11px] text-[var(--bone)] transition-colors hover:border-[var(--line-strong)]"
          >
            hello@z2.studio
            <span className="text-[var(--ember)] transition-transform group-hover:translate-x-1">
              ↗
            </span>
          </a>
        </div>

        {/* columns */}
        <div className="grid grid-cols-2 gap-10 py-16 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <img src="/z2-logo.svg" alt="Z2" className="h-10 w-auto" draggable={false} />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-[var(--ash)]">
              Independent studio. Games, sound, film, and instruments for altered perception.
            </p>
          </div>

          <div>
            <p className="label-mono mb-5 text-[10px] text-[var(--ash-dim)]">Explore</p>
            <ul className="space-y-3 text-sm">
              {links.map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-[var(--ash)] transition-colors hover:text-[var(--bone)]"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label-mono mb-5 text-[10px] text-[var(--ash-dim)]">Connect</p>
            <ul className="space-y-3 text-sm">
              {social.map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-[var(--ash)] transition-colors hover:text-[var(--bone)]"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label-mono mb-5 text-[10px] text-[var(--ash-dim)]">Status</p>
            <ul className="space-y-3 text-sm text-[var(--ash)]">
              <li className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--blood)]" />
                Bloom — in dev
              </li>
              <li className="mono text-[var(--ash-dim)]">Est. 2025</li>
              <li className="mono text-[var(--ash-dim)]">Built in the dark</li>
            </ul>
          </div>
        </div>
      </div>

      {/* giant wordmark */}
      <div className="overflow-hidden border-t hairline">
        <p className="display-hero select-none whitespace-nowrap px-6 py-8 text-center text-[clamp(5rem,26vw,22rem)] leading-none text-[var(--bone)] opacity-[0.04] sm:px-12">
          Z2 STUDIO
        </p>
      </div>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-12">
        <p className="label-mono text-[10px] text-[var(--ash-dim)]">© 2025 Z2 — All worlds reserved</p>
        <p className="label-mono text-[10px] text-[var(--ash-dim)]">Made by a small guild</p>
      </div>
    </footer>
  );
}

/* ----------------------------------------------------------------- ROOT */

export default function TerminalExperience() {
  const {
    setPhase,
    audioEnabled,
    enableAudio,
    disableAudio,
    breachCell,
    closeBreach,
    triggerAnomaly,
    witnessedAnomaly,
  } = useTerminalStore();

  const [open, setOpen] = useState<CellSignal | null>(null);

  useEffect(() => {
    setPhase('terminal');
  }, [setPhase]);

  // quiet, rare discovery of the unlisted entry
  useEffect(() => {
    if (witnessedAnomaly) return;
    const i = setInterval(() => {
      if (Math.random() < 0.012) triggerAnomaly();
    }, 8000);
    return () => clearInterval(i);
  }, [witnessedAnomaly, triggerAnomaly]);

  const toggleSound = useCallback(async () => {
    if (audioEnabled) {
      Z2AudioEngine.getInstance().stopRoomTone();
      disableAudio();
    } else {
      enableAudio();
      await Z2AudioEngine.getInstance().init();
      await Z2AudioEngine.getInstance().startRoomTone();
    }
  }, [audioEnabled, enableAudio, disableAudio]);

  const handleOpen = useCallback(
    (s: CellSignal) => {
      if (audioEnabled) Z2AudioEngine.getInstance().playUiSound('tick');
      setOpen(s);
      breachCell(s.id);
    },
    [audioEnabled, breachCell]
  );

  const handleClose = useCallback(() => {
    setOpen(null);
    closeBreach();
    Z2AudioEngine.getInstance().stopSubjectRack();
    Z2AudioEngine.getInstance().stopProgram();
  }, [closeBreach]);

  const cells = useMemo(
    () => CELLS.filter((c) => !c.hidden || witnessedAnomaly),
    [witnessedAnomaly]
  );

  const featureBloom = useCallback(() => {
    const bloom =
      CELLS.find((c) => c.title.toLowerCase().includes('bloom')) ??
      CELLS.find((c) => c.id.toLowerCase().includes('bloom'));
    if (bloom) handleOpen(bloom);
  }, [handleOpen]);

  // lock the page scroll while a fullscreen dossier is open
  useEffect(() => {
    setScrollLocked(!!open);
  }, [open]);

  return (
    <GuildProvider>
    <SmoothScroll>
      <RedField />
      <div className="grain" />
      <ScrollProgress />

      <Nav audioEnabled={audioEnabled} onToggleSound={toggleSound} />

      <AnimatePresence>
        {open && <DossierPanel key={open.id} signal={open} onClose={handleClose} />}
      </AnimatePresence>

      <main className="fade relative">
        <Hero onFeature={featureBloom} />
        <Capabilities />
        <SignalDivider />
        <Work cells={cells} onOpen={handleOpen} />
        <Reel />
        <FeaturedFilm />
        <Dispatch />
        <SignalDivider />
        <Studio />
        <SignalBoard />
        <Guild />
        <Footer />
      </main>
    </SmoothScroll>
    </GuildProvider>
  );
}
