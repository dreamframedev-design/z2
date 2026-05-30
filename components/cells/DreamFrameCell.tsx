'use client';

import { useState } from 'react';
import { Play, Square, Brain, Infinity, Activity } from 'lucide-react';
import type { CellSignal } from '@/lib/cells-data';
import { Z2AudioEngine } from '@/lib/audio/Z2AudioEngine';
import { useTerminalStore } from '@/lib/store/terminal-store';

const PROGRAMS = [
  { id: 'theta', label: 'Theta Descent', desc: 'Alpha → deep Theta bio-ramp', icon: Brain },
  { id: 'carrier', label: 'Vibration Band', desc: '40Hz carrier wave / OBE prep', icon: Activity },
  { id: 'spark', label: 'Lucid Spark', desc: 'Alpha → Gamma burst', icon: Infinity },
] as const;

export default function DreamFrameCell({ signal }: { signal: CellSignal }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const completeFieldOrder = useTerminalStore((s) => s.completeFieldOrder);
  const audioEnabled = useTerminalStore((s) => s.audioEnabled);

  const play = async (id: (typeof PROGRAMS)[number]['id']) => {
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
    setTimeout(() => setPlaying(null), id === 'theta' ? 30000 : id === 'carrier' ? 20000 : 10000);
  };

  return (
    <div>
      <div className="mb-12">
        <h1 className="mb-4 text-4xl font-light tracking-tight text-slate-100 sm:text-5xl">
          Consciousness Research Laboratory
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
          DreamFrame is not a dream journal. It is a research environment — a systematic
          approach to exploring altered states with scientific rigor. These aren&apos;t mockups.
          Click play.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {['Oneironaut', 'Projector', 'Mystic'].map((path) => (
          <div
            key={path}
            className="border border-indigo-500/20 bg-indigo-950/20 p-4 text-center font-mono text-xs tracking-widest text-indigo-300"
          >
            {path.toUpperCase()}
          </div>
        ))}
      </div>

      <p className="mb-6 font-mono text-[10px] tracking-[0.3em] text-indigo-400">
        [ TONE LABORATORY // LIVE PREVIEW ]
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {PROGRAMS.map(({ id, label, desc, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => play(id)}
            disabled={!audioEnabled}
            className={`group relative border p-6 text-left transition ${
              playing === id
                ? 'border-indigo-400 bg-indigo-950/40'
                : 'border-slate-800 bg-slate-950/40 hover:border-indigo-500/40'
            } ${!audioEnabled ? 'opacity-40' : ''}`}
          >
            <div className="mb-4 flex items-center justify-between">
              <Icon className="h-5 w-5 text-indigo-400" />
              {playing === id ? (
                <Square className="h-4 w-4 text-indigo-300" />
              ) : (
                <Play className="h-4 w-4 text-slate-600 group-hover:text-indigo-400" />
              )}
            </div>
            <h3 className="mb-1 font-mono text-sm tracking-wider text-slate-200">{label}</h3>
            <p className="text-xs text-slate-500">{desc}</p>
            {playing === id && (
              <div className="mt-4 flex h-6 items-end gap-0.5">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 animate-pulse rounded-sm bg-indigo-400"
                    style={{
                      height: `${20 + Math.sin(i) * 40 + 30}%`,
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
        <p className="mt-6 font-mono text-[10px] tracking-widest text-amber-500/80">
          [ SPATIAL MONITORING REQUIRED FOR LIVE PROGRAMS ]
        </p>
      )}

      <div className="mt-12 border border-slate-800 p-6">
        <p className="mb-2 font-mono text-[9px] tracking-widest text-slate-500">
          [ PROJECT BRIDGE // CLASSIFIED ]
        </p>
        <p className="text-sm italic text-slate-400">
          &ldquo;Non-invasive consciousness transduction. Your thoughts, preserved at frequencies
          the world has never recorded.&rdquo;
        </p>
        <a
          href="https://dreamframe.app"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block border border-indigo-500/30 px-6 py-3 font-mono text-xs tracking-widest text-indigo-300 transition hover:bg-indigo-950/40"
        >
          [ ENTER LAB → ]
        </a>
      </div>
    </div>
  );
}
