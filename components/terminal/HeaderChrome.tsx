'use client';

import { useTerminalStore } from '@/lib/store/terminal-store';

export default function HeaderChrome() {
  const { clearance, protocolId, xp, witnessedAnomaly } = useTerminalStore();

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
      <div className="flex items-center gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.35em] text-amber-400">
            Z2 TERMINAL
          </p>
          <p className="font-mono text-[9px] tracking-widest text-slate-600">
            [ SOURCE-LINE // NO CEILING ]
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] tracking-widest">
        <span className="text-slate-500">
          CLEARANCE: <span className="text-amber-400">{clearance}</span>
        </span>
        {protocolId && (
          <span className="text-slate-500">
            ID: <span className="text-indigo-400">[{protocolId}]</span>
          </span>
        )}
        <span className="text-slate-500">
          XP: <span className="text-emerald-400">{xp}</span>
        </span>
        {witnessedAnomaly && (
          <span className="text-fuchsia-400/80">[ ANOMALY-WITNESS ]</span>
        )}
      </div>
    </header>
  );
}
