'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Radio } from 'lucide-react';
import { CELLS, type CellSignal } from '@/lib/cells-data';
import { useTerminalStore } from '@/lib/store/terminal-store';
import { Z2AudioEngine } from '@/lib/audio/Z2AudioEngine';

function WaveformBars({ active, rgb }: { active: boolean; rgb: string }) {
  return (
    <div className="flex h-8 items-end gap-0.5">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-sm"
          style={{
            background: active ? `rgba(${rgb}, 0.9)` : 'rgba(100,116,139,0.3)',
          }}
          animate={{
            height: active ? ['20%', `${30 + Math.random() * 70}%`, '20%'] : '20%',
          }}
          transition={{
            duration: 0.4 + i * 0.05,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function SignalCard({
  signal,
  index,
  onBreach,
}: {
  signal: CellSignal;
  index: number;
  onBreach: (s: CellSignal) => void;
}) {
  const { recordHover, clearance, witnessedAnomaly } = useTerminalStore();

  if (signal.hidden && !witnessedAnomaly) return null;

  const locked =
    signal.clearance.includes('L2') && clearance !== 'L2' && clearance !== 'L3';

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onMouseEnter={() => {
        if (locked) return;
        Z2AudioEngine.getInstance().playUiSound('hover');
        recordHover(signal.id);
      }}
      onClick={() => {
        if (locked) {
          Z2AudioEngine.getInstance().playUiSound('anomaly');
          return;
        }
        Z2AudioEngine.getInstance().playUiSound('breach');
        onBreach(signal);
      }}
      className={`group relative w-full border text-left transition-all duration-300 ${
        signal.id === 'anomaly'
          ? 'border-fuchsia-500/30 bg-fuchsia-950/20 hover:border-fuchsia-400/60'
          : 'border-slate-800 bg-slate-950/40 hover:border-slate-600'
      } ${locked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 0%, rgba(${signal.accentRgb}, 0.12), transparent 70%)`,
          }}
        />
      </div>

      <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[9px] tracking-[0.25em] text-slate-500">
              [{signal.designation}]
            </span>
            <span className={`font-mono text-[9px] tracking-widest ${signal.accent}`}>
              {signal.codename}
            </span>
            {locked && (
              <span className="font-mono text-[9px] tracking-widest text-red-400/80">
                LOCKED
              </span>
            )}
          </div>
          <h3 className="mb-1 text-lg font-light text-slate-100">{signal.domain}</h3>
          <p className="text-sm text-slate-500">{signal.hook}</p>
        </div>

        <div className="flex items-center gap-6">
          <WaveformBars active={!locked} rgb={signal.accentRgb} />
          <div className="text-right font-mono text-[10px] tracking-widest text-slate-600">
            <div className="flex items-center gap-1 justify-end mb-1">
              <Radio className="h-3 w-3" />
              {signal.frequency}
            </div>
            <div>{signal.clearance}</div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-slate-800/80 px-5 py-2 font-mono text-[9px] tracking-[0.2em] text-slate-600 group-hover:text-amber-400/80">
        {locked ? '[ CLEARANCE INSUFFICIENT ]' : '[ BREACH SIGNAL → ]'}
      </div>
    </motion.button>
  );
}

export default function SignalScanner({ onBreach }: { onBreach: (s: CellSignal) => void }) {
  const { affinityHover } = useTerminalStore();

  const ordered = useMemo(() => {
    return [...CELLS].sort((a, b) => {
      const ah = affinityHover[a.id] ?? 0;
      const bh = affinityHover[b.id] ?? 0;
      if (ah !== bh) return bh - ah;
      return Math.random() - 0.5;
    });
  }, [affinityHover]);

  return (
    <section className="w-full">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-2 font-mono text-[10px] tracking-[0.35em] text-indigo-400">
            [ SIGNAL SCANNER // ACTIVE ]
          </p>
          <h2 className="text-3xl font-light tracking-tight text-slate-100 sm:text-4xl">
            Scan for clearance
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-500">
            Six cells. One guild. The work is not shown — it is breached.
          </p>
        </div>
        <div className="hidden items-center gap-2 font-mono text-[10px] tracking-widest text-emerald-500/80 sm:flex">
          <Activity className="h-4 w-4 animate-pulse" />
          LIVE
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {ordered.map((signal, i) => (
          <SignalCard key={signal.id} signal={signal} index={i} onBreach={onBreach} />
        ))}
      </div>
    </section>
  );
}
