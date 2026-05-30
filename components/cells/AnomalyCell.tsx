'use client';

import { useEffect } from 'react';
import type { CellSignal } from '@/lib/cells-data';
import { Z2AudioEngine } from '@/lib/audio/Z2AudioEngine';
import { useTerminalStore } from '@/lib/store/terminal-store';

export default function AnomalyCell({ signal }: { signal: CellSignal }) {
  const audioEnabled = useTerminalStore((s) => s.audioEnabled);

  useEffect(() => {
    if (audioEnabled) Z2AudioEngine.getInstance().playUiSound('anomaly');
  }, [audioEnabled]);

  return (
    <div className="min-h-[60vh]">
      <h1
        className="mb-8 text-6xl font-bold"
        style={{ fontFamily: 'Comic Sans MS, cursive', color: signal.accent }}
      >
        unclassified
      </h1>
      <p className="mb-4 text-2xl text-lime-300" style={{ fontFamily: 'Times New Roman, serif' }}>
        You weren&apos;t supposed to find this.
      </p>
      <p className="font-serif-italic mb-10 max-w-xl text-lg text-[var(--ash)]">
        The Anomaly breaks every rule the index enforces. Wrong fonts. Wrong colors. Beautiful
        mistakes. Witness logged.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rotate-1 border-4 p-5" style={{ borderColor: '#facc15', background: '#2e0606' }}>
          <p className="label-mono text-xs text-yellow-300">[ DATA EXPUNGED ]</p>
        </div>
        <div className="-rotate-2 border p-5" style={{ borderColor: signal.accent }}>
          <p className="text-sm" style={{ color: signal.accent }}>
            The carrier is not a sound. It&apos;s a door that opens both ways.
          </p>
        </div>
      </div>

      <pre className="mt-12 overflow-hidden text-[8px] leading-none text-lime-400/50">
        {`01001010 01001110 01010100 01000101 01010010 01001110
Z2-ANOMALY · WITNESS MARK APPLIED
THE VOID REMembers NOTHING — typo intentional`}
      </pre>
    </div>
  );
}
