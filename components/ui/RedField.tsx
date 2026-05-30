'use client';

import { useEffect, useRef } from 'react';

/**
 * Z2 AMBIENCE
 * A single deep red glow that breathes and drifts, very slowly.
 * No scanlines, no sweeps, no noise gimmicks — just atmosphere.
 */
export default function RedField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;
    const mouse = { x: 0.5, y: 0.4, tx: 0.5, ty: 0.4 };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      t += 0.0015;
      mouse.x += (mouse.tx - mouse.x) * 0.03;
      mouse.y += (mouse.ty - mouse.y) * 0.03;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#0b0a0a';
      ctx.fillRect(0, 0, w, h);

      const breathe = (Math.sin(t * 2) + 1) * 0.5;
      const cx = w * (0.5 + Math.sin(t) * 0.08) + (mouse.x - 0.5) * w * 0.05;
      const cy = h * (0.46 + Math.cos(t * 0.8) * 0.06) + (mouse.y - 0.5) * h * 0.05;
      const r = Math.max(w, h) * (0.5 + breathe * 0.08);

      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(219, 19, 59, ${0.08 + breathe * 0.03})`);
      g.addColorStop(0.4, 'rgba(120, 12, 24, 0.04)');
      g.addColorStop(1, 'rgba(11, 10, 10, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = e.clientY / window.innerHeight;
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return <canvas ref={ref} className="fixed inset-0 -z-10" style={{ background: '#0b0a0a' }} />;
}
