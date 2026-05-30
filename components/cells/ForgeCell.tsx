'use client';

import type { CellSignal } from '@/lib/cells-data';
import { useTerminalStore } from '@/lib/store/terminal-store';

const LOGS = [
  {
    id: '441',
    title: 'Subject orbit bug became feature',
    body: 'Z-axis compensation when panning behind the head — a psychoacoustic masking workaround now ships in the Subject rack.',
  },
  {
    id: '438',
    title: 'DreamFrame carrier band validated',
    body: '40Hz binaural tested across 12 sessions. False reports down 34% with proper classification UI.',
  },
  {
    id: '429',
    title: 'Index open transition v3',
    body: 'Clip-path wipe on open. Aperture intensity now reacts to live audio energy.',
  },
  {
    id: '401',
    title: 'Anomaly permissions',
    body: 'A permanent pressure valve. Design-system violations allowed. Witness-only discovery.',
  },
];

export default function ForgeCell({ signal }: { signal: CellSignal }) {
  const clearance = useTerminalStore((s) => s.clearance);
  const requestClearance = useTerminalStore((s) => s.requestClearance);
  const locked = clearance === 'L0';

  if (locked) {
    return (
      <div className="border-l-2 pl-6" style={{ borderColor: signal.accent }}>
        <p className="label-mono mb-6 text-[11px]" style={{ color: signal.accent }}>
          {signal.index} · {signal.kicker}
        </p>
        <h1 className="display-hero text-5xl text-[var(--bone)] sm:text-7xl">The Forge</h1>
        <p className="label-mono mt-8 text-[10px] text-[var(--blood)]">MEMBER ACCESS REQUIRED</p>
        <button
          type="button"
          onClick={requestClearance}
          className="mt-6 bg-[var(--blood)] px-6 py-3 label-mono text-[10px] text-[var(--bone)] transition hover:bg-[var(--ember)]"
        >
          REQUEST ACCESS
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="label-mono mb-6 text-[11px]" style={{ color: signal.accent }}>
        {signal.index} · {signal.kicker}
      </p>
      <h1 className="display-hero text-6xl leading-[0.85] text-[var(--bone)] sm:text-8xl">
        The Forge
      </h1>
      <p className="font-serif-italic mt-8 max-w-2xl text-xl text-[var(--ash)]">
        How the impossible gets made. Failed experiments celebrated. The process, unhidden.
      </p>

      <div className="mt-12 grid gap-px border hairline">
        {LOGS.map((log) => (
          <article key={log.id} className="bg-[#0a0a0b] p-6">
            <p className="label-mono mb-3 text-[9px]" style={{ color: signal.accent }}>
              FORGE LOG {log.id}
            </p>
            <h2 className="display-hero text-2xl text-[var(--bone)]">{log.title}</h2>
            <p className="font-serif-italic mt-2 text-[var(--ash)]">{log.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
