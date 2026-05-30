'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { CellSignal } from '@/lib/cells-data';
import { useTerminalStore } from '@/lib/store/terminal-store';
import { Z2AudioEngine } from '@/lib/audio/Z2AudioEngine';

export default function GameCell({ signal }: { signal: CellSignal }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clearance = useTerminalStore((s) => s.clearance);
  const requestClearance = useTerminalStore((s) => s.requestClearance);
  const audioEnabled = useTerminalStore((s) => s.audioEnabled);
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const gameRef = useRef<{ x: number; y: number; vx: number; vy: number; px: number; py: number } | null>(null);

  const locked = clearance === 'L0';

  const start = useCallback(() => {
    if (locked) return;
    setPlaying(true);
    setScore(0);
    setTimeLeft(60);
    gameRef.current = { x: 200, y: 150, vx: 3, vy: 2.5, px: 200, py: 280 };
    if (audioEnabled) Z2AudioEngine.getInstance().playUiSound('breach');
  }, [locked, audioEnabled]);

  useEffect(() => {
    if (!playing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const loop = () => {
      const g = gameRef.current;
      if (!g) return;
      g.x += g.vx;
      g.y += g.vy;
      if (g.x < 10 || g.x > canvas.width - 10) g.vx *= -1;
      if (g.y < 10 || g.y > canvas.height - 10) g.vy *= -1;

      ctx.fillStyle = '#060507';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = `rgba(${signal.accentRgb}, 0.14)`;
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      ctx.fillStyle = signal.accent;
      ctx.shadowBlur = 22;
      ctx.shadowColor = signal.accent;
      ctx.beginPath();
      ctx.arc(g.px, g.py, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ede8e0';
      ctx.beginPath();
      ctx.arc(g.x, g.y, 7, 0, Math.PI * 2);
      ctx.fill();

      const dx = g.x - g.px;
      const dy = g.y - g.py;
      if (Math.sqrt(dx * dx + dy * dy) < 20) {
        setScore((s) => s + 1);
        g.x = Math.random() * (canvas.width - 40) + 20;
        g.y = Math.random() * (canvas.height - 40) + 20;
        if (audioEnabled) Z2AudioEngine.getInstance().playUiSound('tick');
      }
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [playing, signal.accent, signal.accentRgb, audioEnabled]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setTimeLeft((tl) => {
        if (tl <= 1) {
          setPlaying(false);
          return 0;
        }
        return tl - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const move = (e: MouseEvent | TouchEvent) => {
      if (!playing || !gameRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
      gameRef.current.px = cx - rect.left;
      gameRef.current.py = cy - rect.top;
    };
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('touchmove', move, { passive: true });
    return () => {
      canvas.removeEventListener('mousemove', move);
      canvas.removeEventListener('touchmove', move);
    };
  }, [playing]);

  return (
    <div>
      <p className="label-mono mb-6 text-[11px]" style={{ color: signal.accent }}>
        {signal.index} · {signal.kicker}
      </p>
      <h1 className="display-hero text-6xl leading-[0.85] text-[var(--bone)] sm:text-8xl">
        Play Vector
      </h1>
      <p className="font-serif-italic mt-8 max-w-2xl text-xl text-[var(--ash)]">
        Play the slice, not the trailer. Catch the signal. Sixty seconds. Member access.
      </p>

      {locked ? (
        <div className="mt-12 border-l-2 pl-6" style={{ borderColor: signal.accent }}>
          <p className="label-mono text-[10px] text-[var(--blood)]">MEMBER ACCESS REQUIRED</p>
          <p className="font-serif-italic mt-3 text-lg text-[var(--ash)]">
            Request access to play this shard.
          </p>
          <button
            type="button"
            onClick={requestClearance}
            className="mt-6 bg-[var(--blood)] px-6 py-3 label-mono text-[10px] text-[var(--bone)] transition hover:bg-[var(--ember)]"
          >
            REQUEST ACCESS
          </button>
        </div>
      ) : (
        <div className="mt-12">
          <div className="mb-4 flex justify-between label-mono text-[10px]" style={{ color: signal.accent }}>
            <span>SCORE · {score}</span>
            <span>TIME · {timeLeft}s</span>
          </div>
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="w-full max-w-lg touch-none border hairline"
            style={{ background: '#060507' }}
          />
          {!playing ? (
            <button
              type="button"
              onClick={start}
              className="mt-4 bg-[var(--blood)] px-8 py-3 label-mono text-[10px] text-[var(--bone)] transition hover:bg-[var(--ember)]"
            >
              INITIATE SHARD
            </button>
          ) : (
            <p className="font-serif-italic mt-4 text-sm text-[var(--ash-dim)]">
              Move your cursor — guide the red carrier into the bone signals.
            </p>
          )}
          {timeLeft === 0 && score > 0 && (
            <p className="label-mono mt-4 text-[10px]" style={{ color: signal.accent }}>
              SHARD COMPLETE · {score} CAUGHT · CONTINUE IN FULL RELEASE ↗
            </p>
          )}
        </div>
      )}
    </div>
  );
}
