'use client';

import { motion } from 'framer-motion';
import { Z2AudioEngine } from '@/lib/audio/Z2AudioEngine';

export default function ConsentRitual({ onAccept, onDecline }: { onAccept: () => void; onDecline: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#020617]/95 backdrop-blur-xl"
    >
      <div className="mx-4 max-w-md border border-slate-800 bg-slate-950/80 p-8">
        <p className="mb-2 font-mono text-[10px] tracking-[0.3em] text-indigo-400">
          [ SPATIAL MONITORING ]
        </p>
        <h2 className="mb-4 text-2xl font-light tracking-tight text-slate-100">
          Enable spatial monitoring?
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-slate-400">
          Z2 Terminal respires through a live psychoacoustic engine. Room tone adapts to time of
          day. Cursor position pans the field. This is not background music — it is the nervous
          system of the guild.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={async () => {
              await Z2AudioEngine.getInstance().init();
              await Z2AudioEngine.getInstance().startRoomTone();
              Z2AudioEngine.getInstance().playUiSound('unlock');
              onAccept();
            }}
            className="relative flex-1 overflow-hidden border border-amber-500/40 bg-amber-500/10 px-6 py-3 font-mono text-xs tracking-widest text-amber-300 transition hover:bg-amber-500/20"
          >
            <span className="relative z-10">[ ACCEPT ]</span>
            <span className="absolute inset-0 shimmer-beam opacity-30" />
          </button>
          <button
            type="button"
            onClick={onDecline}
            className="flex-1 border border-slate-700 px-6 py-3 font-mono text-xs tracking-widest text-slate-500 transition hover:border-slate-600 hover:text-slate-400"
          >
            [ DECLINE — ATTENUATED ]
          </button>
        </div>
        <p className="mt-6 font-mono text-[9px] tracking-widest text-slate-600">
          PROTOCOL: NEURAL-CALIBRATION // SUBJECT-NULL-ZERO
        </p>
      </div>
    </motion.div>
  );
}
