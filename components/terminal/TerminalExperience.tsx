'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import AntigravityParticles from '@/components/ui/AntigravityParticles';
import BootSequence from '@/components/terminal/BootSequence';
import ConsentRitual from '@/components/terminal/ConsentRitual';
import ClearanceRitual from '@/components/terminal/ClearanceRitual';
import SignalScanner from '@/components/terminal/SignalScanner';
import CellBreach from '@/components/terminal/CellBreach';
import HeaderChrome from '@/components/terminal/HeaderChrome';
import { useTerminalStore } from '@/lib/store/terminal-store';
import { Z2AudioEngine } from '@/lib/audio/Z2AudioEngine';
import type { CellSignal } from '@/lib/cells-data';
import { FIELD_ORDERS } from '@/lib/cells-data';

const TesseractSigil = dynamic(() => import('@/components/terminal/TesseractSigil'), {
  ssr: false,
  loading: () => (
    <div className="flex h-48 w-48 items-center justify-center sm:h-64 sm:w-64">
      <div className="h-16 w-16 animate-pulse rounded-full bg-indigo-500/20" />
    </div>
  ),
});

export default function TerminalExperience() {
  const {
    phase,
    setPhase,
    enableAudio,
    audioEnabled,
    breachCell,
    closeBreach,
    clearance,
    protocolId,
    triggerAnomaly,
    witnessedAnomaly,
    fieldOrdersComplete,
    completeFieldOrder,
  } = useTerminalStore();

  const [breachSignal, setBreachSignal] = useState<CellSignal | null>(null);
  const [showClearance, setShowClearance] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0.3);
  const [anomalyFlash, setAnomalyFlash] = useState(false);
  const [sigilTaps, setSigilTaps] = useState<number[]>([]);

  useEffect(() => {
    if (!audioEnabled) return;
    const interval = setInterval(() => {
      setAudioLevel(Z2AudioEngine.getInstance().getAverageLevel());
    }, 50);
    return () => clearInterval(interval);
  }, [audioEnabled]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (audioEnabled) Z2AudioEngine.getInstance().setCursorPan(e.clientX);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [audioEnabled]);

  useEffect(() => {
    if (witnessedAnomaly) return;
    const roll = () => {
      if (Math.random() < 0.008) {
        setAnomalyFlash(true);
        triggerAnomaly();
        Z2AudioEngine.getInstance().playUiSound('anomaly');
        setTimeout(() => setAnomalyFlash(false), 2000);
      }
    };
    const interval = setInterval(roll, 5000);
    return () => clearInterval(interval);
  }, [witnessedAnomaly, triggerAnomaly]);

  useEffect(() => {
    const hour = new Date().getHours();
    if ((hour === 3 && new Date().getMinutes() === 33) || sigilTaps.length >= 6) {
      if (!witnessedAnomaly) triggerAnomaly();
    }
  }, [sigilTaps, witnessedAnomaly, triggerAnomaly]);

  const handleBootComplete = useCallback(() => {
    setPhase('consent');
  }, [setPhase]);

  const handleConsentAccept = useCallback(() => {
    enableAudio();
    completeFieldOrder('FO-001');
  }, [enableAudio, completeFieldOrder]);

  const handleConsentDecline = useCallback(() => {
    setPhase('terminal');
  }, [setPhase]);

  const handleBreach = useCallback(
    (signal: CellSignal) => {
      setBreachSignal(signal);
      breachCell(signal.id);
    },
    [breachCell]
  );

  const handleCloseBreach = useCallback(() => {
    setBreachSignal(null);
    closeBreach();
    Z2AudioEngine.getInstance().stopSubjectRack();
    Z2AudioEngine.getInstance().stopProgram();
  }, [closeBreach]);

  const handleSigilTap = () => {
    const now = Date.now();
    setSigilTaps((prev) => {
      const next = [...prev, now].slice(-6);
      if (next.length === 6) {
        const gaps = next.slice(1).map((t, i) => t - next[i]);
        const fib = [300, 500, 800, 500, 300];
        const match = gaps.every((g, i) => Math.abs(g - fib[i]) < 150);
        if (match) triggerAnomaly();
      }
      return next;
    });
  };

  return (
    <>
      <AntigravityParticles />
      <div className="grain-overlay" />
      <div className="scan-line" />

      {anomalyFlash && (
        <div className="pointer-events-none fixed inset-0 z-[200] bg-fuchsia-500/10 mix-blend-difference" />
      )}

      <AnimatePresence>
        {phase === 'boot' && (
          <BootSequence key="boot" onComplete={handleBootComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'consent' && (
          <ConsentRitual
            key="consent"
            onAccept={handleConsentAccept}
            onDecline={handleConsentDecline}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showClearance && (
          <ClearanceRitual key="clearance" onClose={() => setShowClearance(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'breach' && breachSignal && (
          <CellBreach key={breachSignal.id} signal={breachSignal} onClose={handleCloseBreach} />
        )}
      </AnimatePresence>

      {(phase === 'terminal' || phase === 'breach') && (
        <div className="relative min-h-screen px-4 py-8 sm:px-8 sm:py-12">
          <div className="mx-auto max-w-4xl">
            <HeaderChrome />

            <section className="my-12 flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1 text-center sm:text-left">
                <p className="mb-3 font-mono text-[10px] tracking-[0.35em] text-indigo-400">
                  [ HYPERCUBE SIGIL // {audioEnabled ? 'RESONANT' : 'DORMANT'} ]
                </p>
                <h1 className="mb-4 text-4xl font-light leading-tight tracking-tight text-slate-100 sm:text-5xl lg:text-6xl">
                  The guild is real.
                  <br />
                  <span className="text-amber-400/90">The site is alive.</span>
                </h1>
                <p className="max-w-md text-sm leading-relaxed text-slate-500">
                  Games. Spatial sound. Film. Consciousness OS. Random experiments. One
                  clearance ladder. Breach the signal.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  {!protocolId && clearance === 'L0' && (
                    <button
                      type="button"
                      onClick={() => setShowClearance(true)}
                      className="relative overflow-hidden border border-amber-500/40 bg-amber-500/10 px-6 py-3 font-mono text-xs tracking-widest text-amber-300 transition hover:bg-amber-500/20"
                    >
                      <span className="relative z-10">[ REQUEST CLEARANCE ]</span>
                      <span className="absolute inset-0 shimmer-beam opacity-30" />
                    </button>
                  )}
                  {witnessedAnomaly && (
                    <span className="border border-fuchsia-500/30 px-4 py-3 font-mono text-[10px] tracking-widest text-fuchsia-400">
                      ANOMALY DETECTED
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSigilTap}
                className="relative h-48 w-48 shrink-0 sm:h-64 sm:w-64"
                aria-label="Z2 Hypercube Sigil"
              >
                <TesseractSigil intensity={audioEnabled ? 0.2 + audioLevel * 2 : 0.15} className="h-full w-full" />
              </button>
            </section>

            <section className="mb-12 border border-slate-800/80 bg-slate-950/30 p-6">
              <p className="mb-4 font-mono text-[10px] tracking-[0.3em] text-slate-500">
                [ FIELD ORDERS // ACTIVE ]
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {FIELD_ORDERS.map((fo) => {
                  const done = fieldOrdersComplete.includes(fo.id);
                  return (
                    <div
                      key={fo.id}
                      className={`border p-4 ${done ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-slate-800'}`}
                    >
                      <p className="font-mono text-[9px] tracking-widest text-indigo-400">{fo.id}</p>
                      <p className="mt-1 text-sm text-slate-300">{fo.title}</p>
                      <p className="mt-2 text-[10px] text-slate-600">
                        {done ? '[ COMPLETE ]' : fo.reward}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <SignalScanner onBreach={handleBreach} />

            <footer className="mt-24 border-t border-slate-800/80 pt-8 pb-12 text-center">
              <p className="font-mono text-[9px] tracking-[0.4em] text-slate-600">
                Z2 // GUILD PROTOCOL ZERO // EPOCH-01 // 2025
              </p>
              <p className="mt-2 font-mono text-[9px] tracking-widest text-slate-700">
                [ THE TESSERACT NEVER STOPS TURNING ]
              </p>
              <a
                href="https://github.com/dreamframedev-design/z2"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block font-mono text-[9px] tracking-widest text-slate-600 transition hover:text-amber-400/80"
              >
                github.com/dreamframedev-design/z2
              </a>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
