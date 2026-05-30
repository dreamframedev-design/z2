'use client';

import { useEffect, useRef } from 'react';
import type { CellSignal } from '@/lib/cells-data';

/* Bloom's canonical Design Bible palette */
const BLOOM = {
  bgDeep: '#1a0a2e',
  bgMid: '#2d1b4e',
  vine: '#3d2b5a',
  spore: '#eeff00',
  bio: '#39ff85',
  teal: '#00e5cc',
  pink: '#ff2e6c',
  rust: '#ff6b35',
  moss: '#4c7c59',
  text: '#ece3ff',
};

const UNITS = [
  { name: 'Runner', dot: BLOOM.bio, note: 'Pack aura. Death: speed zone.' },
  { name: 'Tank', dot: BLOOM.teal, note: 'Soaks fire. Death: LOS shield.' },
  { name: 'Scientist', dot: BLOOM.spore, note: 'Death: heal zone.' },
  { name: 'Bomber', dot: BLOOM.rust, note: 'Death: explosion + wall break.' },
  { name: 'Driller', dot: BLOOM.moss, note: 'Breaks walls. New paths.' },
  { name: 'Hacker', dot: BLOOM.teal, note: 'Disables turrets.' },
  { name: 'Chemist', dot: BLOOM.bio, note: 'Poison fields.' },
  { name: 'Illusionist', dot: BLOOM.pink, note: 'Decoys draw fire.' },
  { name: 'Watcher', dot: BLOOM.spore, note: 'Reveals hidden traps.' },
  { name: 'Zealot', dot: BLOOM.rust, note: 'Melee. Death effect.' },
];

const TURRETS = ['Standard', 'Sniper', 'Splasher', 'Slow Field', 'Mine', 'Teleturret'];

const LOOP = [
  ['DEPLOY', 'Send waves of prisoners'],
  ['PATHFIND', 'Past beams, mines, traps'],
  ['ESCAPE', 'Survivors earn spores'],
  ['DESCEND', 'Relocate to next depth'],
  ['EXCHANGE', 'Recruit · revive · strengthen'],
];

function SporeField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const cols = [BLOOM.spore, BLOOM.bio, BLOOM.teal, BLOOM.pink];
    type S = { x: number; y: number; r: number; sp: number; c: string; w: number };
    let spores: S[] = [];
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      spores = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 0.6 + Math.random() * 2,
        sp: 0.2 + Math.random() * 0.7,
        c: cols[(Math.random() * cols.length) | 0],
        w: Math.random() * Math.PI * 2,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      spores.forEach((s) => {
        s.y -= s.sp;
        s.w += 0.02;
        s.x += Math.sin(s.w) * 0.3;
        if (s.y < -5) {
          s.y = canvas.height + 5;
          s.x = Math.random() * canvas.width;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.c;
        ctx.shadowBlur = 12;
        ctx.shadowColor = s.c;
        ctx.globalAlpha = 0.8;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

export default function BloomCell({ signal }: { signal: CellSignal }) {
  return (
    <div>
      <p className="label-mono mb-6 text-[11px]" style={{ color: signal.accent }}>
        {signal.index} · {signal.kicker} · v0.2.0
      </p>

      {/* HERO — blooms into its own bioluminescent world */}
      <div
        className="relative mb-12 overflow-hidden rounded-sm border p-10 sm:p-16"
        style={{
          borderColor: BLOOM.vine,
          background: `radial-gradient(ellipse at 50% 120%, ${BLOOM.bgMid} 0%, ${BLOOM.bgDeep} 70%)`,
        }}
      >
        <SporeField />
        <div className="relative text-center">
          <h1
            className="display-hero text-7xl sm:text-9xl flicker"
            style={{ color: BLOOM.spore, textShadow: `0 0 40px ${BLOOM.spore}` }}
          >
            BLOOM
          </h1>
          <p className="font-serif-italic mt-3 text-2xl" style={{ color: BLOOM.teal }}>
            a spore&apos;s journey
          </p>
          <p className="label-mono mt-6 text-[10px]" style={{ color: BLOOM.bio }}>
            GUIDE YOUR PRISONERS THROUGH THE MYCELIUM
          </p>
        </div>
      </div>

      <p className="font-serif-italic max-w-2xl text-xl leading-relaxed text-[var(--ash)]">
        A <span style={{ color: BLOOM.pink }}>reverse</span> tower-defense roguelite. You don&apos;t
        build the towers — you shepherd a colony of prisoners <em>past</em> them, through a living
        mycelium network. Trade lives for spores, death for ground buffs, descent for power.
      </p>

      {/* THE LOOP */}
      <p className="label-mono mt-14 mb-6 text-[10px] text-[var(--ash)]">THE LOOP</p>
      <div className="grid gap-px border hairline sm:grid-cols-5">
        {LOOP.map(([k, v], i) => (
          <div key={k} className="bg-[#0a0a0b] p-5">
            <span className="label-mono text-[9px]" style={{ color: BLOOM.spore }}>
              0{i + 1}
            </span>
            <p className="display-hero mt-2 text-lg text-[var(--bone)]">{k}</p>
            <p className="font-serif-italic mt-1 text-xs text-[var(--ash)]">{v}</p>
          </div>
        ))}
      </div>

      {/* UNITS */}
      <p className="label-mono mt-14 mb-6 text-[10px] text-[var(--ash)]">
        THE COLONY · 10 CLASSES
      </p>
      <div className="grid gap-px border hairline sm:grid-cols-2 lg:grid-cols-3">
        {UNITS.map((u) => (
          <div key={u.name} className="flex items-start gap-3 bg-[#0a0a0b] p-4">
            <span
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: u.dot, boxShadow: `0 0 8px ${u.dot}` }}
            />
            <div>
              <p className="text-sm text-[var(--bone)]">{u.name}</p>
              <p className="font-serif-italic text-xs text-[var(--ash)]">{u.note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* TURRETS + PALETTE */}
      <div className="mt-14 grid gap-10 lg:grid-cols-2">
        <div>
          <p className="label-mono mb-6 text-[10px] text-[var(--ash)]">THE THREAT · 6 TURRETS</p>
          <div className="flex flex-wrap gap-2">
            {TURRETS.map((t) => (
              <span
                key={t}
                className="border px-3 py-2 label-mono text-[10px]"
                style={{ borderColor: BLOOM.vine, color: BLOOM.pink }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="label-mono mb-6 text-[10px] text-[var(--ash)]">DESIGN BIBLE</p>
          <div className="flex flex-wrap gap-3">
            {[
              ['Spore', BLOOM.spore],
              ['Bio', BLOOM.bio],
              ['Teal', BLOOM.teal],
              ['Infected', BLOOM.pink],
              ['Rust', BLOOM.rust],
              ['Moss', BLOOM.moss],
            ].map(([name, c]) => (
              <div key={name} className="text-center">
                <div
                  className="h-10 w-10 rounded-full"
                  style={{ background: c, boxShadow: `0 0 14px ${c}` }}
                />
                <p className="label-mono mt-2 text-[8px] text-[var(--ash-dim)]">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TECH */}
      <div className="mt-14 flex flex-wrap gap-2 border-t hairline pt-8">
        {['UNITY 6 · 6000.3.9f1', 'URP · GAMEPLAY-LINKED BLOOM', 'PROCEDURAL AUDIO', 'AI NAVIGATION', 'PROCEDURAL ROOMS'].map(
          (t) => (
            <span
              key={t}
              className="label-mono border hairline px-3 py-2 text-[9px] text-[var(--ash)]"
            >
              {t}
            </span>
          )
        )}
      </div>

      <p className="font-serif-italic mt-8 text-sm text-[var(--ash-dim)]">
        Status: vertical slice. 10 classes and 6 turret types fully coded. Art and music layers in
        progress.
      </p>
    </div>
  );
}
