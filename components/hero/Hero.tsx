'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import dynamic from 'next/dynamic';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import LogoMark from '@/components/hero/LogoMark';
import MagneticButton from '@/components/hero/MagneticButton';
import { useTerminalStore } from '@/lib/store/terminal-store';
import { Z2AudioEngine } from '@/lib/audio/Z2AudioEngine';

/* --------------------------------------------------------------- config */

// The WebGL glass/photon showpiece is built + wired but ships behind this flag
// so the production build is guaranteed clean & 60fps everywhere. Flip to true
// (on a capable desktop) to enable the R3F flourish; it falls back to the CSS
// mark automatically on failure / mobile / reduced-motion.
const ENABLE_WEBGL_HERO = false;

const HeroCanvas = dynamic(() => import('@/components/hero/HeroCanvas'), {
  ssr: false,
});

const EASE = [0.16, 1, 0.3, 1] as const;
const ACT0 = 0.6; // forge ignition length (s) before the mark materialises
const LOCK = ACT0 + 1.25; // when the mark locks ≈ 1.85s

const BOOT_LINES = [
  'Z2 // signal acquired',
  'guild: two operators online',
  'forge: online',
  '> we build worlds_',
];

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

/* ----------------------------------------------------------- boot readout */

function BootReadout({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute left-6 top-28 z-20 select-none sm:left-12 sm:top-32"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: reduce ? 0.6 : 2.3, duration: 0.9, ease: 'easeInOut' }}
    >
      <div className="space-y-1.5">
        {BOOT_LINES.map((line, i) => {
          const delay = 0.15 + i * 0.34;
          return (
            <div key={line} className="leading-none">
              <span
                className="z2-typeline label-mono text-[9px] text-[var(--ash-dim)] sm:text-[10px]"
                style={
                  {
                    '--tw': `${line.length}ch`,
                    '--steps': line.length,
                    '--dur': `${Math.max(0.28, line.length * 0.045)}s`,
                    '--delay': `${delay}s`,
                  } as CSSProperties
                }
              >
                {line}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- ember */

function ForgeEmber({ reduce }: { reduce: boolean }) {
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: ACT0 + 0.2, ease: 'easeOut', times: [0, 0.45, 1] }}
      style={{
        borderRadius: '50%',
        background:
          'radial-gradient(circle, #fff 0%, var(--ember) 30%, var(--blood) 55%, transparent 72%)',
        boxShadow: '0 0 40px 12px rgba(255,90,31,0.7), 0 0 90px 30px rgba(255,34,64,0.4)',
      }}
    />
  );
}

/* --------------------------------------------------------------- sparks */

function Embers({ reduce }: { reduce: boolean }) {
  // a few drifting embers — purely ambient, off for reduced-motion
  const sparks = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: 8 + ((i * 53) % 84),
        delay: (i % 7) * 0.9,
        dur: 7 + (i % 5) * 1.6,
        size: 1.5 + (i % 3),
        max: 0.18 + (i % 4) * 0.08,
        ember: i % 3 === 0,
      })),
    []
  );
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {sparks.map((s) => (
        <span
          key={s.id}
          data-z2-anim
          className="absolute bottom-[18%] rounded-full"
          style={
            {
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              background: s.ember ? 'var(--ember)' : 'var(--blood)',
              boxShadow: `0 0 ${4 + s.size * 2}px ${s.ember ? 'var(--ember)' : 'var(--blood)'}`,
              '--spark-max': s.max,
              animation: `z2-spark ${s.dur}s ease-in-out ${s.delay + LOCK}s infinite`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- wordmark */

function WorldsWord({ interactive }: { interactive: boolean }) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const sheenRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!interactive) return;
    const onMove = (e: PointerEvent) => {
      const el = wrapRef.current;
      const sh = sheenRef.current;
      if (!el || !sh) return;
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      const mx = ((e.clientX - r.left) / r.width) * 100;
      sh.style.setProperty('--mx', `${Math.max(-15, Math.min(115, mx))}%`);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [interactive]);

  return (
    <span
      ref={wrapRef}
      className="relative inline-block font-serif-italic"
      style={{ textShadow: '0 0 36px rgba(255,90,31,0.4)' }}
    >
      <span className="z2-worlds">worlds</span>
      {interactive && (
        <span ref={sheenRef} aria-hidden className="z2-worlds-sheen">
          worlds
        </span>
      )}
    </span>
  );
}

/* ----------------------------------------------------------------- Hero */

export default function Hero({ onFeature }: { onFeature: () => void }) {
  const prefersReduced = useReducedMotion();
  const reduce = !!prefersReduced;

  const triggerAnomaly = useTerminalStore((s) => s.triggerAnomaly);

  const heroRef = useRef<HTMLElement | null>(null);
  const [touch, setTouch] = useState(false);
  const [webgl, setWebgl] = useState(false);
  const [glitch, setGlitch] = useState(false);

  // capability detection (post-mount → no SSR mismatch)
  useEffect(() => {
    const isTouch =
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: none), (pointer: coarse)').matches;
    setTouch(isTouch);

    if (ENABLE_WEBGL_HERO && !reduce && !isTouch && window.innerWidth >= 768) {
      try {
        const c = document.createElement('canvas');
        const gl = c.getContext('webgl2') || c.getContext('webgl');
        if (gl) setWebgl(true);
      } catch {
        setWebgl(false);
      }
    }
  }, [reduce]);

  const interactive = !reduce && !touch;

  /* ---- cursor parallax (logo tilt) + audio pan ---- */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 120, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 120, damping: 18, mass: 0.6 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [8, -8]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [-6, 6]);
  const tiltX = useTransform(sx, [-0.5, 0.5], [-16, 16]);

  useEffect(() => {
    if (!interactive) return;
    const onMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      px.set(nx);
      py.set(ny);
      if (useTerminalStore.getState().audioEnabled) {
        Z2AudioEngine.getInstance().setCursorPan(nx * 2);
      }
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [interactive, px, py]);

  /* ---- scroll hand-off (parallax the hero out) ---- */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const handoffY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -90]);
  const handoffScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.92]);
  const markY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -160]);

  /* ---- audio impact on logo lock ---- */
  const onLock = useCallback(() => {
    if (useTerminalStore.getState().audioEnabled) {
      Z2AudioEngine.getInstance().playUiSound('unlock');
    }
  }, []);

  /* ---- easter egg: reveal the anomaly ---- */
  const fireAnomaly = useCallback(() => {
    triggerAnomaly();
    if (useTerminalStore.getState().audioEnabled) {
      Z2AudioEngine.getInstance().playUiSound('anomaly');
    }
    if (!reduce) {
      setGlitch(true);
      window.setTimeout(() => setGlitch(false), 1300);
    }
  }, [triggerAnomaly, reduce]);

  // Konami code
  useEffect(() => {
    let idx = 0;
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === KONAMI[idx]) {
        idx += 1;
        if (idx === KONAMI.length) {
          idx = 0;
          fireAnomaly();
        }
      } else {
        idx = key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fireAnomaly]);

  // logo triple-click
  const clicks = useRef<number[]>([]);
  const onMarkClick = useCallback(() => {
    const now = performance.now();
    clicks.current = clicks.current.filter((t) => now - t < 600);
    clicks.current.push(now);
    if (clicks.current.length >= 3) {
      clicks.current = [];
      fireAnomaly();
    }
  }, [fireAnomaly]);

  /* ---- staggered reveal helper ---- */
  const reveal = (base: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    animate: reduce ? { opacity: 1 } : { opacity: 1, y: 0 },
    transition: {
      duration: reduce ? 0.6 : 0.9,
      delay: reduce ? 0.1 : base,
      ease: EASE,
    },
  });

  return (
    <header
      id="top"
      ref={heroRef}
      className="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col items-center justify-center overflow-hidden px-6 py-28 text-center sm:px-12"
    >
      <BootReadout reduce={reduce} />
      <Embers reduce={reduce} />

      <motion.div
        className={`relative flex flex-col items-center ${glitch ? 'z2-glitch' : ''}`}
        style={{ y: handoffY, scale: handoffScale }}
      >
        {/* ---- the mark ---- */}
        <div
          className="relative flex items-center justify-center"
          style={interactive ? { perspective: 900 } : undefined}
        >
          <ForgeEmber reduce={reduce} />

          <motion.div
            onClick={onMarkClick}
            className="cursor-pointer"
            style={
              interactive
                ? {
                    y: markY,
                    rotateX,
                    rotateY,
                    x: tiltX,
                    transformStyle: 'preserve-3d',
                  }
                : { y: markY }
            }
          >
            {webgl ? (
              <HeroCanvas delay={ACT0} onLock={onLock} fallback={<LogoMark delay={ACT0} reduce={reduce} lite={touch} onLock={onLock} />} />
            ) : (
              <LogoMark delay={ACT0} reduce={reduce} lite={touch} onLock={onLock} />
            )}
          </motion.div>
        </div>

        {/* ---- kicker ---- */}
        <motion.p
          className="label-mono mt-12 text-[11px] text-[var(--ash)]"
          {...reveal(LOCK + 0.05)}
        >
          Independent creative guild — Est. 2025
        </motion.p>

        {/* ---- headline ---- */}
        <motion.h1
          className="display-hero mt-5 text-balance text-[clamp(3.2rem,11vw,9.5rem)] font-semibold text-[var(--bone)]"
          {...reveal(LOCK + 0.18)}
        >
          We build <WorldsWord interactive={interactive} />.
        </motion.h1>

        {/* ---- subhead ---- */}
        <motion.p
          className="mt-8 max-w-xl text-balance text-lg leading-relaxed text-[var(--ash)] sm:text-xl"
          {...reveal(LOCK + 0.32)}
        >
          Games, sound, film, and instruments for altered perception — by a small guild, for players
          who want something genuinely new.
        </motion.p>

        {/* ---- CTAs ---- */}
        <motion.div
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
          {...reveal(LOCK + 0.46)}
        >
          <MagneticButton
            href="#work"
            magnetic={interactive}
            className="group relative overflow-hidden bg-[var(--blood)] px-8 py-4 label-mono text-[11px] text-[var(--bone)] transition-colors hover:bg-[var(--ember)]"
          >
            <span className="relative z-10">Enter the work</span>
          </MagneticButton>

          <MagneticButton
            magnetic={interactive}
            onClick={onFeature}
            strength={0.24}
            className="group flex items-center gap-2 border hairline px-8 py-4 label-mono text-[11px] text-[var(--ash)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--bone)]"
          >
            Play Bloom
            <span className="text-[var(--ember)] transition-transform group-hover:translate-x-1">↗</span>
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* ---- scroll cue ---- */}
      <motion.a
        href="#capabilities"
        aria-label="Scroll to explore"
        className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: reduce ? 0.2 : LOCK + 0.7, ease: EASE }}
      >
        <span className="label-mono text-[9px] text-[var(--ash-dim)]">scroll</span>
        <span className="relative block h-9 w-px overflow-hidden bg-[var(--line-strong)]">
          <span className="z2-cue absolute inset-x-0 top-0 block h-3 bg-[var(--blood)]" />
        </span>
      </motion.a>
    </header>
  );
}
