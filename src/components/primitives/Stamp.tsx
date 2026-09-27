import type { ReactNode } from 'react';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll';
import styles from './Stamp.module.css';

export type StampVariant = 'hero' | 'card' | 'folder' | 'pending';

interface StampProps {
  children: ReactNode;
  variant: StampVariant;
  /** Rotation in degrees. */
  rot: number;
  /** Thump on reveal after this many ms. Omit to render static (e.g. the folder stamp). */
  revealDelay?: number;
  className?: string;
}

/** A red rubber stamp. Large variants carry the double border. */
export function Stamp({ children, variant, rot, revealDelay, className }: StampProps) {
  const inner = (
    <span className={`${styles.stamp} ${styles[variant]}`} style={{ '--rot': `${rot}deg` }}>
      {children}
    </span>
  );
  if (revealDelay === undefined) {
    return <span className={`${styles.wrap} ${className ?? ''}`}>{inner}</span>;
  }
  return (
    <RevealStamp delay={revealDelay} className={className}>
      {inner}
    </RevealStamp>
  );
}

function RevealStamp({
  delay,
  className,
  children,
}: {
  delay: number;
  className?: string;
  children: ReactNode;
}) {
  const reveal = useRevealOnScroll<HTMLSpanElement>('stamp', delay);
  return (
    <span {...reveal} className={`${styles.wrap} ${className ?? ''}`}>
      {children}
    </span>
  );
}
