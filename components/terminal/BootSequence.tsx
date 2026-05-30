'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LINES = [
  '[ Z2 TERMINAL // INITIALIZING ]',
  '[ HYPERCUBE GEOMETRY // LOADED ]',
  '[ SPATIAL MONITORING // STANDBY ]',
  '[ SIGNAL SCANNER // ARMED ]',
  '[ SIX CELLS // ONE GUILD ]',
  '[ AWAITING OPERATOR ]',
];

export default function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [lineIndex, setLineIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (lineIndex < BOOT_LINES.length) {
      const t = setTimeout(() => setLineIndex((i) => i + 1), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(onComplete, 600);
    return () => clearTimeout(t);
  }, [lineIndex, onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 100));
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#020617]"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full max-w-lg px-8 font-mono text-xs tracking-widest">
        <AnimatePresence mode="popLayout">
          {BOOT_LINES.slice(0, lineIndex).map((line, i) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`mb-2 ${i === lineIndex - 1 ? 'text-amber-400' : 'text-slate-500'}`}
            >
              {line}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-12 w-full max-w-lg px-8">
        <div className="mb-2 flex justify-between font-mono text-[10px] tracking-widest text-slate-600">
          <span>BOOT SEQUENCE</span>
          <span>{progress}%</span>
        </div>
        <div className="h-px w-full overflow-hidden bg-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-amber-400 to-indigo-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
