'use client';

import { useEffect, useState } from 'react';
import type { CellSignal } from '@/lib/cells-data';
import { Z2AudioEngine } from '@/lib/audio/Z2AudioEngine';
import { useTerminalStore } from '@/lib/store/terminal-store';

const EVIDENCE = [
  { id: 1, label: 'SUBJECT-01', text: 'The carrier was not found. It found us.', redacted: true },
  { id: 2, label: 'LOCATION', text: 'Sector 7 — coordinates expunged', redacted: true },
  { id: 3, label: 'TIMELINE', text: 'Epoch-03 // Broadcast imminent', redacted: false },
  { id: 4, label: 'PERSON OF INTEREST', text: 'Operator designation withheld', redacted: true },
  { id: 5, label: 'SYNOPSIS', text: 'A guild documents what the world refuses to classify.', redacted: false },
];

export default function FilmCell({ signal }: { signal: CellSignal }) {
  const [scrollY, setScrollY] = useState(0);
  const audioEnabled = useTerminalStore((s) => s.audioEnabled);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const reveal = Math.min(1, scrollY / 400);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 aspect-[2.39/1] overflow-hidden border border-rose-500/20 bg-black">
        <div
          className="flex h-full items-center justify-center"
          style={{
            background: `linear-gradient(180deg, rgba(251,113,133,${0.05 + reveal * 0.1}) 0%, #000 100%)`,
          }}
        >
          <div className="text-center">
            <p className="font-mono text-[10px] tracking-[0.4em] text-rose-400/80">
              [ BRIEFING-SLATE-03 ]
            </p>
            <h1 className="mt-4 text-3xl font-light tracking-[0.2em] text-slate-200 sm:text-4xl">
              THE CARRIER SEQUENCE
            </h1>
            <p className="mt-2 font-mono text-[10px] tracking-widest text-slate-600">
              CLASSIFIED // EYES ONLY
            </p>
          </div>
        </div>
      </div>

      <p className="mb-12 text-center font-mono text-[10px] tracking-widest text-slate-500">
        Scroll to declassify evidence // Score reacts to velocity
      </p>

      <div className="space-y-6">
        {EVIDENCE.map((item) => {
          const show = item.redacted ? reveal > item.id * 0.15 : true;
          return (
            <div
              key={item.id}
              className="border border-slate-800 bg-slate-950/40 p-6"
              onMouseEnter={() => audioEnabled && Z2AudioEngine.getInstance().playUiSound('hover')}
            >
              <p className="mb-2 font-mono text-[9px] tracking-widest text-rose-400">
                EVIDENCE #{item.id.toString().padStart(2, '0')} — {item.label}
              </p>
              <p
                className={`text-lg leading-relaxed transition-all duration-700 ${
                  show ? 'text-slate-200 blur-0' : 'text-slate-600 blur-sm select-none'
                }`}
              >
                {show ? item.text : '████████████████████████'}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-16 border-t border-rose-500/20 pt-8 text-center">
        <p className="font-mono text-[10px] tracking-[0.3em] text-rose-400">
          [ TRANSMISSION SCHEDULED // EPOCH-03 ]
        </p>
        <p className="mt-4 text-sm text-slate-500">
          Premiere access unlocks at Operative clearance
        </p>
      </div>
    </div>
  );
}
