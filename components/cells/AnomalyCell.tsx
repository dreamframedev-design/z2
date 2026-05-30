'use client';

import { useEffect } from 'react';
import type { CellSignal } from '@/lib/cells-data';
import { Z2AudioEngine } from '@/lib/audio/Z2AudioEngine';

export default function AnomalyCell({ signal }: { signal: CellSignal }) {
  useEffect(() => {
    Z2AudioEngine.getInstance().playUiSound('anomaly');
  }, []);

  return (
    <div className="anomaly-text min-h-[60vh]">
      <h1
        className="mb-8 text-5xl font-bold text-fuchsia-400"
        style={{ fontFamily: 'Comic Sans MS, cursive' }}
      >
        UNCLASSIFIED
      </h1>
      <p className="mb-4 text-2xl text-lime-400" style={{ fontFamily: 'Times New Roman' }}>
        You weren&apos;t supposed to find this.
      </p>
      <p className="mb-8 max-w-xl text-slate-400">
        The Anomaly cell violates every rule the Terminal enforces. Wrong fonts. Wrong colors.
        Beautiful mistakes. Witness logged.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rotate-1 border-4 border-yellow-400 bg-purple-900 p-4">
          <p className="font-mono text-xs text-yellow-300">[ DATA EXPUNGED ]</p>
        </div>
        <div className="-rotate-2 border border-fuchsia-500 p-4">
          <p className="text-sm text-fuchsia-200">
            The carrier is not a sound. It&apos;s a door that opens both ways.
          </p>
        </div>
      </div>

      <div className="mt-12 overflow-hidden">
        <pre className="text-[8px] leading-none text-emerald-500/60">
          {`01001010 01001110 01010100 01000101 01010010 01001110 01000001 01001100
Z2-ANOMALY-UNCLASSIFIED // WITNESS MARK APPLIED
THE VOID REMembers NOTHING — typo intentional`}
        </pre>
      </div>
    </div>
  );
}
