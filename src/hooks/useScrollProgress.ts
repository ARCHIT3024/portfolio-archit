import { useEffect, type RefObject } from 'react';

/**
 * Scroll-linked progress for the red string (docs/app-flow.md §3):
 * `t = clamp((0.8·vh − top) / (0.85·height), 0, 1)`. Calls `apply(t)` inside rAF; never
 * touches React state. Under reduced motion `t` is always 1.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  apply: (t: number) => void,
  { active, reduced }: { active: boolean; reduced: boolean },
): void {
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      if (reduced) {
        apply(1);
        return;
      }
      const r = el.getBoundingClientRect();
      const t = (window.innerHeight * 0.8 - r.top) / (r.height * 0.85);
      apply(Math.max(0, Math.min(1, t)));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [ref, apply, active, reduced]);
}
