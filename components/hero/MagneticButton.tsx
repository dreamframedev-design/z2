'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

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
  ariaLabel?: string;
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
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.6 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.6 });

  useEffect(() => {
    if (!magnetic) {
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
      if (Math.hypot(dx, dy) < reach) {
        mx.set(dx * strength);
        my.set(dy * strength);
      } else {
        mx.set(0);
        my.set(0);
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [magnetic, mx, my, radius, strength]);

  const common = {
    ref: ref as never,
    className,
    style: { x, y },
    onClick,
    'aria-label': ariaLabel,
  };

  if (href) {
    return (
      <motion.a href={href} {...common}>
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button type={type} {...common}>
      {children}
    </motion.button>
  );
}
