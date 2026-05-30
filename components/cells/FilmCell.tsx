'use client';

import { useEffect, useState } from 'react';
import type { CellSignal } from '@/lib/cells-data';
import { Z2AudioEngine } from '@/lib/audio/Z2AudioEngine';
import { useTerminalStore } from '@/lib/store/terminal-store';

const EVIDENCE = [
  { id: 1, label: 'SUBJECT 01', text: 'The carrier was not found. It found us.', redacted: true },
  { id: 2, label: 'LOCATION', text: 'Sector 7 — coordinates expunged', redacted: true },
  { id: 3, label: 'TIMELINE', text: 'Epoch 03 · broadcast imminent', redacted: false },
  { id: 4, label: 'PERSON OF INTEREST', text: 'Designation withheld', redacted: true },
  { id: 5, label: 'SYNOPSIS', text: 'A guild documents what the world refuses to classify.', redacted: false },
];

export default function FilmCell({ signal }: { signal: CellSignal }) {
  const [progress, setProgress] = useState(0);
  const audioEnabled = useTerminalStore((s) => s.audioEnabled);

  useEffect(() => {
    const scroller = document.querySelector('.fixed.z-\\[80\\]') as HTMLElement | null;
    const target = scroller ?? window;
    const read = () => {
      const y = scroller ? scroller.scrollTop : window.scrollY;
      setProgress(Math.min(1, y / 500));
    };
    target.addEventListener('scroll', read);
    read();
    return () => target.removeEventListener('scroll', read);
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <div
        className="mb-10 flex aspect-[2.39/1] items-center justify-center border hairline"
        style={{
          background: `linear-gradient(180deg, rgba(${signal.accentRgb},${0.04 + progress * 0.12}) 0%, #060507 100%)`,
        }}
      >
        <div className="text-center">
          <p className="label-mono text-[10px]" style={{ color: signal.accent }}>
            {signal.index} · BRIEFING-SLATE
          </p>
          <h1 className="display-hero mt-4 text-4xl tracking-tight text-[var(--bone)] sm:text-6xl">
            THE CARRIER
          </h1>
          <p className="label-mono mt-3 text-[9px] text-[var(--ash-dim)]">CLASSIFIED · EYES ONLY</p>
        </div>
      </div>

      <p className="label-mono mb-10 text-center text-[10px] text-[var(--ash-dim)]">
        SCROLL TO DECLASSIFY
      </p>

      <div className="grid gap-px border hairline">
        {EVIDENCE.map((item) => {
          const show = item.redacted ? progress > item.id * 0.14 : true;
          return (
            <div
              key={item.id}
              className="bg-[#0a0a0b] p-6"
              onMouseEnter={() => audioEnabled && Z2AudioEngine.getInstance().playUiSound('hover')}
            >
              <p className="label-mono mb-2 text-[9px]" style={{ color: signal.accent }}>
                EVIDENCE {item.id.toString().padStart(2, '0')} · {item.label}
              </p>
              <p
                className={`font-serif-italic text-xl transition-all duration-700 ${
                  show ? 'text-[var(--bone)] blur-0' : 'select-none text-[var(--ash-dim)] blur-sm'
                }`}
              >
                {show ? item.text : '████████████████████'}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-14 border-l-2 pl-6" style={{ borderColor: signal.accent }}>
        <p className="label-mono text-[10px]" style={{ color: signal.accent }}>
          TRANSMISSION SCHEDULED · EPOCH 03
        </p>
        <p className="font-serif-italic mt-2 text-[var(--ash)]">
          Premiere access opens to members.
        </p>
      </div>
    </div>
  );
}
