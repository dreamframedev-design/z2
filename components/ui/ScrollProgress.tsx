'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/** A thin signal-red rail at the very top, bound to page scroll progress. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.4,
  });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, var(--blood), var(--ember))',
        boxShadow: '0 0 12px rgba(255,34,64,0.6)',
      }}
    />
  );
}
