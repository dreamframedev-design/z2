'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import RedField from '@/components/ui/RedField';
import DossierPanel from '@/components/terminal/DossierPanel';
import { useTerminalStore } from '@/lib/store/terminal-store';
import { Z2AudioEngine } from '@/lib/audio/Z2AudioEngine';
import { CELLS, type CellSignal } from '@/lib/cells-data';

const ApertureMark = dynamic(() => import('@/components/brand/ApertureMark'), {
  ssr: false,
  loading: () => null,
});

/* ----------------------------------------------------------- INTRO GATE */

function IntroGate({
  onEnter,
  onEnterSound,
  audioLevel,
}: {
  onEnter: () => void;
  onEnterSound: () => void;
  audioLevel: number;
}) {
  return (
    <motion.div
      key="intro"
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center px-6"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 opacity-90">
        <ApertureMark intensity={0.05 + audioLevel} className="h-full w-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="label-mono mb-8 text-[11px] text-[var(--ash)]"
        >
          A CREATIVE GUILD · EST. 2025
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, letterSpacing: '0.3em' }}
          animate={{ opacity: 1, letterSpacing: '-0.05em' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="display-hero text-[24vw] text-[var(--bone)] sm:text-[18vw] lg:text-[15rem]"
          style={{ textShadow: '0 0 80px rgba(225,6,0,0.4)' }}
        >
          Z2
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="font-serif-italic mt-2 max-w-md text-xl text-[var(--ash)] sm:text-2xl"
        >
          Games, sound, film, consciousness, and experiments that refuse categories.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 flex flex-col items-center gap-3 sm:flex-row"
        >
          <button
            type="button"
            onClick={onEnterSound}
            className="red-underglow group relative overflow-hidden bg-[var(--blood)] px-10 py-4 label-mono text-[12px] text-[var(--bone)] transition hover:bg-[var(--ember)]"
          >
            ENTER WITH SOUND
          </button>
          <button
            type="button"
            onClick={onEnter}
            className="border hairline px-8 py-4 label-mono text-[12px] text-[var(--ash)] transition hover:border-[var(--bone)] hover:text-[var(--bone)]"
          >
            ENTER MUTED
          </button>
        </motion.div>
        <p className="label-mono mt-6 text-[9px] text-[var(--ash-dim)]">
          HEADPHONES RECOMMENDED
        </p>
      </div>
    </motion.div>
  );
}

/* ----------------------------------------------------------- TOP BAR */

function TopBar({
  onToggleSound,
  audioEnabled,
  access,
  onRequestAccess,
}: {
  onToggleSound: () => void;
  audioEnabled: boolean;
  access: string;
  onRequestAccess: () => void;
}) {
  const [clock, setClock] = useState('');
  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b hairline bg-[#0a0a0b]/70 px-5 py-4 backdrop-blur-md sm:px-10">
      <div className="flex items-center gap-3">
        <span className="display-hero text-2xl text-[var(--bone)]">Z2</span>
        <span className="label-mono hidden text-[10px] text-[var(--ash-dim)] sm:inline">
          / THE INDEX
        </span>
      </div>

      <div className="flex items-center gap-5">
        <span className="label-mono hidden text-[10px] text-[var(--ash)] sm:inline">{clock}</span>
        {access === 'L0' ? (
          <button
            type="button"
            onClick={onRequestAccess}
            className="label-mono text-[10px] text-[var(--blood)] transition hover:text-[var(--ember)]"
          >
            [ REQUEST ACCESS ]
          </button>
        ) : (
          <span className="label-mono text-[10px] text-[var(--ash)]">
            ACCESS · <span className="text-[var(--blood)]">{access}</span>
          </span>
        )}
        <button
          type="button"
          onClick={onToggleSound}
          className="flex items-center gap-2 label-mono text-[10px] text-[var(--ash)] transition hover:text-[var(--bone)]"
          aria-label="Toggle sound"
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: audioEnabled ? 'var(--blood)' : 'var(--ash-dim)' }}
          />
          {audioEnabled ? 'SOUND ON' : 'MUTED'}
        </button>
      </div>
    </header>
  );
}

/* ----------------------------------------------------------- INDEX ROW */

function IndexRow({
  signal,
  onOpen,
}: {
  signal: CellSignal;
  onOpen: (s: CellSignal) => void;
}) {
  const recordHover = useTerminalStore((s) => s.recordHover);
  const audioEnabled = useTerminalStore((s) => s.audioEnabled);

  return (
    <button
      type="button"
      onMouseEnter={() => {
        recordHover(signal.id);
        if (audioEnabled) Z2AudioEngine.getInstance().playUiSound('hover');
      }}
      onClick={() => {
        if (audioEnabled) Z2AudioEngine.getInstance().playUiSound('breach');
        onOpen(signal);
      }}
      className="group relative block w-full border-b hairline py-6 text-left transition-colors sm:py-8"
    >
      <div className="flex items-center gap-4 sm:gap-8">
        <span
          className="label-mono w-10 shrink-0 text-[11px] text-[var(--ash-dim)] transition-colors group-hover:text-[var(--blood)]"
        >
          {signal.index}
        </span>

        <h2
          className="display-hero flex-1 text-4xl text-[var(--bone)] transition-all duration-500 group-hover:translate-x-2 sm:text-6xl lg:text-7xl"
          style={{ ['--hover' as string]: signal.accent }}
        >
          <span className="glitch-hover transition-colors group-hover:text-[var(--blood)]">
            {signal.title}
          </span>
        </h2>

        <div className="hidden w-64 shrink-0 text-right sm:block">
          <span className="label-mono text-[10px] text-[var(--ash)]">{signal.kicker}</span>
          <p className="font-serif-italic mt-1 text-sm text-[var(--ash-dim)] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            {signal.hook}
          </p>
        </div>

        <span
          className="label-mono ml-auto shrink-0 text-[9px] sm:ml-0"
          style={{
            color:
              signal.status === 'LIVE'
                ? signal.accent
                : signal.status === 'WITNESSED'
                  ? '#ff2d6b'
                  : 'var(--ash-dim)',
          }}
        >
          {signal.status}
        </span>
      </div>

      {/* mobile hook */}
      <p className="font-serif-italic mt-2 pl-14 text-sm text-[var(--ash-dim)] sm:hidden">
        {signal.hook}
      </p>

      <span
        className="pointer-events-none absolute bottom-0 left-0 h-px w-0 transition-all duration-500 group-hover:w-full"
        style={{ background: signal.accent }}
      />
    </button>
  );
}

/* ----------------------------------------------------------- MARQUEE */

function Marquee({ text, reverse = false }: { text: string; reverse?: boolean }) {
  const content = Array.from({ length: 8 }).map((_, i) => (
    <span key={i} className="display-hero mx-6 text-5xl text-transparent sm:text-7xl" style={{ WebkitTextStroke: '1px rgba(237,232,224,0.18)' }}>
      {text}
    </span>
  ));
  return (
    <div className="relative overflow-hidden border-y hairline py-5">
      <div className={reverse ? 'marquee-track marquee-track-rev' : 'marquee-track'}>
        {content}
        {content}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- ROOT */

export default function TerminalExperience() {
  const {
    phase,
    enter,
    enableAudio,
    disableAudio,
    audioEnabled,
    breachCell,
    closeBreach,
    clearance,
    requestClearance,
    triggerAnomaly,
    witnessedAnomaly,
  } = useTerminalStore();

  const [open, setOpen] = useState<CellSignal | null>(null);
  const [audioLevel, setAudioLevel] = useState(0.05);
  const [flash, setFlash] = useState(false);

  // audio telemetry → aperture intensity
  useEffect(() => {
    if (!audioEnabled) return;
    const i = setInterval(() => {
      setAudioLevel(Z2AudioEngine.getInstance().getAverageLevel() * 0.8);
    }, 60);
    return () => clearInterval(i);
  }, [audioEnabled]);

  // cursor pan
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (audioEnabled) Z2AudioEngine.getInstance().setCursorPan(e.clientX);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [audioEnabled]);

  // rare anomaly discovery
  useEffect(() => {
    if (witnessedAnomaly || phase === 'boot') return;
    const i = setInterval(() => {
      if (Math.random() < 0.01) {
        setFlash(true);
        triggerAnomaly();
        if (audioEnabled) Z2AudioEngine.getInstance().playUiSound('anomaly');
        setTimeout(() => setFlash(false), 1600);
      }
    }, 6000);
    return () => clearInterval(i);
  }, [witnessedAnomaly, phase, triggerAnomaly, audioEnabled]);

  const enterSound = useCallback(async () => {
    enableAudio();
    await Z2AudioEngine.getInstance().init();
    await Z2AudioEngine.getInstance().startRoomTone();
    Z2AudioEngine.getInstance().playUiSound('unlock');
  }, [enableAudio]);

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
      setOpen(s);
      breachCell(s.id);
    },
    [breachCell]
  );

  const handleClose = useCallback(() => {
    setOpen(null);
    closeBreach();
    Z2AudioEngine.getInstance().stopSubjectRack();
    Z2AudioEngine.getInstance().stopProgram();
  }, [closeBreach]);

  const visibleCells = useMemo(
    () => CELLS.filter((c) => !c.hidden || witnessedAnomaly),
    [witnessedAnomaly]
  );

  return (
    <>
      <RedField />
      <div className="grain" />
      <div className="vignette" />

      {flash && (
        <div className="pointer-events-none fixed inset-0 z-[200] bg-[#ff2d6b]/10 mix-blend-screen" />
      )}

      <AnimatePresence>
        {phase === 'boot' && (
          <IntroGate
            onEnter={enter}
            onEnterSound={enterSound}
            audioLevel={audioLevel}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && <DossierPanel key={open.id} signal={open} onClose={handleClose} />}
      </AnimatePresence>

      {phase !== 'boot' && (
        <div className="relative">
          <TopBar
            onToggleSound={toggleSound}
            audioEnabled={audioEnabled}
            access={clearance}
            onRequestAccess={requestClearance}
          />

          {/* HERO */}
          <section className="relative mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-16 sm:px-10 sm:pt-24 lg:grid-cols-[1.3fr_1fr]">
            <div className="rise">
              <p className="label-mono mb-6 text-[11px] text-[var(--ash)]">
                INDEX · {String(visibleCells.length).padStart(2, '0')} ENTRIES · EPOCH 01
              </p>
              <h1 className="display-hero text-[15vw] leading-[0.82] text-[var(--bone)] sm:text-7xl lg:text-8xl">
                A guild
                <br />
                of <span className="text-[var(--blood)]">impossible</span>
                <br />
                projects.
              </h1>
              <p className="font-serif-italic mt-8 max-w-md text-lg text-[var(--ash)]">
                Z2 is a studio shaped like a question. We build instruments for altered
                perception — then point them at games, film, and sound. You&apos;re early. Look
                around.
              </p>
            </div>

            <div className="relative hidden h-[420px] lg:block">
              <div className="absolute inset-0">
                <ApertureMark intensity={0.05 + audioLevel} className="h-full w-full" />
              </div>
            </div>
          </section>

          <Marquee text="GAMES · SOUND · FILM · CONSCIOUSNESS · EXPERIMENTS · " />

          {/* THE INDEX */}
          <section className="mx-auto max-w-6xl px-5 py-16 sm:px-10 sm:py-24">
            <div className="mb-10 flex items-end justify-between">
              <h2 className="font-serif-italic text-3xl text-[var(--bone)] sm:text-4xl">
                The Index
              </h2>
              <span className="label-mono text-[10px] text-[var(--ash-dim)]">
                SELECT TO OPEN
              </span>
            </div>

            <div>
              {visibleCells.map((c) => (
                <IndexRow key={c.id} signal={c} onOpen={handleOpen} />
              ))}
            </div>
          </section>

          {/* MANIFESTO */}
          <section className="border-t hairline">
            <div className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-10">
              <p className="label-mono mb-8 text-[10px] text-[var(--blood)]">MANIFESTO</p>
              <p className="font-serif-italic text-3xl leading-snug text-[var(--bone)] sm:text-5xl">
                &ldquo;We don&apos;t know exactly what Z2 becomes. That&apos;s the point. The
                index grows as we do.&rdquo;
              </p>
              <p className="label-mono mt-10 text-[10px] text-[var(--ash)]">
                — THE FOUNDERS
              </p>
            </div>
          </section>

          <Marquee text="Z2 · Z2 · Z2 · Z2 · " reverse />

          {/* FOOTER */}
          <footer className="mx-auto max-w-6xl px-5 py-16 sm:px-10">
            <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
              <span className="display-hero text-7xl text-[var(--bone)] sm:text-9xl">Z2</span>
              <div className="text-left sm:text-right">
                <a
                  href="https://github.com/dreamframedev-design/z2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label-mono block text-[10px] text-[var(--ash)] transition hover:text-[var(--blood)]"
                >
                  GITHUB ↗
                </a>
                <p className="label-mono mt-4 text-[9px] text-[var(--ash-dim)]">
                  © 2025 Z2 · ALL SIGNALS RESERVED
                </p>
              </div>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
