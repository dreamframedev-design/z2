'use client';

import { useEffect, useRef } from 'react';

/**
 * Z2 RED FIELD
 * Broadcast-signal interference: drifting horizontal scan bands,
 * a slow ember light that breathes, and reactive cursor heat.
 * Replaces the indigo particle field entirely.
 */
export default function RedField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let raf = 0;
    let t = 0;

    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      t += 1;
      ctx.clearRect(0, 0, width, height);

      // base ink wash
      ctx.fillStyle = '#0a0a0b';
      ctx.fillRect(0, 0, width, height);

      // drifting ember core (radial red glow that breathes + follows cursor slightly)
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      const breathe = (Math.sin(t * 0.006) + 1) * 0.5;
      const cx = width * 0.5 + Math.sin(t * 0.0015) * width * 0.12 + (mouse.x > 0 ? (mouse.x - width / 2) * 0.06 : 0);
      const cy = height * 0.42 + Math.cos(t * 0.0012) * height * 0.1;
      const r = Math.max(width, height) * (0.42 + breathe * 0.12);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `rgba(225,6,0,${0.16 + breathe * 0.06})`);
      grad.addColorStop(0.35, 'rgba(120,10,4,0.07)');
      grad.addColorStop(1, 'rgba(10,10,11,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // scan bands — horizontal interference moving downward
      const bandH = 3;
      const speed = (t * 0.6) % (bandH * 2);
      ctx.globalAlpha = 0.035;
      ctx.fillStyle = '#ede8e0';
      for (let y = -bandH * 2 + speed; y < height; y += bandH * 2) {
        ctx.fillRect(0, y, width, bandH);
      }
      ctx.globalAlpha = 1;

      // occasional bright red signal sweep
      const sweepY = ((t * 1.4) % (height + 200)) - 100;
      const sweepGrad = ctx.createLinearGradient(0, sweepY - 80, 0, sweepY + 80);
      sweepGrad.addColorStop(0, 'rgba(225,6,0,0)');
      sweepGrad.addColorStop(0.5, 'rgba(255,59,31,0.05)');
      sweepGrad.addColorStop(1, 'rgba(225,6,0,0)');
      ctx.fillStyle = sweepGrad;
      ctx.fillRect(0, sweepY - 80, width, 160);

      // cursor heat point
      if (mouse.x > 0) {
        const hg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
        hg.addColorStop(0, 'rgba(255,59,31,0.10)');
        hg.addColorStop(1, 'rgba(255,59,31,0)');
        ctx.fillStyle = hg;
        ctx.fillRect(mouse.x - 180, mouse.y - 180, 360, 360);
      }

      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
    };
    const onLeave = () => {
      mouse.tx = -9999;
      mouse.ty = -9999;
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" style={{ background: '#0a0a0b' }} />;
}
