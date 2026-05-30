'use client';

import type { CellSignal } from '@/lib/cells-data';
import { useTerminalStore } from '@/lib/store/terminal-store';

const LOGS = [
  {
    id: '441',
    title: 'Subject orbit path bug became feature',
    body: 'Z-axis compensation when panning behind head — psychoacoustic masking workaround now ships in Subject Null rack.',
  },
  {
    id: '438',
    title: 'DreamFrame carrier band validated',
    body: '40Hz binaural program tested across 12 operator sessions. False OBE reports down 34% with proper classification UI.',
  },
  {
    id: '429',
    title: 'Terminal breach transition v3',
    body: 'Fracture geometry on cell entry. Sub-cube count scales with active cell registry. Bloom threshold tuned.',
  },
  {
    id: '401',
    title: 'Anomaly cell permissions',
    body: 'Permanent pressure valve. Design system violations allowed. Witness-only discovery vectors armed.',
  },
];

export default function ForgeCell({ signal }: { signal: CellSignal }) {
  const clearance = useTerminalStore((s) => s.clearance);

  if (clearance !== 'L2' && clearance !== 'L3') {
    return (
      <div className="border border-amber-500/30 bg-amber-950/10 p-12 text-center">
        <p className="font-mono text-[10px] tracking-[0.3em] text-amber-400">
          [ FORGE-LOG // OPERATIVE CLEARANCE REQUIRED ]
        </p>
        <p className="mt-4 text-slate-400">
          Complete Field Orders and earn 500 XP to elevate to Operative status.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 text-4xl font-light text-slate-100">The Forge</h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-400">
        How the impossible gets made. Failed experiments celebrated. Process without LinkedIn
        energy.
      </p>

      <div className="space-y-4">
        {LOGS.map((log) => (
          <article key={log.id} className="border border-amber-500/10 bg-slate-950/50 p-6">
            <p className="mb-2 font-mono text-[9px] tracking-widest text-amber-500/80">
              [ FORGE-LOG-{log.id} ]
            </p>
            <h2 className="mb-2 text-lg text-slate-200">{log.title}</h2>
            <p className="text-sm leading-relaxed text-slate-500">{log.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
