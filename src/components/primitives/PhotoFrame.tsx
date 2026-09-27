import type { CSSProperties } from 'react';
import type { ImageSlot } from '../../content/types';
import { EVIDENCE_COPY } from '../../content/profile';
import { fallbackWidth, frameLayout, srcSet } from '../../lib/images';
import { PaperClip } from './PaperClip';
import styles from './PhotoFrame.module.css';

export type PhotoVariant = 'portrait' | 'evidence' | 'cover' | 'history';

interface PhotoFrameProps {
  slot: ImageSlot;
  variant: PhotoVariant;
  caption?: string;
  clip?: boolean;
  /** `sizes` hint for the real image. */
  sizes?: string;
  /** Load eagerly (the hero portrait is above the fold). */
  eager?: boolean;
  /** Render only phrasing elements (for use inside a `<button>`). */
  inline?: boolean;
  className?: string;
  /** Per-instance custom properties (rotation, flex sizing). */
  style?: CSSProperties;
}

/**
 * A photo mounted on paper: the real image once the owner supplies it, otherwise the design's
 * striped "IMAGE PLACEHOLDER" with its description.
 */
export function PhotoFrame({
  slot,
  variant,
  caption,
  clip,
  sizes = '(min-width: 760px) 40vw, 90vw',
  eager,
  inline,
  className,
  style,
}: PhotoFrameProps) {
  const layout = frameLayout(slot.ratio);
  const [w, h] = slot.ratio;
  const widths = slot.widths ?? [];
  const Box = inline ? 'span' : 'div';
  const Tag = caption && !inline ? 'figure' : Box;
  return (
    <Tag className={`${styles.frame} ${styles[variant]} ${className ?? ''}`} style={style}>
      {clip && <PaperClip variant={variant === 'portrait' ? 'portrait' : 'evidence'} />}
      <Box className={styles.mount}>
        {slot.src ? (
          <picture>
            <source type="image/avif" srcSet={srcSet(slot.src, widths, 'avif')} sizes={sizes} />
            <source type="image/webp" srcSet={srcSet(slot.src, widths, 'webp')} sizes={sizes} />
            <img
              className={styles.img}
              src={`/images/${slot.src}-${fallbackWidth(widths)}.webp`}
              alt={slot.alt ?? slot.label}
              width={w * 100}
              height={h * 100}
              style={{ '--aspect': layout.aspect }}
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
            />
          </picture>
        ) : (
          <Box className={styles.placeholder} style={{ '--aspect': layout.aspect }}>
            <Box className={styles.phTitle}>{EVIDENCE_COPY.imagePlaceholder}</Box>
            <Box className={styles.phLabel}>{slot.label}</Box>
          </Box>
        )}
        {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
      </Box>
    </Tag>
  );
}
