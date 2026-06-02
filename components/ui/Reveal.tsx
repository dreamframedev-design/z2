'use client';

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';

type RevealVariant = 'lift' | 'capability-left' | 'capability-right';

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
  variant?: RevealVariant;
  /** start revealing this many px before fully in view */
  rootMargin?: string;
  id?: string;
}

export default function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className = '',
  variant = 'lift',
  rootMargin = '-12% 0px',
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { rootMargin, threshold: 0.05 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [rootMargin]);

  return createElement(
    Tag as ElementType,
    {
      ref,
      id,
      className: `reveal reveal--${variant} ${visible ? 'is-visible' : ''} ${className}`,
      style: {
        '--reveal-delay': `${delay}ms`,
        transitionDelay: `${delay}ms`,
      } as CSSProperties,
    },
    children
  );
}
