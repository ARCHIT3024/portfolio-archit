import { useEffect } from 'react';

let locks = 0;
let savedOverflow = '';
let savedPadding = '';

/** Lock page scroll while `active`. Reference-counted, so the intro and folder can both hold it. */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const { body, documentElement } = document;
    if (locks === 0) {
      const scrollbar = window.innerWidth - documentElement.clientWidth;
      savedOverflow = body.style.overflow;
      savedPadding = body.style.paddingRight;
      body.style.overflow = 'hidden';
      if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    }
    locks += 1;
    return () => {
      locks -= 1;
      if (locks === 0) {
        body.style.overflow = savedOverflow;
        body.style.paddingRight = savedPadding;
      }
    };
  }, [active]);
}
