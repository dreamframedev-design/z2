'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import RedField from '@/components/ui/RedField';
import DossierPanel from '@/components/terminal/DossierPanel';
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
  return (
    <nav className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6 sm:px-12">
        <a href="#top" className="flex items-center gap-3">
          <img src="/z2-logo.svg" alt="Z2" className="h-6 w-auto" draggable={false} />
          <span className="label-mono hidden text-[10px] text-[var(--ash-dim)] sm:inline">
            Creative Studio
          </span>
        </a>

        <div className="flex items-center gap-8">
          <a
            href="#work"
            className="label-mono hidden text-[10px] text-[var(--ash)] transition-colors hover:text-[var(--bone)] sm:inline"
          >
            Work
          </a>
          <a
            href="#studio"
            className="label-mono hidden text-[10px] text-[var(--ash)] transition-colors hover:text-[var(--bone)] sm:inline"
          >
            Studio
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
        </div>
      </div>
    </nav>
  );
}

/* ----------------------------------------------------------------- HERO */

function Hero() {
  return (
    <header
      id="top"
      className="mx-auto max-w-[1400px] px-6 pt-40 pb-24 sm:px-12 sm:pt-52 sm:pb-36"
    >
      <p className="label-mono rise text-[11px] text-[var(--ash)]" style={{ animationDelay: '0.1s' }}>
        Independent creative studio — Est. 2025
      </p>

      <h1
        className="display-hero rise mt-8 max-w-5xl text-[clamp(2.8rem,9vw,8.5rem)] text-[var(--bone)]"
        style={{ animationDelay: '0.2s' }}
      >
        An independent studio
        <br />
        for the <span className="font-serif-italic text-[var(--ember)]">unclassifiable</span>.
      </h1>

      <p
        className="rise mt-12 max-w-xl text-lg leading-relaxed text-[var(--ash)] sm:text-xl"
        style={{ animationDelay: '0.35s' }}
      >
        Games, sound, film, and instruments for altered perception — made by a small guild for
        people who want something genuinely new.
      </p>
    </header>
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

        <span className="display-hero text-3xl text-[var(--bone)] transition-all duration-500 group-hover:translate-x-2 sm:text-5xl">
          {signal.title}
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
    <section id="work" className="mx-auto max-w-[1400px] px-6 py-20 sm:px-12 sm:py-28">
      <div className="mb-12 flex items-baseline justify-between">
        <h2 className="label-mono text-[11px] text-[var(--ash)]">Selected Work</h2>
        <span className="label-mono text-[10px] text-[var(--ash-dim)]">
          {String(cells.length).padStart(2, '0')} entries
        </span>
      </div>

      <div>
        {cells.map((c) => (
          <WorkRow key={c.id} signal={c} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- STUDIO */

function Studio() {
  return (
    <section id="studio" className="border-t hairline">
      <div className="mx-auto max-w-[1400px] px-6 py-28 sm:px-12 sm:py-44">
        <p className="font-serif-italic max-w-4xl text-[clamp(1.8rem,4.5vw,3.75rem)] leading-[1.15] text-[var(--bone)]">
          We don&apos;t know exactly what Z2 becomes. That&apos;s the point — we build at the edge
          of what we can name, and let the work decide.
        </p>
        <p className="label-mono mt-12 text-[10px] text-[var(--ash)]">— The founders</p>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- FOOTER */

function Footer() {
  return (
    <footer id="connect" className="border-t hairline">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <img src="/z2-logo.svg" alt="Z2" className="h-8 w-auto" draggable={false} />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-[var(--ash)]">
              An independent creative studio working across games, sound, film, and consciousness.
            </p>
          </div>

          <div>
            <p className="label-mono mb-5 text-[10px] text-[var(--ash-dim)]">Disciplines</p>
            <ul className="space-y-3 text-sm text-[var(--ash)]">
              <li>Games</li>
              <li>Spatial Sound</li>
              <li>Film</li>
              <li>Consciousness</li>
            </ul>
          </div>

          <div>
            <p className="label-mono mb-5 text-[10px] text-[var(--ash-dim)]">Connect</p>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="https://github.com/dreamframedev-design/z2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--ash)] transition-colors hover:text-[var(--bone)]"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@z2.studio"
                  className="text-[var(--ash)] transition-colors hover:text-[var(--bone)]"
                >
                  hello@z2.studio
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t hairline pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="label-mono text-[10px] text-[var(--ash-dim)]">© 2025 Z2</p>
          <p className="label-mono text-[10px] text-[var(--ash-dim)]">Built in the dark</p>
        </div>
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

  return (
    <>
      <RedField />
      <div className="grain" />
      <div className="vignette" />

      <Nav audioEnabled={audioEnabled} onToggleSound={toggleSound} />

      <AnimatePresence>
        {open && <DossierPanel key={open.id} signal={open} onClose={handleClose} />}
      </AnimatePresence>

      <main className="fade relative">
        <Hero />
        <Work cells={cells} onOpen={handleOpen} />
        <Studio />
        <Footer />
      </main>
    </>
  );
}
