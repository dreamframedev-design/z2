'use client';

import type { CellSignal } from '@/lib/cells-data';

export default function OriginCell({ signal }: { signal: CellSignal }) {
  return (
    <div className="max-w-3xl">
      <p className="mb-4 font-mono text-[10px] tracking-[0.35em] text-amber-400">
        [ ORIGIN FILE // DECLASSIFIED LAYER-0 ]
      </p>
      <h1 className="mb-6 text-4xl font-light leading-tight text-slate-100 sm:text-5xl">
        Z2 is a guild, not a pitch deck.
      </h1>

      <div className="space-y-6 text-lg leading-relaxed text-slate-400">
        <p>
          We started Z2 because we kept building things that didn&apos;t fit in boxes — consciousness
          research tools, spatial audio engines, games that feel like instruments, films that feel
          like briefings, experiments we couldn&apos;t explain at dinner parties.
        </p>
        <p>
          Two operators. One guild. Still discovering exactly what we&apos;re building — and that
          uncertainty is fuel, not a flaw.
        </p>
        <p>
          This Terminal is the airlock. The public front door to whatever we&apos;re brave enough
          to ship next. We don&apos;t have every answer yet. We have clearance levels, Field Orders,
          and a hypercube that never stops turning.
        </p>
        <p className="text-slate-300">
          Dream big with us. The cells will multiply.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {[
          { label: 'FOUNDING', value: '2025 // EPOCH-ZERO' },
          { label: 'STATUS', value: 'EXPLORING // UNCLASSIFIED POTENTIAL' },
          { label: 'DISCIPLINES', value: 'GAMES · SOUND · FILM · CONSCIOUSNESS · ANOMALY' },
          { label: 'NORTH STAR', value: 'BUILD INSTRUMENTS FOR ALTERED PERCEPTION' },
        ].map((item) => (
          <div key={item.label} className="border border-slate-800 bg-slate-950/50 p-5">
            <p className="mb-2 font-mono text-[9px] tracking-widest text-slate-600">
              {item.label}
            </p>
            <p className="font-mono text-xs tracking-wider text-amber-400/90">{item.value}</p>
          </div>
        ))}
      </div>

      <blockquote className="mt-12 border-l-2 border-indigo-500/40 pl-6 italic text-slate-500">
        &ldquo;We don&apos;t know exactly what Z2 becomes. That&apos;s the point. The Terminal
        grows as we do.&rdquo;
      </blockquote>

      <div className="mt-12 flex flex-wrap gap-3">
        <a
          href="https://github.com/dreamframedev-design/z2"
          target="_blank"
          rel="noopener noreferrer"
          className="border border-slate-700 px-5 py-3 font-mono text-[10px] tracking-widest text-slate-400 transition hover:border-amber-500/40 hover:text-amber-400"
        >
          [ GITHUB // Z2 ]
        </a>
      </div>
    </div>
  );
}
