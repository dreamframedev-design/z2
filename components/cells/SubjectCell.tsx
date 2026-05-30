'use client';

import { useEffect, useState, useCallback } from 'react';
import type { CellSignal } from '@/lib/cells-data';
import { Z2AudioEngine } from '@/lib/audio/Z2AudioEngine';
import { useTerminalStore } from '@/lib/store/terminal-store';

export default function SubjectCell({ signal }: { signal: CellSignal }) {
  const audioEnabled = useTerminalStore((s) => s.audioEnabled);
  const completeFieldOrder = useTerminalStore((s) => s.completeFieldOrder);
  const [active, setActive] = useState(false);
  const [orbitTime, setOrbitTime] = useState(0);
  const [params, setParams] = useState({
    carrierHz: 100,
    beatHz: 4,
    orbitSpeed: 0.02,
    filterHz: 2000,
  });

  useEffect(() => {
    if (!active || !audioEnabled) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      setOrbitTime(elapsed);
      if (elapsed >= 30) completeFieldOrder('FO-003');
    }, 100);
    return () => clearInterval(interval);
  }, [active, audioEnabled, completeFieldOrder]);

  const toggle = useCallback(async () => {
    if (!audioEnabled) return;
    await Z2AudioEngine.getInstance().init();
    if (active) {
      Z2AudioEngine.getInstance().stopSubjectRack();
      setActive(false);
      setOrbitTime(0);
    } else {
      Z2AudioEngine.getInstance().startSubjectRack(params);
      setActive(true);
    }
  }, [active, audioEnabled, params]);

  const update = (key: keyof typeof params, value: number) => {
    const next = { ...params, [key]: value };
    setParams(next);
    if (active) Z2AudioEngine.getInstance().updateSubjectRack(next);
  };

  const orbitX = Math.cos(orbitTime * params.orbitSpeed * 50) * 80;
  const orbitY = Math.sin(orbitTime * params.orbitSpeed * 50) * 40;

  return (
    <div>
      <h1 className="mb-4 text-4xl font-light text-slate-100 sm:text-5xl">Subject Null</h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-400">
        Z2 builds spatial audio infrastructure. Patch the rack. Orbit the field. Export
        disabled — you can only remember how it felt.
      </p>

      <div className="border border-emerald-500/20 bg-slate-950/60 p-6">
        <p className="mb-6 font-mono text-[10px] tracking-[0.3em] text-emerald-400">
          [ SUBJECT RACK // PATCH-NULL-7X ]
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5">
            {(
              [
                ['carrierHz', 'OSC A // CARRIER', 40, 200, 1],
                ['beatHz', 'OSC B // BEAT', 0.5, 40, 0.5],
                ['orbitSpeed', 'ORBIT // LFO', 0.005, 0.08, 0.001],
                ['filterHz', 'FILTER // LP', 200, 8000, 100],
              ] as const
            ).map(([key, label, min, max, step]) => (
              <div key={key}>
                <div className="mb-2 flex justify-between font-mono text-[10px] tracking-widest text-slate-500">
                  <span>{label}</span>
                  <span className="text-emerald-400">{params[key].toFixed(key === 'orbitSpeed' ? 3 : 1)}</span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={params[key]}
                  onChange={(e) => update(key, parseFloat(e.target.value))}
                  disabled={!audioEnabled}
                  className="w-full accent-emerald-500"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={toggle}
              disabled={!audioEnabled}
              className={`w-full py-4 font-mono text-xs tracking-[0.25em] transition ${
                active
                  ? 'border border-red-500/40 bg-red-950/30 text-red-300'
                  : 'border border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
              } ${!audioEnabled ? 'opacity-40' : ''}`}
            >
              {active ? '[ DISENGAGE ORBIT ]' : '[ INITIATE SPATIAL FIELD ]'}
            </button>
          </div>

          <div className="relative flex min-h-[280px] items-center justify-center border border-slate-800 bg-[#010409]">
            <div className="absolute inset-0 opacity-20">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 rounded-full border border-emerald-500/30"
                  style={{
                    width: 40 + i * 40,
                    height: 40 + i * 40,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              ))}
            </div>
            <div
              className="absolute h-4 w-4 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.8)] transition-transform duration-75"
              style={{
                transform: `translate(${orbitX}px, ${orbitY}px)`,
              }}
            />
            <div className="absolute bottom-4 font-mono text-[9px] tracking-widest text-slate-600">
              SPATIAL PAN TRACE
            </div>
          </div>
        </div>

        {active && (
          <p className="mt-4 font-mono text-[10px] tracking-widest text-emerald-500/70">
            ORBIT HOLD: {Math.min(30, Math.floor(orbitTime))}s / 30s — FIELD ORDER FO-003
          </p>
        )}
      </div>
    </div>
  );
}
