import { useSyncExternalStore } from 'react';
import { BREAKPOINTS } from '../config';

export type ViewportMode = 'board' | 'stacked' | 'mobile';

function subscribe(onChange: () => void) {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

const getWidth = () => window.innerWidth;
const getServerWidth = () => 1280;

/** Current viewport width; only re-renders when the width actually changes. */
export function useViewportWidth(): number {
  return useSyncExternalStore(subscribe, getWidth, getServerWidth);
}

export function modeFor(width: number): ViewportMode {
  if (width >= BREAKPOINTS.board) return 'board';
  if (width >= BREAKPOINTS.mobile) return 'stacked';
  return 'mobile';
}

/** Board / stacked / mobile mode (docs/architecture.md §5). */
export function useViewportMode(): ViewportMode {
  return modeFor(useViewportWidth());
}

/** True when the six nav links fit inline. */
export function useNavInline(): boolean {
  return useViewportWidth() >= BREAKPOINTS.navInline;
}
