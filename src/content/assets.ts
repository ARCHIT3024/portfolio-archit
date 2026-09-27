import { OWNER_LINKS, PROCESSED_IMAGES } from './assets.generated';
import type { ImageSlot } from './types';

/**
 * Attach the processed image `name` to a slot once `npm run images` has produced it. Until then
 * the slot stays a placeholder. Alt text defaults to the placeholder description minus its
 * ratio note ("…, 16:10 screenshot").
 */
export function withImage(name: string, slot: ImageSlot): ImageSlot {
  const widths = PROCESSED_IMAGES[name];
  if (!widths?.length) return slot;
  return { ...slot, src: name, widths, alt: slot.alt ?? slot.label.replace(/,\s*\d+:\d+.*$/, '') };
}

/** An owner-supplied value from raw-assets/links.md, or null while it's missing. */
export function ownerLink(key: string): string | null {
  return OWNER_LINKS[key] ?? null;
}
