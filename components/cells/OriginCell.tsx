'use client';

import type { CellSignal } from '@/lib/cells-data';

export default function OriginCell({ signal }: { signal: CellSignal }) {
  return (
    <div className="max-w-3xl">
      <p className="label-mono mb-6 text-[11px]" style={{ color: signal.accent }}>
        {signal.index} · {signal.kicker}
      </p>
      <h1 className="display-hero text-6xl leading-[0.85] text-[var(--bone)] sm:text-8xl">
        Z2 is a guild,
        <br />
        not a pitch deck.
      </h1>

      <div className="font-serif-italic mt-10 space-y-6 text-xl leading-relaxed text-[var(--ash)]">
        <p>
          We started Z2 because we kept building things that didn&apos;t fit in boxes —
          consciousness research tools, spatial audio engines, games that feel like instruments,
          films that feel like briefings, experiments we couldn&apos;t explain at dinner parties.
        </p>
        <p>
          Two builders. One guild. Still discovering exactly what we&apos;re building — and that
          uncertainty is fuel, not a flaw.
        </p>
        <p className="text-[var(--bone)]">Dream big with us. The index will multiply.</p>
      </div>

      <div className="mt-14 grid gap-px border hairline sm:grid-cols-2">
        {[
          { k: 'FOUNDED', v: '2025 · EPOCH ZERO' },
          { k: 'STATUS', v: 'EXPLORING · UNCLASSIFIED POTENTIAL' },
          { k: 'DISCIPLINES', v: 'GAMES · SOUND · FILM · CONSCIOUSNESS' },
          { k: 'NORTH STAR', v: 'INSTRUMENTS FOR ALTERED PERCEPTION' },
        ].map((item) => (
          <div key={item.k} className="bg-[#0a0a0b] p-6">
            <p className="label-mono mb-3 text-[9px] text-[var(--ash-dim)]">{item.k}</p>
            <p className="label-mono text-[11px]" style={{ color: signal.accent }}>
              {item.v}
            </p>
          </div>
        ))}
      </div>

      <a
        href="https://github.com/dreamframedev-design/z2"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-12 inline-block border hairline px-6 py-3 label-mono text-[10px] text-[var(--ash)] transition hover:border-[var(--blood)] hover:text-[var(--blood)]"
      >
        GITHUB ↗
      </a>
    </div>
  );
}
