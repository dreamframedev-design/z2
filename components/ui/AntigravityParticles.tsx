'use client';

import React, { useRef, useEffect } from 'react';
import { createNoise3D } from 'simplex-noise';

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
}

export default function AntigravityParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const PRIMARY_COLOR = '#818cf8';
    const ACCENT_COLOR = '#fbbf24';
    const SPACING = 35;
    const MOUSE_RADIUS = 200;
    const MOUSE_FORCE = 0.8;
    const FRICTION = 0.9;
    const SPRING_FORCE = 0.005;
    const NOISE_SCALE = 0.001;
    const NOISE_STRENGTH = 0.5;
    const NOISE_SPEED = 0.0002;
    const VISIBILITY_RADIUS = 400;
    const BASE_SIZE = 1.5;
    const VELOCITY_SIZE_MULT = 0.3;
    const BINARY_GAP = 2;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let particles: Particle[] = [];
    let time = 0;
    let animationFrameId: number;

    const noise3D = createNoise3D();
    const targetMouse = { x: -1000, y: -1000 };
    const currentMouse = { x: -1000, y: -1000 };
    const MOUSE_LERP = 0.15;

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      particles = [];
      const cols = Math.ceil(width / SPACING) + 2;
      const rows = Math.ceil(height / SPACING) + 2;

      for (let i = -1; i < cols; i++) {
        for (let j = -1; j < rows; j++) {
          const originX = i * SPACING;
          const originY = j * SPACING;
          particles.push({
            x: originX,
            y: originY,
            originX,
            originY,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    const update = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);
      currentMouse.x = lerp(currentMouse.x, targetMouse.x, MOUSE_LERP);
      currentMouse.y = lerp(currentMouse.y, targetMouse.y, MOUSE_LERP);

      particles.forEach((p) => {
        const n1 = noise3D(p.x * NOISE_SCALE, p.y * NOISE_SCALE, time * NOISE_SPEED);
        const n2 = noise3D(
          p.x * NOISE_SCALE,
          (p.y + 10) * NOISE_SCALE,
          time * NOISE_SPEED
        );
        const angle = n1 * Math.PI * 2;
        const curlStrength = (n2 - n1) * NOISE_STRENGTH;
        p.vx += Math.cos(angle) * curlStrength;
        p.vy += Math.sin(angle) * curlStrength;

        const dx = currentMouse.x - p.x;
        const dy = currentMouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const norm = 1 - dist / MOUSE_RADIUS;
          const force = Math.pow(norm, 2) * MOUSE_FORCE;
          const angleToMouse = Math.atan2(dy, dx);
          p.vx -= Math.cos(angleToMouse) * force;
          p.vy -= Math.sin(angleToMouse) * force;
        }

        p.vx += (p.originX - p.x) * SPRING_FORCE;
        p.vy += (p.originY - p.y) * SPRING_FORCE;
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;

        const mouseDist = Math.sqrt(
          Math.pow(currentMouse.x - p.x, 2) + Math.pow(currentMouse.y - p.y, 2)
        );
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);

        let alpha = 0;
        if (mouseDist < VISIBILITY_RADIUS) {
          alpha = Math.pow(1 - mouseDist / VISIBILITY_RADIUS, 2.5);
        } else {
          const noiseAlpha =
            (noise3D(p.x * 0.01, p.y * 0.01, time * 0.0005) + 1) * 0.5;
          alpha = 0.06 * noiseAlpha;
        }

        const size = BASE_SIZE + speed * VELOCITY_SIZE_MULT;
        if (alpha > 0.01 && size > 0.3) {
          const useAccent = speed > 1.2;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = useAccent ? ACCENT_COLOR : PRIMARY_COLOR;
          ctx.translate(p.x, p.y);
          ctx.rotate(Math.atan2(p.vy, p.vx));
          const gap = BINARY_GAP + speed * 0.2;
          ctx.beginPath();
          ctx.arc(-gap, 0, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(gap, 0, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(update);
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
      targetMouse.x = x;
      targetMouse.y = y;
    };

    const onEnd = () => {
      targetMouse.x = -1000;
      targetMouse.y = -1000;
    };

    window.addEventListener('resize', init);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);

    init();
    update();

    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none -z-10"
      style={{ background: '#020617' }}
    />
  );
}
