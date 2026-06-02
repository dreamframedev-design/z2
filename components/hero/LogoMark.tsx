'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import PhotonField from '@/components/hero/PhotonField';

/**
 * Z2 LOGO MARK — the protagonist.
 *
 * The visible mark is the real /z2-logo.svg (crisp, no bundle bloat). Every
 * cinematic layer reuses that same file as a CSS silhouette mask (`.z2-mask`)
 * so all light is shaped by the logo itself:
 *   • a PhotonField etches rune/circuit pathways that carve through it,
 *   • it materialises with an upward clip-rise + scale settle + de-blur,
 *   • two chromatic echoes (blood / ember) converge into a crisp lock,
 *   • a specular band rakes across once, then a soft shine recurs in idle,
 *   • the .cls-1 diagonal "blade" traces in last.
 *
 * Fully presentational + reduced-motion aware. The parent owns cursor parallax.
 */

// The real vector slash from public/z2-logo.svg (the Z's diagonal).
const SLASH_D =
  'M293.89,114.32l-150.48,207.12-.1.14-43.59,60c-1.82,2.51-4.73,3.99-7.83,3.99h-39.11v-46.24c0-6.38,2.01-12.59,5.77-17.75l.1-.14L209.12,114.32h84.77Z';

const EASE = [0.16, 1, 0.3, 1] as const;

interface LogoMarkProps {
  /** seconds to wait before the mark begins materialising (Act 0 length) */
  delay?: number;
  reduce?: boolean;
  /** lighter photon field (mobile / touch) */
  lite?: boolean;
  /** fired the instant the mark locks — wire audio impact here */
  onLock?: () => void;
  className?: string;
}

export default function LogoMark({
  delay = 0.6,
  reduce = false,
  lite = false,
  onLock,
  className = '',
}: LogoMarkProps) {
  const [locked, setLocked] = useState(reduce);
  const lockFired = useRef(false);

  // Lock the mark a beat after it finishes materialising.
  useEffect(() => {
    if (lockFired.current) return;
    const at = reduce ? 0 : (delay + 1.25) * 1000;
    const id = window.setTimeout(() => {
      lockFired.current = true;
      setLocked(true);
      onLock?.();
    }, at);
    return () => window.clearTimeout(id);
  }, [delay, reduce, onLock]);

  // When reduced motion, everything starts in its final, calm state.
  const from = reduce
    ? { opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1, filter: 'blur(0px)' }
    : { opacity: 0, clipPath: 'inset(100% 0 0 0)', scale: 1.06, filter: 'blur(7px)' };
  const to = { opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1, filter: 'blur(0px)' };

  return (
    <div
      className={`relative aspect-[457.81/434.72] h-[clamp(168px,40vw,400px)] ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* ---- soft warm-orange backglow (the halo) ---- */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[155%] w-[155%] -translate-x-1/2 -translate-y-1/2"
        data-z2-anim
        initial={{ opacity: 0, scale: 0.95 }}
        animate={reduce ? { opacity: 0.5, scale: 1 } : { opacity: [0.42, 0.6], scale: [1, 1.05] }}
        transition={
          reduce
            ? { duration: 0.8 }
            : { duration: 5.5, delay: delay + 0.3, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }
        }
        style={{
          background:
            'radial-gradient(circle at 50% 52%, rgba(255,122,52,0.55), rgba(255,90,31,0.22) 40%, rgba(255,70,28,0.05) 62%, transparent 74%)',
          filter: 'blur(18px)',
        }}
      />

      {/* ---- chromatic echo: ember (settles from the right) ---- */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="z2-mask pointer-events-none absolute inset-0"
          style={{ background: 'var(--ember)', mixBlendMode: 'screen' }}
          initial={{ opacity: 0, x: 7 }}
          animate={{ opacity: [0, 0.5, 0], x: 0 }}
          transition={{ duration: 0.9, delay: delay + 0.35, ease: EASE }}
        />
      )}
      {/* ---- chromatic echo: blood (settles from the left) ---- */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="z2-mask pointer-events-none absolute inset-0"
          style={{ background: 'var(--blood)', mixBlendMode: 'screen' }}
          initial={{ opacity: 0, x: -7 }}
          animate={{ opacity: [0, 0.5, 0], x: 0 }}
          transition={{ duration: 0.9, delay: delay + 0.35, ease: EASE }}
        />
      )}

      {/* ---- the real mark ---- */}
      <motion.img
        src="/z2-logo.svg"
        alt="Z2"
        draggable={false}
        className="absolute inset-0 h-full w-full object-contain"
        style={{
          willChange: 'clip-path, transform, filter',
          animation: locked && !reduce ? 'z2-lock 0.5s steps(1,end) 1' : undefined,
        }}
        initial={from}
        animate={to}
        transition={{ duration: reduce ? 0.6 : 1.05, delay: reduce ? 0 : delay, ease: EASE }}
      />

      {/* ---- photon pathway network: etches + carves through the sigil ---- */}
      <PhotonField delay={delay} reduce={reduce} lite={lite} />

      {/* ---- specular sweep (raked across once, shaped to the mark) ---- */}
      {!reduce && (
        <div className="z2-mask pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-y-[-20%] left-0 w-[55%]"
            initial={{ x: '-160%', opacity: 0 }}
            animate={{ x: ['-160%', '320%'], opacity: [0, 0.95, 0.95, 0] }}
            transition={{ duration: 1.0, delay: delay + 0.5, ease: 'easeInOut' }}
            style={{
              background:
                'linear-gradient(105deg, transparent, rgba(255,255,255,0.12) 38%, rgba(255,180,150,0.85) 50%, rgba(255,255,255,0.12) 62%, transparent)',
              transform: 'skewX(-16deg)',
            }}
          />
        </div>
      )}

      {/* ---- idle shine: a soft specular band drifts across periodically ---- */}
      {!reduce && locked && (
        <div className="z2-mask pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-y-[-20%] left-0 w-[48%]"
            data-z2-anim
            style={{
              background:
                'linear-gradient(105deg, transparent, rgba(255,255,255,0.10) 40%, rgba(255,220,200,0.55) 50%, rgba(255,255,255,0.10) 60%, transparent)',
              transform: 'skewX(-16deg)',
              animation: 'z2-shine 8s ease-in-out 2s infinite',
            }}
          />
        </div>
      )}

      {/* ---- .cls-1 blade: traces in last, then hands off to the real slash ---- */}
      {!reduce && (
        <svg
          aria-hidden
          viewBox="0 0 457.81 434.72"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        >
          <defs>
            <linearGradient id="z2-blade" x1="293" y1="114" x2="63" y2="389" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ff5a1f" />
              <stop offset="0.55" stopColor="#ff2240" />
              <stop offset="1" stopColor="#ffd9c2" />
            </linearGradient>
          </defs>
          <motion.path
            d={SLASH_D}
            fill="none"
            stroke="url(#z2-blade)"
            strokeWidth={3}
            strokeLinejoin="round"
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,90,31,0.85))' }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{
              pathLength: { duration: 0.7, delay: delay + 0.95, ease: EASE },
              opacity: { duration: 0.95, delay: delay + 0.95, ease: 'easeOut', times: [0, 0.35, 1] },
            }}
          />
        </svg>
      )}
    </div>
  );
}
