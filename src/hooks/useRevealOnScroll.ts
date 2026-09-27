import { createContext, useContext, useEffect, useRef } from 'react';
import { observeReveal, type RevealKind } from '../lib/reveal';
import { useReducedMotion } from './useReducedMotion';

/** False while the intro covers the page; reveals wait until it lifts. */
export const RevealContext = createContext(true);

/**
 * Drop / thump an element the first time 15% of it is visible (docs/app-flow.md §3).
 * Spread the result onto the element: `<div {...useRevealOnScroll('drop', 80)}>`.
 * Without JS or with reduced motion the element is simply visible.
 */
export function useRevealOnScroll<T extends HTMLElement = HTMLDivElement>(
  kind: RevealKind,
  delay = 0,
) {
  const ref = useRef<T>(null);
  const enabled = useContext(RevealContext);
  const reduced = useReducedMotion();
  const delayRef = useRef(delay);

  useEffect(() => {
    delayRef.current = delay;
  }, [delay]);

  useEffect(() => {
    const el = ref.current;
    if (!el || (!enabled && !reduced)) return;
    return observeReveal(el, kind, () => delayRef.current, !reduced);
  }, [enabled, reduced, kind]);

  return { ref, 'data-reveal': kind } as const;
}
