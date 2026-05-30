'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { CellSignal } from '@/lib/cells-data';
import { useTerminalStore } from '@/lib/store/terminal-store';
import { Z2AudioEngine } from '@/lib/audio/Z2AudioEngine';

export default function GameCell({ signal }: { signal: CellSignal }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clearance = useTerminalStore((s) => s.clearance);
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const gameRef = useRef<{ x: number; y: number; vx: number; vy: number; px: number; py: number } | null>(null);

  const start = useCallback(() => {
    if (clearance === 'L0') return;
    setPlaying(true);
    setScore(0);
    setTimeLeft(60);
    gameRef.current = {
      x: 200,
      y: 150,
      vx: 3,
      vy: 2.5,
      px: 200,
      py: 280,
    };
    Z2AudioEngine.getInstance().playUiSound('breach');
  }, [clearance]);

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

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      ctx.fillStyle = '#22d3ee';
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#22d3ee';
      ctx.beginPath();
      ctx.arc(g.px, g.py, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(g.x, g.y, 8, 0, Math.PI * 2);
      ctx.fill();

      const dx = g.x - g.px;
      const dy = g.y - g.py;
      if (Math.sqrt(dx * dx + dy * dy) < 20) {
        setScore((s) => s + 1);
        g.x = Math.random() * (canvas.width - 40) + 20;
        g.y = Math.random() * (canvas.height - 40) + 20;
        Z2AudioEngine.getInstance().playUiSound('tick');
      }

      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [playing]);

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
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      gameRef.current.px = clientX - rect.left;
      gameRef.current.py = clientY - rect.top;
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
      <h1 className="mb-4 text-4xl font-light text-slate-100">Play Vector // Shard-07</h1>
      <p className="mb-8 max-w-2xl text-lg text-slate-400">
        Play the slice. Not the trailer. Catch the carrier signal. 60 seconds. Clearance
        required.
      </p>

      {clearance === 'L0' ? (
        <div className="border border-red-500/30 bg-red-950/20 p-8 text-center">
          <p className="font-mono text-[10px] tracking-[0.3em] text-red-400">
            [ CLEARANCE INSUFFICIENT ]
          </p>
          <p className="mt-4 text-slate-400">Request Associate clearance to breach this shard.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between font-mono text-[10px] tracking-widest text-cyan-400">
            <span>SCORE: {score}</span>
            <span>TIME: {timeLeft}s</span>
          </div>
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="w-full max-w-lg border border-cyan-500/20 bg-[#010409] touch-none"
          />
          {!playing ? (
            <button
              type="button"
              onClick={start}
              className="mt-4 border border-cyan-500/40 bg-cyan-950/30 px-8 py-3 font-mono text-xs tracking-widest text-cyan-300"
            >
              [ INITIATE SHARD ]
            </button>
          ) : (
            <p className="mt-4 font-mono text-[10px] tracking-widest text-slate-500">
              Move cursor to catch amber signals with cyan carrier
            </p>
          )}
          {timeLeft === 0 && score > 0 && (
            <p className="mt-4 font-mono text-xs tracking-widest text-amber-400">
              [ SHARD COMPLETE // CLEARANCE REQUIRED TO CONTINUE → ]
            </p>
          )}
        </>
      )}
    </div>
  );
}
