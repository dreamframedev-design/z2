'use client';

import { useEffect, useRef } from 'react';

/**
 * Z2 AMBIENCE
 * Deep red glow + vignette, both rendered into one canvas and dithered
 * with ADDITIVE noise so dark gradients never show banding ("ovals").
 * The vignette is baked in here (CSS radial gradients band badly).
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

    // --- pre-baked grayscale dither tile ---
    const noise = document.createElement('canvas');
    const NSIZE = 200;
    noise.width = NSIZE;
    noise.height = NSIZE;
    const nctx = noise.getContext('2d');
    let pattern: CanvasPattern | null = null;
    if (nctx) {
      const img = nctx.createImageData(NSIZE, NSIZE);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      nctx.putImageData(img, 0, 0);
      pattern = ctx.createPattern(noise, 'repeat');
    }

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

    const STOPS = 28;

    const draw = () => {
      t += 0.0015;
      mouse.x += (mouse.tx - mouse.x) * 0.03;
      mouse.y += (mouse.ty - mouse.y) * 0.03;

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#0a0a0b';
      ctx.fillRect(0, 0, w, h);

      const breathe = (Math.sin(t * 2) + 1) * 0.5;
      const cx = w * (0.5 + Math.sin(t) * 0.08) + (mouse.x - 0.5) * w * 0.05;
      const cy = h * (0.46 + Math.cos(t * 0.8) * 0.06) + (mouse.y - 0.5) * h * 0.05;
      const r = Math.max(w, h) * (0.85 + breathe * 0.1);
      const peak = 0.085 + breathe * 0.03;

      // red glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      for (let i = 0; i <= STOPS; i++) {
        const p = i / STOPS;
        const a = peak * Math.pow(1 - p, 2.4);
        const rC = Math.round(190 + 30 * (1 - p));
        const gC = Math.round(18 + 8 * (1 - p));
        const bC = Math.round(40 + 12 * (1 - p));
        g.addColorStop(p, `rgba(${rC}, ${gC}, ${bC}, ${a})`);
      }
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // vignette (baked in, eased) — darken toward the edges
      const vx = w * 0.5;
      const vy = h * 0.5;
      const vr = Math.hypot(w, h) * 0.62;
      const vg = ctx.createRadialGradient(vx, vy, vr * 0.35, vx, vy, vr);
      for (let i = 0; i <= STOPS; i++) {
        const p = i / STOPS;
        const a = 0.6 * Math.pow(p, 1.8);
        vg.addColorStop(p, `rgba(5, 5, 6, ${a})`);
      }
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      // ADDITIVE dither — adds 0..~7 brightness per pixel, kills banding in darks
      if (pattern) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.03;
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }

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

  return <canvas ref={ref} className="fixed inset-0 -z-10" style={{ background: '#0a0a0b' }} />;
}
