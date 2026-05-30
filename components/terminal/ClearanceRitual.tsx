'use client';

import { motion } from 'framer-motion';
import { useTerminalStore } from '@/lib/store/terminal-store';
import { Z2AudioEngine } from '@/lib/audio/Z2AudioEngine';
import { FIELD_ORDERS } from '@/lib/cells-data';

export default function ClearanceRitual({ onClose }: { onClose: () => void }) {
  const requestClearance = useTerminalStore((s) => s.requestClearance);
  const completeFieldOrder = useTerminalStore((s) => s.completeFieldOrder);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[85] flex items-center justify-center bg-[#020617]/90 backdrop-blur-xl p-4"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-slate-800 bg-slate-950/90">
        <div className="border-b border-slate-800 p-6">
          <p className="mb-2 font-mono text-[10px] tracking-[0.3em] text-amber-400">
            [ REQUEST CLEARANCE ]
          </p>
          <h2 className="text-xl font-light text-slate-100">You are not signing up.</h2>
          <p className="mt-2 text-sm text-slate-400">You are requesting clearance. The guild observes.</p>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="mb-2 block font-mono text-[9px] tracking-widest text-slate-500">
              PATHWAY ORIENTATION
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Oneironaut', 'Projector', 'Mystic'].map((p) => (
                <div
                  key={p}
                  className="border border-slate-800 px-2 py-3 text-center font-mono text-[10px] tracking-wider text-slate-400"
                >
                  {p}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block font-mono text-[9px] tracking-widest text-slate-500">
              FIELD ORDERS // AVAILABLE
            </label>
            {FIELD_ORDERS.map((fo) => (
              <div key={fo.id} className="mb-2 border border-slate-800/80 p-3">
                <p className="font-mono text-[9px] tracking-widest text-indigo-400">{fo.id}</p>
                <p className="text-sm text-slate-200">{fo.title}</p>
                <p className="text-xs text-slate-500">{fo.objective}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-800 p-6">
          <button
            type="button"
            onClick={() => {
              requestClearance();
              completeFieldOrder('FO-001');
              Z2AudioEngine.getInstance().playUiSound('unlock');
              onClose();
            }}
            className="relative flex-1 overflow-hidden border border-amber-500/40 bg-amber-500/10 py-3 font-mono text-xs tracking-widest text-amber-300"
          >
            <span className="relative z-10">[ GRANT CLEARANCE ]</span>
            <span className="absolute inset-0 shimmer-beam opacity-30" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="border border-slate-700 px-4 py-3 font-mono text-xs tracking-widest text-slate-500"
          >
            [ ABORT ]
          </button>
        </div>
      </div>
    </motion.div>
  );
}
