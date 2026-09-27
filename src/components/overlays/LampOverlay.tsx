import { useCallback, useEffect, useRef } from 'react';
import { usePointerPosition, type Point } from '../../hooks/usePointerPosition';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { DUR } from '../../lib/motion';
import styles from './LampOverlay.module.css';

/**
 * Lights off: a warm circle of light that follows the pointer (fixed on touch).
 * Mounted only while the lights are off. `flicker` is false when restoring a saved preference.
 */
export function LampOverlay({ flicker }: { flicker: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

  const place = useCallback((p: Point) => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--lamp-x', `${p.x}px`);
    el.style.setProperty('--lamp-y', `${p.y}px`);
  }, []);

  usePointerPosition(!coarse, place);

  useEffect(() => {
    const el = ref.current;
    if (!el || !flicker || reduced) return;
    const a = el.animate(
      [
        { opacity: 0 },
        { opacity: 0.7, offset: 0.2 },
        { opacity: 0.25, offset: 0.35 },
        { opacity: 1 },
      ],
      { duration: DUR.lightsOff, easing: 'linear' },
    );
    return () => a.cancel();
    // Flicker once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref} className={styles.lamp} aria-hidden="true" />;
}
