import { useCallback, useRef, type RefObject } from 'react';
import { BOARD } from '../../config';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useScrollProgress } from '../../hooks/useScrollProgress';
import styles from './RedString.module.css';

/** The string's route between the four pushpins, in board-canvas coordinates. */
const PATH = 'M264 56 Q576 150 888 24 Q560 330 312 548 Q612 650 912 584';
const LENGTH = 1000;

/** Red string that draws itself as the board scrolls into view (board mode only). */
export function RedString({ boardRef }: { boardRef: RefObject<HTMLElement | null> }) {
  const reduced = useReducedMotion();
  const shadowRef = useRef<SVGPathElement>(null);
  const stringRef = useRef<SVGPathElement>(null);

  const apply = useCallback((t: number) => {
    const offset = String(LENGTH * (1 - t));
    if (shadowRef.current) shadowRef.current.style.strokeDashoffset = offset;
    if (stringRef.current) stringRef.current.style.strokeDashoffset = offset;
  }, []);

  useScrollProgress(boardRef, apply, { active: true, reduced });

  return (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${BOARD.width} ${BOARD.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        ref={shadowRef}
        className={styles.shadow}
        d={PATH}
        pathLength={LENGTH}
        transform="translate(2 5)"
      />
      <path ref={stringRef} className={styles.string} d={PATH} pathLength={LENGTH} />
    </svg>
  );
}
