'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A hairline that "draws" across as it scrolls into view — a signal locking.
 * Reduced-motion shows a static line. Purely decorative.
 */
export default function SignalDivider() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [seen, setSeen] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setSeen(true);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.8 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const show = seen || reduce;

  return (
    <div ref={ref} aria-hidden className="mx-auto max-w-[1400px] px-6 sm:px-12">
      <div className="relative h-px w-full bg-[var(--line)]">
        <div
          className="absolute inset-0 origin-left bg-gradient-to-r from-transparent via-[var(--blood)] to-transparent"
          style={{
            transform: show ? 'scaleX(1)' : 'scaleX(0)',
            transformOrigin: 'left',
            animation: show && !reduce ? 'z2-signal 1.1s cubic-bezier(0.16,1,0.3,1) forwards' : undefined,
            boxShadow: '0 0 10px rgba(255,34,64,0.4)',
          }}
        />
      </div>
    </div>
  );
}
