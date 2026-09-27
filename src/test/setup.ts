import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

// Function tests run in the node environment; everything below is for jsdom only.
if (typeof window !== 'undefined') {
  const { cleanup } = await import('@testing-library/react');
  afterEach(() => cleanup());

  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList;
  }

  class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal('IntersectionObserver', NoopObserver);
  vi.stubGlobal('ResizeObserver', NoopObserver);

  if (!Element.prototype.animate) {
    Element.prototype.animate = function animate() {
      return {
        finished: Promise.resolve(),
        cancel: () => undefined,
        onfinish: null,
      } as unknown as Animation;
    };
  }
  if (!Element.prototype.getAnimations) Element.prototype.getAnimations = () => [];
  window.scrollTo = () => undefined;
}
