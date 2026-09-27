import 'react';

declare module 'react' {
  interface CSSProperties {
    /** Per-item design values (rotation, position, delay) go through CSS custom properties. */
    [key: `--${string}`]: string | number | undefined;
  }
}
