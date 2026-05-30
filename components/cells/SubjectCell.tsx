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
      <p className="label-mono mb-6 text-[11px]" style={{ color: signal.accent }}>
        {signal.index} · {signal.kicker}
      </p>
      <h1 className="display-hero text-6xl leading-[0.85] text-[var(--bone)] sm:text-8xl">
        Subject
      </h1>
      <p className="font-serif-italic mt-8 max-w-2xl text-xl text-[var(--ash)]">
        Z2 builds spatial audio infrastructure. Patch the rack. Orbit the field. Export
        disabled — you can only remember how it felt.
      </p>

      <div className="mt-12 border hairline">
        <div className="border-b hairline px-6 py-4">
          <p className="label-mono text-[10px]" style={{ color: signal.accent }}>
            SUBJECT RACK · PATCH NULL-7X
          </p>
        </div>

        <div className="grid gap-px lg:grid-cols-2">
          <div className="space-y-6 bg-[#0a0a0b] p-6">
            {(
              [
                ['carrierHz', 'OSC A · CARRIER', 40, 200, 1],
                ['beatHz', 'OSC B · BEAT', 0.5, 40, 0.5],
                ['orbitSpeed', 'ORBIT · LFO', 0.005, 0.08, 0.001],
                ['filterHz', 'FILTER · LP', 200, 8000, 100],
              ] as const
            ).map(([key, label, min, max, step]) => (
              <div key={key}>
                <div className="mb-2 flex justify-between label-mono text-[10px] text-[var(--ash)]">
                  <span>{label}</span>
                  <span style={{ color: signal.accent }}>
                    {params[key].toFixed(key === 'orbitSpeed' ? 3 : 1)}
                  </span>
                </div>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={params[key]}
                  onChange={(e) => update(key, parseFloat(e.target.value))}
                  disabled={!audioEnabled}
                  className="w-full"
                  style={{ accentColor: signal.accent }}
                />
              </div>
            ))}

            <button
              type="button"
              onClick={toggle}
              disabled={!audioEnabled}
              className={`w-full py-4 label-mono text-[11px] transition ${!audioEnabled ? 'opacity-40' : ''}`}
              style={{
                background: active ? 'transparent' : signal.accent,
                border: active ? '1px solid rgba(237,232,224,0.2)' : 'none',
                color: active ? 'var(--ash)' : 'var(--bone)',
              }}
            >
              {active ? 'DISENGAGE ORBIT' : 'INITIATE SPATIAL FIELD'}
            </button>
          </div>

          <div className="relative flex min-h-[300px] items-center justify-center bg-[#060507]">
            <div className="absolute inset-0 opacity-25">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 rounded-full"
                  style={{
                    width: 50 + i * 44,
                    height: 50 + i * 44,
                    transform: 'translate(-50%, -50%)',
                    border: `1px solid rgba(${signal.accentRgb}, 0.4)`,
                  }}
                />
              ))}
            </div>
            <div
              className="absolute h-4 w-4 rounded-full transition-transform duration-75"
              style={{
                background: signal.accent,
                boxShadow: `0 0 24px ${signal.accent}`,
                transform: `translate(${orbitX}px, ${orbitY}px)`,
              }}
            />
            <span className="absolute bottom-4 label-mono text-[9px] text-[var(--ash-dim)]">
              SPATIAL PAN TRACE
            </span>
          </div>
        </div>
      </div>

      {active && (
        <p className="label-mono mt-4 text-[10px]" style={{ color: signal.accent }}>
          ORBIT HOLD · {Math.min(30, Math.floor(orbitTime))}s / 30s
        </p>
      )}
      {!audioEnabled && (
        <p className="label-mono mt-4 text-[10px] text-[var(--blood)]">ENABLE SOUND TO PATCH</p>
      )}
    </div>
  );
}
