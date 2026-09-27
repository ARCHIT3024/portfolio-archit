/**
 * Motion values for the Web Animations API (docs/design.md §6). The easings mirror the
 * `--ease-*` tokens in tokens.css — a unit test keeps the two in sync.
 */
export const EASE = {
  outSoft: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  drop: 'cubic-bezier(0.34, 1.36, 0.64, 1)',
  morph: 'cubic-bezier(0.65, 0, 0.25, 1)',
  cover: 'cubic-bezier(0.45, 0, 0.2, 1)',
  flap: 'cubic-bezier(0.5, 0, 0.2, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
  slide: 'cubic-bezier(0.5, 0, 0.75, 0)',
  thump: 'cubic-bezier(0.55, 0, 0.9, 0.4)',
} as const;

export const DUR = {
  drop: 560,
  thump: 300,
  boardStagger: 110,
  boardStampOffset: 420,
  lightsOff: 420,
  introFlicker: 450,
  introPause: 120,
  introPropsFade: 320,
  introMorph: 850,
  introSceneFade: 260,
  introShadow: 200,
  introCover: 820,
  introCoverDelay: 120,
  introSkipFade: 450,
  backdropIn: 220,
  backdropOut: 180,
  folderRise: 320,
  sheetRise: 340,
  flap: 520,
  flapDelay: 120,
  folderStampDesktop: 520,
  folderStampMobile: 260,
  folderClose: 200,
  switchCase: 260,
  switchStamp: 160,
  formSlide: 420,
  menuOpen: 220,
  menuClose: 160,
} as const;

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/** Paper drops onto the desk with a little overshoot. */
export function playDrop(el: Element, delay = 0): Animation {
  return el.animate(
    [
      { opacity: 0, transform: 'translateY(-44px) rotate(-5deg) scale(1.04)' },
      { opacity: 1, transform: 'none' },
    ],
    { duration: DUR.drop, delay, easing: EASE.drop, fill: 'backwards' },
  );
}

/** A rubber stamp comes down hard. */
export function playThump(el: Element, delay = 0): Animation {
  return el.animate(
    [
      { opacity: 0, transform: 'scale(2.4)' },
      { opacity: 1, transform: 'scale(.92)', offset: 0.7, easing: 'ease-out' },
      { opacity: 1, transform: 'scale(1)' },
    ],
    { duration: DUR.thump, delay, easing: EASE.thump, fill: 'backwards' },
  );
}

/** Fade an element in or out. */
export function fade(
  el: Element,
  from: number,
  to: number,
  duration: number,
  easing = 'ease-out',
  delay = 0,
): Animation {
  return el.animate([{ opacity: from }, { opacity: to }], {
    duration,
    easing,
    delay,
    fill: 'forwards',
  });
}

/** Resolve once an animation finishes or is cancelled. */
export function settled(anim: Animation): Promise<void> {
  return anim.finished.then(
    () => undefined,
    () => undefined,
  );
}
