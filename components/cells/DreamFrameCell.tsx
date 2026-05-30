'use client';

import { useState } from 'react';
import { Play, Square } from 'lucide-react';
import type { CellSignal } from '@/lib/cells-data';
import { Z2AudioEngine } from '@/lib/audio/Z2AudioEngine';
import { useTerminalStore } from '@/lib/store/terminal-store';

const PROGRAMS = [
  { id: 'theta', label: 'Theta Descent', desc: 'Alpha → deep Theta bio-ramp', dur: 30000 },
  { id: 'carrier', label: 'Vibration Band', desc: '40Hz carrier wave / OBE prep', dur: 20000 },
  { id: 'spark', label: 'Lucid Spark', desc: 'Alpha → Gamma burst', dur: 10000 },
] as const;

export default function DreamFrameCell({ signal }: { signal: CellSignal }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const completeFieldOrder = useTerminalStore((s) => s.completeFieldOrder);
  const audioEnabled = useTerminalStore((s) => s.audioEnabled);

  const play = async (id: (typeof PROGRAMS)[number]['id'], dur: number) => {
    if (!audioEnabled) return;
    if (playing === id) {
      Z2AudioEngine.getInstance().stopProgram();
      setPlaying(null);
      return;
    }
    await Z2AudioEngine.getInstance().init();
    await Z2AudioEngine.getInstance().playProgram(id);
    setPlaying(id);
    completeFieldOrder('FO-002');
    setTimeout(() => setPlaying((p) => (p === id ? null : p)), dur);
  };

  return (
    <div>
      <p className="label-mono mb-6 text-[11px]" style={{ color: signal.accent }}>
        {signal.index} · {signal.kicker}
      </p>
      <h1 className="display-hero text-6xl leading-[0.85] text-[var(--bone)] sm:text-8xl">
        DreamFrame
      </h1>
      <p className="font-serif-italic mt-8 max-w-2xl text-xl leading-relaxed text-[var(--ash)]">
        A research instrument for altered states — not a dream journal. Systematic, falsifiable,
        and instrumented. These aren&apos;t mockups. Press play.
      </p>

      <div className="mt-12 grid gap-px border hairline sm:grid-cols-3">
        {['Oneironaut', 'Projector', 'Mystic'].map((p) => (
          <div key={p} className="bg-[#0a0a0b] p-6">
            <p className="label-mono text-[10px] text-[var(--bone)]">{p}</p>
          </div>
        ))}
      </div>

      <p className="label-mono mt-14 mb-6 text-[10px] text-[var(--ash)]">TONE LABORATORY · LIVE</p>

      <div className="grid gap-px border hairline md:grid-cols-3">
        {PROGRAMS.map(({ id, label, desc, dur }) => (
          <button
            key={id}
            type="button"
            onClick={() => play(id, dur)}
            disabled={!audioEnabled}
            className={`group bg-[#0a0a0b] p-6 text-left transition ${
              playing === id ? '' : 'hover:bg-[#120607]'
            } ${!audioEnabled ? 'opacity-40' : ''}`}
            style={playing === id ? { background: 'rgba(255,59,31,0.08)' } : undefined}
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="display-hero text-2xl text-[var(--bone)]">{label}</span>
              {playing === id ? (
                <Square className="h-4 w-4" style={{ color: signal.accent }} />
              ) : (
                <Play className="h-4 w-4 text-[var(--ash-dim)] group-hover:text-[var(--blood)]" />
              )}
            </div>
            <p className="font-serif-italic text-sm text-[var(--ash)]">{desc}</p>
            {playing === id && (
              <div className="mt-5 flex h-6 items-end gap-0.5">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 animate-pulse"
                    style={{
                      height: `${20 + Math.abs(Math.sin(i)) * 70}%`,
                      background: signal.accent,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </button>
        ))}
      </div>

      {!audioEnabled && (
        <p className="label-mono mt-6 text-[10px] text-[var(--blood)]">
          ENABLE SOUND TO RUN LIVE PROGRAMS
        </p>
      )}

      <div className="mt-14 border-l-2 pl-6" style={{ borderColor: signal.accent }}>
        <p className="label-mono mb-3 text-[9px] text-[var(--ash-dim)]">PROJECT BRIDGE · CLASSIFIED</p>
        <p className="font-serif-italic text-lg text-[var(--ash)]">
          Non-invasive consciousness transduction. Your thoughts, preserved at frequencies the
          world has never recorded.
        </p>
        <a
          href="https://dreamframe.app"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block bg-[var(--blood)] px-6 py-3 label-mono text-[10px] text-[var(--bone)] transition hover:bg-[var(--ember)]"
        >
          ENTER THE LAB ↗
        </a>
      </div>
    </div>
  );
}
