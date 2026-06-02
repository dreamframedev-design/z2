'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

/**
 * A CTA that leans toward the cursor when the pointer enters its approach
 * radius, then springs home. Renders as <a> or <button>. Inert (and zero
 * overhead) when `magnetic` is false (touch / reduced-motion).
 */
interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  magnetic?: boolean;
  /** px beyond the element edge where the pull begins */
  radius?: number;
  /** 0..1 fraction of the offset the button travels */
  strength?: number;
  /** px cap on how far the button may travel on each axis (prevents neighbours overlapping) */
  maxOffset?: number;
  ariaLabel?: string;
  /** Optional hero CTA surface treatment. Unset preserves the plain primitive. */
  variant?: 'primary' | 'secondary';
}

export default function MagneticButton({
  children,
  className = '',
  href,
  onClick,
  type = 'button',
  magnetic = true,
  radius = 80,
  strength = 0.32,
  maxOffset = 10,
  ariaLabel,
  variant,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.6 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.6 });
  const interactive = magnetic && !reduceMotion;

  useEffect(() => {
    if (!interactive) {
      mx.set(0);
      my.set(0);
      return;
    }
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const reach = Math.max(r.width, r.height) / 2 + radius;
      const clamp = (v: number) => Math.max(-maxOffset, Math.min(maxOffset, v));
      if (Math.hypot(dx, dy) < reach) {
        mx.set(clamp(dx * strength));
        my.set(clamp(dy * strength));
      } else {
        mx.set(0);
        my.set(0);
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [interactive, mx, my, radius, strength, maxOffset]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !variant || !interactive) return;

    let frame: number | null = null;
    let pointerX = 0;
    let pointerY = 0;

    const paintSpotlight = () => {
      const rect = el.getBoundingClientRect();
      const xPercent = ((pointerX - rect.left) / rect.width) * 100;
      const yPercent = ((pointerY - rect.top) / rect.height) * 100;
      el.style.setProperty('--cta-mx', `${Math.max(0, Math.min(100, xPercent))}%`);
      el.style.setProperty('--cta-my', `${Math.max(0, Math.min(100, yPercent))}%`);
      frame = null;
    };
    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame === null) frame = window.requestAnimationFrame(paintSpotlight);
    };
    const resetSpotlight = () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
      el.style.setProperty('--cta-mx', '50%');
      el.style.setProperty('--cta-my', '50%');
    };

    el.addEventListener('pointermove', onPointerMove, { passive: true });
    el.addEventListener('pointerleave', resetSpotlight);
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', resetSpotlight);
    };
  }, [interactive, variant]);

  const common = {
    ref: ref as never,
    className: variant ? `${className} z2-cta z2-cta--${variant}` : className,
    style: { x, y },
    onClick,
    'aria-label': ariaLabel,
    'data-cta-interactive': variant && interactive ? '' : undefined,
  };
  const content = variant ? (
    <>
      <span className="z2-cta__surface" aria-hidden="true" />
      <span className="z2-cta__content">{children}</span>
    </>
  ) : (
    children
  );

  if (href) {
    return (
      <motion.a href={href} {...common}>
        {content}
      </motion.a>
    );
  }
  return (
    <motion.button type={type} {...common}>
      {content}
    </motion.button>
  );
}
