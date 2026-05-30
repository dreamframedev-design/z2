'use client';

import { motion } from 'framer-motion';
import type { CellSignal } from '@/lib/cells-data';
import OriginCell from '@/components/cells/OriginCell';
import DreamFrameCell from '@/components/cells/DreamFrameCell';
import SubjectCell from '@/components/cells/SubjectCell';
import GameCell from '@/components/cells/GameCell';
import FilmCell from '@/components/cells/FilmCell';
import AnomalyCell from '@/components/cells/AnomalyCell';
import ForgeCell from '@/components/cells/ForgeCell';

const MAP = {
  origin: OriginCell,
  dreamframe: DreamFrameCell,
  subject: SubjectCell,
  games: GameCell,
  film: FilmCell,
  anomaly: AnomalyCell,
  forge: ForgeCell,
};

export default function DossierPanel({
  signal,
  onClose,
}: {
  signal: CellSignal;
  onClose: () => void;
}) {
  const Content = MAP[signal.id];

  return (
    <motion.div
      initial={{ clipPath: 'inset(0 0 100% 0)' }}
      animate={{ clipPath: 'inset(0 0 0% 0)' }}
      exit={{ clipPath: 'inset(100% 0 0 0)' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[80] overflow-y-auto"
      style={{ background: '#060507' }}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(${signal.accentRgb},0.18), transparent 70%)`,
        }}
      />

      <header className="sticky top-0 z-10 flex items-center justify-between border-b hairline px-5 py-5 backdrop-blur-md sm:px-10">
        <div className="flex items-baseline gap-4">
          <span
            className="label-mono text-[11px]"
            style={{ color: signal.accent }}
          >
            {signal.index}
          </span>
          <span className="label-mono text-[11px] text-[var(--ash)]">{signal.kicker}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="group flex items-center gap-3 label-mono text-[11px] text-[var(--ash)] transition hover:text-[var(--bone)]"
        >
          <span>CLOSE</span>
          <span
            className="flex h-8 w-8 items-center justify-center border hairline transition group-hover:border-[var(--blood)] group-hover:bg-[var(--blood)]"
            style={{ color: 'inherit' }}
          >
            ×
          </span>
        </button>
      </header>

      <main className="relative mx-auto max-w-6xl px-5 py-12 sm:px-10 sm:py-20">
        <Content signal={signal} />
      </main>
    </motion.div>
  );
}
