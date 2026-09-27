import { playDrop, playThump } from './motion';

export type RevealKind = 'drop' | 'stamp';

interface Registration {
  kind: RevealKind;
  delay: () => number;
}

const registry = new WeakMap<Element, Registration>();
let observer: IntersectionObserver | null = null;

function markRevealed(el: Element) {
  el.setAttribute('data-revealed', '');
}

/** One shared observer for every reveal on the page (threshold 0.15, plays once). */
function getObserver(): IntersectionObserver {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        observer?.unobserve(el);
        const reg = registry.get(el);
        registry.delete(el);
        markRevealed(el);
        if (!reg) continue;
        if (reg.kind === 'drop') playDrop(el, reg.delay());
        else playThump(el, reg.delay());
      }
    },
    { threshold: 0.15 },
  );
  return observer;
}

/** Start watching `el`; returns a cleanup. With `animate: false` it is shown immediately. */
export function observeReveal(
  el: Element,
  kind: RevealKind,
  delay: () => number,
  animate: boolean,
): () => void {
  if (el.hasAttribute('data-revealed')) return () => undefined;
  if (!animate || typeof IntersectionObserver === 'undefined') {
    markRevealed(el);
    return () => undefined;
  }
  registry.set(el, { kind, delay });
  const io = getObserver();
  io.observe(el);
  return () => {
    registry.delete(el);
    io.unobserve(el);
  };
}
