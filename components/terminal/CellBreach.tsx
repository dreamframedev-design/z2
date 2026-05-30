'use client';

import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { CellSignal } from '@/lib/cells-data';
import OriginCell from '@/components/cells/OriginCell';
import DreamFrameCell from '@/components/cells/DreamFrameCell';
import SubjectCell from '@/components/cells/SubjectCell';
import GameCell from '@/components/cells/GameCell';
import FilmCell from '@/components/cells/FilmCell';
import AnomalyCell from '@/components/cells/AnomalyCell';
import ForgeCell from '@/components/cells/ForgeCell';

const CELL_MAP = {
  origin: OriginCell,
  dreamframe: DreamFrameCell,
  subject: SubjectCell,
  games: GameCell,
  film: FilmCell,
  anomaly: AnomalyCell,
  forge: ForgeCell,
};

export default function CellBreach({
  signal,
  onClose,
}: {
  signal: CellSignal;
  onClose: () => void;
}) {
  const CellContent = CELL_MAP[signal.id];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] overflow-y-auto bg-[#020617]"
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at top, rgba(${signal.accentRgb}, 0.15), transparent 60%)`,
        }}
      />

      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800/80 bg-[#020617]/90 px-4 py-4 backdrop-blur-md sm:px-8">
        <div>
          <p className="font-mono text-[9px] tracking-[0.3em] text-slate-500">
            [ BREACHING {signal.designation} ]
          </p>
          <p className={`font-mono text-sm tracking-widest ${signal.accent}`}>{signal.codename}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 border border-slate-700 px-4 py-2 font-mono text-[10px] tracking-widest text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
        >
          <X className="h-4 w-4" />
          [ EXIT BREACH ]
        </button>
      </header>

      <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
        <CellContent signal={signal} />
      </main>
    </motion.div>
  );
}
