import { useEffect, useRef } from 'react';

export interface Point {
  x: number;
  y: number;
}

/**
 * Track the pointer in a ref (never React state) and call `onFrame` at most once per frame.
 * `onFrame` receives the latest position and whether it came from a real pointer event.
 */
export function usePointerPosition(active: boolean, onFrame: (p: Point) => void): void {
  const cb = useRef(onFrame);
  useEffect(() => {
    cb.current = onFrame;
  }, [onFrame]);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const pos: Point = { x: window.innerWidth / 2, y: window.innerHeight * 0.38 };
    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          cb.current(pos);
        });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onMove);
    };
  }, [active]);
}
