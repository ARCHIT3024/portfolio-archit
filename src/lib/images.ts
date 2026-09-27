import type { Ratio } from '../content/types';

/** Rotations for the three evidence photos in an open folder. */
export const EVIDENCE_ROT = [-1.2, 1, -0.6] as const;

/**
 * Frame layout for a photo of a given aspect ratio — the port of the prototype's `img()`.
 * `grow` feeds `flex-grow` so the three photos share a row by aspect ratio; `coverWidth`
 * is the photo width on a board card.
 */
export function frameLayout(ratio: Ratio) {
  const [w, h] = ratio;
  return {
    aspect: `${w} / ${h}`,
    grow: Number((w / h).toFixed(3)),
    minWidth: w < h ? '120px' : '200px',
    coverWidth: w === h ? '62%' : w < h ? '50%' : '82%',
  };
}

/** `srcset` for a processed image in /images, e.g. `/images/portrait-960.avif 960w, …`. */
export function srcSet(base: string, widths: readonly number[], format: 'avif' | 'webp'): string {
  return widths.map((w) => `/images/${base}-${w}.${format} ${w}w`).join(', ');
}

/** The fallback `src`: the largest width up to 960. */
export function fallbackWidth(widths: readonly number[]): number {
  return widths.filter((w) => w <= 960).at(-1) ?? widths[0] ?? 960;
}
